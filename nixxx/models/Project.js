const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  documentation: String,

  category: String,

  file: {
    public_id: String,
    url: String,
  },
  image: {
    public_id: String,
    url: String,
  },

  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
  link: {
    type: String,
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  premium: {
    type: Boolean,
    default: false
  },
  comments: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      comment: {
        type: String,
        required: true,
      },
      likes: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      replies: [
        {
          user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
          },
          text: {
            type: String,
            required: true
          },
          createdAt: {
            type: Date,
            default: Date.now
          }
        }
      ],
      createdAt: {
        type: Date,
        default: Date.now,
      }
    },
  ],
});

module.exports = mongoose.model("Project", ProjectSchema);
