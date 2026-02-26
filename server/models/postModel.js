const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    caption: {
      type: String,
      trim: true,
      maxlength: 2200
    },

    media: [
      {
        url: {
          type: String,
          required: true
        },
        type: {
          type: String,
          enum: ["image", "video"],
          default: "image"
        },
        thumbnailUrl: {
          type: String
        },
        duration: {
          type: Number
        }
      }
    ],

    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],

    commentsCount: {
      type: Number,
      default: 0
    },

    saves: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],

    location: {
      type: String,
      trim: true
    },

    hashtags: [
      {
        type: String,
        lowercase: true,
        trim: true
      }
    ],

    visibility: {
      type: String,
      enum: ["public", "followers", "private"],
      default: "public"
    },

    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      default: null
    },

    isEdited: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);
