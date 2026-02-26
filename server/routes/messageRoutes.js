const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { authenticate } = require('../middleware/authMiddleware');
const { uploadChatMedia } = require('../middleware/uploadMiddleware');

// All routes are protected
router.use(authenticate);

router.post('/', messageController.sendMessage);
router.post('/upload', uploadChatMedia.single('media'), messageController.uploadChatImage);
router.get('/:chatId', messageController.getMessages);

module.exports = router;

