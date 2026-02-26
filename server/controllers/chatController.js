const Chat = require('../models/chatModel');
const User = require('../models/userModel');

/**
 * @desc    Create or get a 1-on-1 chat
 * @route   POST /api/chats
 * @access  Private
 */
exports.createOrGetChat = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    // Check if chat already exists
    let chat = await Chat.findOne({
      isGroup: false,
      participants: { $all: [req.user.id, userId] }
    }).populate('participants', 'name username profilePicture isVerified');

    if (chat) {
      return res.status(200).json({ success: true, data: chat });
    }

    // Create new chat
    const newChat = new Chat({
      isGroup: false,
      participants: [req.user.id, userId]
    });

    await newChat.save();
    
    chat = await Chat.findById(newChat._id).populate('participants', 'name username profilePicture isVerified');

    res.status(201).json({ success: true, data: chat });
  } catch (error) {
    console.error('Create or get chat error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Get all chats for a user
 * @route   GET /api/chats
 * @access  Private
 */
exports.getUserChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: { $in: [req.user.id] },
      hiddenBy: { $ne: req.user.id }
    })
      .populate('participants', 'name username profilePicture isVerified')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });

    res.status(200).json({ success: true, data: chats });
  } catch (error) {
    console.error('Get user chats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Hide a chat for the current user
 * @route   DELETE /api/chats/:chatId
 * @access  Private
 */
exports.hideChat = async (req, res) => {
  try {
    const { chatId } = req.params;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    // Authorization: only participants can hide the chat
    const isParticipant = chat.participants.some(p => p.toString() === req.user.id.toString());
    if (!isParticipant) {
      return res.status(403).json({ success: false, message: 'You are not a participant in this chat' });
    }

    // Add user to hiddenBy if not already there
    if (!chat.hiddenBy.includes(req.user.id)) {
      chat.hiddenBy.push(req.user.id);
      await chat.save();
    }

    res.status(200).json({ success: true, message: 'Chat hidden successfully' });
  } catch (error) {
    console.error('Hide chat error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
