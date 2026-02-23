const express = require('express');
const router = express.Router();
const { createOrGetChat, getUserChats, hideChat } = require('../controllers/chatController');
const { authenticate } = require('../middleware/authMiddleware');

// All routes are protected
router.use(authenticate);

router.post('/', createOrGetChat);
router.get('/', getUserChats);
router.delete('/:chatId', hideChat);

module.exports = router;
