const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { authenticate } = require('../middleware/authMiddleware');

// All routes are protected
router.use(authenticate);

router.post('/', messageController.sendMessage);
router.get('/:chatId', messageController.getMessages);

module.exports = router;
