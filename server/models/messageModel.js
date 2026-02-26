const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  chat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true,
    index: true
  },

  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // Primary text content
  content: {
    type: String,
    trim: true,
    default: ''
  },

  // Unified message type
  type: {
    type: String,
    enum: ['text', 'image', 'video', 'file', 'post'],
    default: 'text'
  },

  // Media URL (Cloudinary URL for images/videos)
  mediaUrl: {
    type: String,
    default: ''
  },

  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  },

  readBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  // Soft-delete: users who deleted this message for themselves
  deletedFor: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  isEdited: {
    type: Boolean,
    default: false
  },

  isDeleted: {
    type: Boolean,
    default: false
  }

}, { timestamps: true });

// Compound index for efficient, sorted pagination by chat
messageSchema.index({ chat: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
