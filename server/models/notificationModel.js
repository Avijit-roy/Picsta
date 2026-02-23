const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  type: {
    type: String,
    enum: ['like', 'comment', 'follow'],
    required: true
  },

  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  },

  comment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  },

  isRead: {
    type: Boolean,
    default: false,
    index: true
  },

  isDeleted: {
    type: Boolean,
    default: false
  }

}, { timestamps: true });


// Efficient fetching: unread first, newest first
notificationSchema.index({ recipient: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
