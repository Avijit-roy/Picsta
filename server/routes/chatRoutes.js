const express = require('express');
const router = express.Router();
const { createOrGetChat, getUserChats, hideChat } = require('../controllers/chatController');
const { authenticate } = require('../middleware/authMiddleware');
const { createChatLimiter } = require('../middleware/rateLimiter');

// All routes are protected
router.use(authenticate);

/**
 * POST /api/chats        – create or get a chat  (30/min)
 * GET  /api/chats        – get all user chats
 * DELETE /api/chats/:id  – hide / delete a chat
 */
router.post('/', createChatLimiter, createOrGetChat);
router.get('/', getUserChats);
router.delete('/:chatId', hideChat);

module.exports = router;
