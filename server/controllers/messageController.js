const Message = require('../models/messageModel');
const Chat = require('../models/chatModel');

/**
 * @desc    Send a message (text or image)
 * @route   POST /api/messages
 * @access  Private
 */
exports.sendMessage = async (req, res) => {
  try {
    const { chatId, content, type, postId, mediaUrl } = req.body;

    if (!chatId || (!content && !postId && !mediaUrl)) {
      return res.status(400).json({
        success: false,
        message: 'chatId and at least one of content, postId, or mediaUrl are required'
      });
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    // Determine receiver for 1-on-1 chats
    let receiverId = null;
    if (!chat.isGroup) {
      receiverId = chat.participants.find(p => p.toString() !== req.user.id.toString());
    }

    const resolvedType = type || (mediaUrl ? 'image' : 'text');

    const newMessage = new Message({
      sender: req.user.id,
      receiver: receiverId,
      chat: chatId,
      content: content || '',
      type: resolvedType,
      post: postId,
      mediaUrl: mediaUrl || ''
    });

    await newMessage.save();

    // Update last message on chat
    chat.lastMessage = newMessage._id;

    // Increment unread counts for other participants
    chat.participants.forEach(p => {
      if (p.toString() !== req.user.id.toString()) {
        const uc = chat.unreadCounts.find(u => u.user.toString() === p.toString());
        if (uc) {
          uc.count += 1;
        } else {
          chat.unreadCounts.push({ user: p, count: 1 });
        }
      }
    });

    // Reappear chat for all (clear hiddenBy)
    chat.hiddenBy = [];

    await chat.save();

    const populatedMessage = await Message.findById(newMessage._id)
      .populate('sender', 'name username profilePicture')
      .populate({
        path: 'post',
        populate: { path: 'author', select: 'name username profilePicture' }
      });

    // Emit real-time event
    if (req.io) {
      req.io.to(chatId).emit('new_message', populatedMessage);
    }

    res.status(201).json({ success: true, data: populatedMessage });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


/**
 * @desc    Upload a chat image to Cloudinary
 * @route   POST /api/messages/upload
 * @access  Private
 */
exports.uploadChatImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image' });
    }

    res.status(200).json({ success: true, mediaUrl: req.file.path });
  } catch (error) {
    console.error('Chat image upload error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


/**
 * @desc    Get messages for a chat (paginated, oldest first)
 * @route   GET /api/messages/:chatId
 * @access  Private
 */
exports.getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 50);

    const messages = await Message.find({
      chat: chatId,
      deletedFor: { $ne: req.user.id }
    })
      .populate('sender', 'name username profilePicture')
      .populate({
        path: 'post',
        populate: { path: 'author', select: 'name username profilePicture' }
      })
      .sort({ createdAt: 1 }) // Ascending — oldest first, no need to reverse
      .skip((page - 1) * limit)
      .limit(limit);

    // Clear unread count for this user once they open the chat
    await Chat.updateOne(
      { _id: chatId, 'unreadCounts.user': req.user.id },
      { $set: { 'unreadCounts.$.count': 0 } }
    );

    res.status(200).json({
      success: true,
      data: messages,
      page
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
