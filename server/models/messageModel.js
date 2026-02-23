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
    required: true
  },

  content: {
    type: String,
    trim: true
  },
  
  type: {
    type: String,
    enum: ['text', 'image', 'video', 'file', 'post'],
    default: 'text'
  },

  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  },

  mediaUrl: {
    type: String,
    default: ''
  },

  readBy: [{
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


// Efficient pagination
messageSchema.index({ chat: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
