const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, deleteNotification, clearAllNotifications } = require('../controllers/notificationController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

router.get('/', getNotifications);
router.patch('/mark-read', markAsRead);
router.delete('/clear-all', clearAllNotifications);
router.delete('/:id', deleteNotification);

module.exports = router;
