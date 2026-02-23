const Message = require('../models/messageModel');
const Chat = require('../models/chatModel');

/**
 * @desc    Send a message
 * @route   POST /api/messages
 * @access  Private
 */
exports.sendMessage = async (req, res) => {
  try {
    const { chatId, content, type = 'text', postId } = req.body;

    if (!chatId || (!content && !postId)) {
      return res.status(400).json({ success: false, message: 'Chat ID and content/postId are required' });
    }

    const newMessage = new Message({
      sender: req.user.id,
      chat: chatId,
      content,
      type,
      post: postId
    });

    await newMessage.save();

    // Update last message in chat and increment unread counts for others
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    chat.lastMessage = newMessage._id;
    
    // Increment unread counts for all participants except sender
    chat.unreadCounts = chat.unreadCounts.map(uc => {
      if (uc.user.toString() !== req.user.id.toString()) {
        return { ...uc, count: uc.count + 1 };
      }
      return uc;
    });

    // If a participant doesn't have an unreadCount entry yet, add it
    chat.participants.forEach(p => {
      if (p.toString() !== req.user.id.toString() && !chat.unreadCounts.find(uc => uc.user.toString() === p.toString())) {
        chat.unreadCounts.push({ user: p, count: 1 });
      }
    });

    // Clear hiddenBy array so chat reappears for everyone
    chat.hiddenBy = [];

    await chat.save();

    const populatedMessage = await Message.findById(newMessage._id)
      .populate('sender', 'name username profilePicture')
      .populate({
        path: 'post',
        populate: {
          path: 'author',
          select: 'name username profilePicture'
        }
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
 * @desc    Get messages for a chat
 * @route   GET /api/messages/:chatId
 * @access  Private
 */
exports.getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const messages = await Message.find({ chat: chatId, deletedFor: { $ne: req.user.id } })
      .populate('sender', 'name username profilePicture')
      .populate({
        path: 'post',
        populate: {
          path: 'author',
          select: 'name username profilePicture'
        }
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    // Clear unread count for this user when they fetch messages
    await Chat.updateOne(
      { _id: chatId, 'unreadCounts.user': req.user.id },
      { $set: { 'unreadCounts.$.count': 0 } }
    );

    res.status(200).json({ 
      success: true, 
      data: messages.reverse(),
      page: Number(page)
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
