const faceapi = require('face-api.js');
const User = require('../models/User');
const cloudinary = require("cloudinary");

// Placeholder: Add model loading logic here or in server.js
// (async () => {
//   await faceapi.nets.ssdMobilenetv1.loadFromDisk('./models');
//   await faceapi.nets.faceLandmark68Net.loadFromDisk('./models');
//   await faceapi.nets.faceRecognitionNet.loadFromDisk('./models');
// })();

exports.register = async (req, res) => {
  const { name, email, phone, branch, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }
    user = await User.create({
      name,
      email,
      phone,
      branch,
      password,
    });
    const token = await user.generateToken();

    const options = {
      expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      httpOnly: true,
    };

    res.status(201).cookie("token", token, options).json({
      success: true,
      user,
      token,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email })
      .select("+password");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User does not exist",
      });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Incorrect password",
      });
    }

    const token = await user.generateToken();

    const options = {
      expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      httpOnly: true,
    };

    res.status(200).cookie("token", token, options).json({
      success: true,
      user,
      token,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.logout = async (req, res) => {
  try {
    res
      .status(200)
      .cookie("token", null, { expires: new Date(Date.now()), httpOnly: true })
      .json({
        success: true,
        message: "Logged out",
      });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.profilePicUpload = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user.avatar.public_id) {
      await cloudinary.v2.uploader.destroy(user.avatar.public_id);
    }
    const myCloud = await cloudinary.v2.uploader.upload(req.body.image, {
      folder: "users",
    });
    user.avatar.url = myCloud.secure_url;
    user.avatar.public_id = myCloud.public_id;
    await user.save();

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}


exports.followUser = async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.id);
    const loggedInUser = await User.findById(req.user._id);

    if (!userToFollow) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (loggedInUser.following.includes(userToFollow._id)) {
      const indexfollowing = loggedInUser.following.indexOf(userToFollow._id);
      const indexfollowers = userToFollow.followers.indexOf(loggedInUser._id);

      loggedInUser.following.splice(indexfollowing, 1);
      userToFollow.followers.splice(indexfollowers, 1);

      await loggedInUser.save();
      await userToFollow.save();

      res.status(200).json({
        success: true,
        message: "User Unfollowed",
      });
    } else {
      loggedInUser.following.push(userToFollow._id);
      userToFollow.followers.push(loggedInUser._id);

      await loggedInUser.save();
      await userToFollow.save();

      res.status(200).json({
        success: true,
        message: "User followed",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
exports.followstatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const loggedInUser = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    if (loggedInUser.following.includes(user._id)) {
      res.status(200).json({
        success: true,
        message: true,
      });
    } else {
      res.status(200).json({
        success: true,
        message: false
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

exports.addbio = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    user.bio = req.body.bio;
    await user.save();
    res.status(200).json({
      success: true,
      message: "Bio added",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

const compareFaceData = (storedFaceData, inputFaceData) => {
  if (storedFaceData.length !== inputFaceData.length) {
    throw new Error("Face data length mismatch");
  }
  const distance = faceapi.euclideanDistance(storedFaceData, inputFaceData);
  return distance < 0.6;
};

/**
 * @route   POST /api/auth/face-register
 * @desc    Save face descriptor for the logged-in user
 * @access  Private (requires authMiddleware)
 */
exports.registerUser = async (req, res) => {
  // faceData should be an array of numbers from the frontend
  const { faceData } = req.body; 
  const userId = req.user._id; // User ID from authMiddleware

  if (!faceData || !Array.isArray(faceData) || faceData.length !== 128) {
    return res.status(400).json({ success: false, message: 'Valid face data (128 numbers array) is required' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Overwrite existing face data with the new one
    user.faceData = faceData; 
    await user.save();

    console.log(`Face data saved for user: ${user.email}`);
    res.status(200).json({ success: true, message: 'Face data registered successfully' });

  } catch (err) {
    console.error("Error saving face data:", err);
    res.status(500).json({ success: false, message: 'Server error while saving face data' });
  }
};

// Helper function to calculate Euclidean distance
const calculateDistance = (desc1, desc2) => {
    // Ensure both are arrays of numbers and have the same length (128)
    if (!desc1 || !desc2 || desc1.length !== 128 || desc2.length !== 128) {
        console.error("Invalid descriptors for distance calculation:", desc1?.length, desc2?.length);
        return Infinity; // Return a large distance if data is invalid
    }
    try {
        // Note: Using face-api.js requires models to be loaded in backend.
        // If not loaded, this will likely throw an error or use a fallback.
        // Converting plain arrays to Float32Array for face-api.js
        return faceapi.euclideanDistance(new Float32Array(desc1), new Float32Array(desc2));
    } catch (e) {
        console.warn("Face-api distance calculation failed (models likely not loaded in backend). Using manual fallback.", e);
        let sumOfSquares = 0;
        for (let i = 0; i < 128; i++) {
            sumOfSquares += Math.pow(desc1[i] - desc2[i], 2);
        }
        return Math.sqrt(sumOfSquares);
    }
};

/**
 * @route   POST /api/auth/face-login
 * @desc    Login user using email and face descriptor
 * @access  Public
 */
exports.loginUser = async (req, res) => {
  const { email, faceDescriptor } = req.body;

  if (!email) {
     return res.status(400).json({ success: false, message: 'Email is required' });
  }
  if (!faceDescriptor || !Array.isArray(faceDescriptor) || faceDescriptor.length !== 128) {
    return res.status(400).json({ success: false, message: 'Valid face descriptor (128 numbers array) is required' });
  }

  try {
    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User with this email not found.' });
    }

    // Check if user has face data registered
    if (!user.faceData || user.faceData.length !== 128) {
       return res.status(400).json({ success: false, message: 'Face data not registered for this user. Please register your face first.' });
    }

    // Compare the face data
    const storedDescriptor = user.faceData;
    const distance = calculateDistance(storedDescriptor, faceDescriptor);
    const FACE_MATCH_THRESHOLD = 0.6; // Threshold for face match

    console.log(`Comparing face for ${user.email}. Distance: ${distance}`);

    if (distance < FACE_MATCH_THRESHOLD) {
      // Face matched - Login successful
      console.log(`Face match successful for ${user.email}`);
      
      const token = await user.generateToken();
      const options = {
          expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
          httpOnly: true,
          // secure: process.env.NODE_ENV === 'production', // Enable in production with HTTPS
          // sameSite: 'Lax' 
      };
      
      // Prepare user data to send back (exclude sensitive info)
      const userResponse = user.toObject();
      delete userResponse.password;
      delete userResponse.faceData; // Don't send face data back

      res.status(200).cookie("token", token, options).json({
          success: true,
          user: userResponse, 
          token,
      });
    } else {
      // Face did not match
      console.log(`Face match failed for ${user.email}. Distance: ${distance}`);
      res.status(401).json({ success: false, message: 'Face not recognized.' });
    }

  } catch (err) {
    console.error("Error during face login:", err);
    res.status(500).json({ success: false, message: 'Server error during face login' });
  }
};

