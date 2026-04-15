const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { authenticate } = require('../middleware/authMiddleware');
const { uploadChatMedia } = require('../middleware/uploadMiddleware');
const { messageLimiter, chatMediaUploadLimiter } = require('../middleware/rateLimiter');

// All routes are protected
router.use(authenticate);

/**
 * POST /api/messages          – send a message     (30/min)
 * POST /api/messages/upload   – upload chat media  (10/hr)
 * GET  /api/messages/:chatId  – fetch messages for a chat
 */
router.post('/', messageLimiter, messageController.sendMessage);
router.post('/upload', chatMediaUploadLimiter, uploadChatMedia.single('media'), messageController.uploadChatImage);
router.get('/:chatId', messageController.getMessages);

module.exports = router;
