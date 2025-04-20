const e = require("express");
const Project = require("../models/Project");
const User = require("../models/User");
const cloudinary = require("cloudinary");

exports.uploadProject = async (req, res) => {
  try {
    const myCloud = await cloudinary.v2.uploader.upload(req.body.image, {
      folder: "posts/image",
    });
    const myCloud1 = await cloudinary.v2.uploader.upload(req.body.file, {
      folder: "posts/file",
      resource_type: "raw" // This is required for non-image files like ZIP
    });

    const newPostData = {
      name: req.body.name,
      documentation: req.body.documentation,
      category: req.body.category,
      link: req.body.link,
      file: {
        public_id: myCloud1.public_id,
        url: myCloud1.secure_url,
      },
      image: {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      },
      owner: req.user,
    };

    const project = await Project.create(newPostData);

    const user = await User.findById(req.user._id);

    user.project.unshift(project._id);
    user.credit += 10;
    await user.save();
    res.status(201).json({
      success: true,
      message: "Project Uploaded",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
exports.getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find();
    res.status(200).json({
      success: true,
      projects,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    await cloudinary.v2.uploader.destroy(project.image.public_id);

    await project.remove();

    const user = await User.findById(req.user._id);

    const index = user.project.indexOf(req.params.id);
    user.project.splice(index, 1);

    await user.save();

    res.status(200).json({
      success: true,
      message: "Project deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.likeAndUnlikePost = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    if (project.likes.includes(req.user._id)) {
      const index = project.likes.indexOf(req.user._id);

      project.likes.splice(index, 1);

      await project.save();

      return res.status(200).json({
        success: true,
        message: "Project Unliked",
      });
    } else {
      project.likes.push(req.user._id);

      await project.save();

      return res.status(200).json({
        success: true,
        message: "project Liked",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.addCredit = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { inr } = req.body;

    user.credit += (inr * 3);
    await user.save();
    res.status(200).json({
      success: true,
      message: "Credit Added",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.makePremium = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    project.premium = !project.premium;
    await project.save();
    res.status(200).json({
      success: true,
      message: "Project updated",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

exports.unlockProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    const user = await User.findById(req.user._id);
    if (project.premium == true) {
      if (user.credit >= 100) {
        user.credit -= 100;
        await user.save();
        res.status(200).json({
          success: true,
          message: "Project unlocked"
        })
      } else {
        res.status(200).json({
          success: false,
          message: "Insufficient credit"
        })
      }

    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

exports.getMyProjects = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const projects = await Project.find({ owner: user._id });
    res.status(200).json({
      success: true,
      projects,
    });
  }
  catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

exports.getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("owner", "name")
      .populate({
        path: "comments",
        populate: [
          { path: "user", select: "name" },
          { path: "likes", select: "name" },
          { 
            path: "replies", 
            populate: { path: "user", select: "name" }
          }
        ]
      });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    res.status(200).json({
      success: true,
      project,
    });
  }
  catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

// exports.getPostOfFollowing = async (req, res) => {
//   try {
//     const user = await User.findById(req.user._id);

//     const posts = await Post.find({
//       owner: {
//         $in: user.following,
//       },
//     }).populate("owner likes comments.user");

//     res.status(200).json({
//       success: true,
//       posts: posts.reverse(),
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// exports.updateCaption = async (req, res) => {
//   try {
//     const post = await Post.findById(req.params.id);

//     if (!post) {
//       return res.status(404).json({
//         success: false,
//         message: "Post not found",
//       });
//     }

//     if (post.owner.toString() !== req.user._id.toString()) {
//       return res.status(401).json({
//         success: false,
//         message: "Unauthorized",
//       });
//     }

//     post.caption = req.body.caption;
//     await post.save();
//     res.status(200).json({
//       success: true,
//       message: "Post updated",
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

exports.commentOnPost = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    let commentIndex = -1;

    // Checking if comment already exists

    project.comments.forEach((item, index) => {
      if (item.user.toString() === req.user._id.toString()) {
        commentIndex = index;
      }
    });

    if (commentIndex !== -1) {
      project.comments[commentIndex].comment = req.body.comment;

      await project.save();

      return res.status(200).json({
        success: true,
        message: "Comment Updated",
      });
    } else {
      project.comments.push({
        user: req.user._id,
        comment: req.body.comment,
      });

      await project.save();
      return res.status(200).json({
        success: true,
        message: "Comment added",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Checking If owner wants to delete

    if (project.owner.toString() === req.user._id.toString()) {
      if (req.body.commentId === undefined) {
        return res.status(400).json({
          success: false,
          message: "Comment Id is required",
        });
      }

      project.comments.forEach((item, index) => {
        if (item._id.toString() === req.body.commentId.toString()) {
          return project.comments.splice(index, 1);
        }
      });

      await project.save();

      return res.status(200).json({
        success: true,
        message: "Selected Comment has deleted",
      });
    } else {
      project.comments.forEach((item, index) => {
        if (item.user.toString() === req.user._id.toString()) {
          return project.comments.splice(index, 1);
        }
      });

      await project.save();

      return res.status(200).json({
        success: true,
        message: "Your Comment has deleted",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.addReplyToComment = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const comment = project.comments.id(req.body.commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    const newReply = {
      user: req.user._id,
      text: req.body.reply, // Ensure frontend sends 'reply' in the body
      createdAt: new Date()
    };

    comment.replies.push(newReply);
    await project.save();

    // Populate the user details for the newly added reply before sending back
    const addedReply = comment.replies[comment.replies.length - 1];
    await addedReply.populate("user", "name");

    res.status(201).json({ success: true, message: "Reply added", reply: addedReply });

  } catch (error) {
    console.error("Error adding reply:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.likeUnlikeComment = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    // Find the comment within the project's comments array
    const comment = project.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    // Initialize likes array if it doesn't exist
    if (!comment.likes) {
        comment.likes = [];
    }

    const userId = req.user._id;
    const userIndex = comment.likes.indexOf(userId);

    if (userIndex === -1) {
      // User hasn't liked the comment yet - Like it
      comment.likes.push(userId);
      await project.save();
      return res.status(200).json({ success: true, message: "Comment Liked" });
    } else {
      // User has already liked the comment - Unlike it
      comment.likes.splice(userIndex, 1);
      await project.save();
      return res.status(200).json({ success: true, message: "Comment Unliked" });
    }
  } catch (error) {
    console.error("Error liking/unliking comment:", error); // Log the error
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteReply = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const comment = project.comments.id(req.body.commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    const replyIndex = comment.replies.findIndex(
      (reply) => reply._id.toString() === req.body.replyId
    );

    if (replyIndex === -1) {
      return res.status(404).json({ success: false, message: "Reply not found" });
    }

    // Check if the user deleting the reply is the owner of the reply or the owner of the project
    const replyToDelete = comment.replies[replyIndex];
    if (replyToDelete.user.toString() !== req.user._id.toString() && project.owner.toString() !== req.user._id.toString()) {
        return res.status(401).json({ success: false, message: "Unauthorized to delete this reply" });
    }

    comment.replies.splice(replyIndex, 1);
    await project.save();

    res.status(200).json({ success: true, message: "Reply deleted" });

  } catch (error) {
    console.error("Error deleting reply:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    // Authorization: Check if the user is the owner
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { name, category, link, documentation } = req.body;

    // Update text fields
    if (name) project.name = name;
    // Allow updating category, link, documentation even if they are empty strings
    project.category = category !== undefined ? category : project.category;
    project.link = link !== undefined ? link : project.link;
    project.documentation = documentation !== undefined ? documentation : project.documentation;


    // Handle image update
    if (req.body.image) {
      // Delete old image from Cloudinary if it exists
      if (project.image && project.image.public_id) {
         try {
             await cloudinary.v2.uploader.destroy(project.image.public_id);
         } catch (destroyError) {
             console.error("Error destroying old image:", destroyError);
             // Decide if you want to proceed or return an error
         }
      }
      // Upload new image
      const myCloud = await cloudinary.v2.uploader.upload(req.body.image, {
        folder: "posts/image",
      });
      project.image = {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      };
    }

    // Handle file update
    if (req.body.file) {
      // Delete old file from Cloudinary if it exists
      if (project.file && project.file.public_id) {
        try {
            // Important: Specify resource_type for non-image deletion
            await cloudinary.v2.uploader.destroy(project.file.public_id, { resource_type: 'raw' });
        } catch (destroyError) {
             console.error("Error destroying old file:", destroyError);
             // Decide if you want to proceed or return an error
         }
      }
      // Upload new file
      const myCloud1 = await cloudinary.v2.uploader.upload(req.body.file, {
        folder: "posts/file",
        resource_type: "raw"
      });
      project.file = {
        public_id: myCloud1.public_id,
        url: myCloud1.secure_url,
      };
    }

    await project.save();

    res.status(200).json({ success: true, message: "Project updated successfully", project });

  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};