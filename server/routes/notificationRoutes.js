const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  deleteNotification,
  clearAllNotifications,
} = require('../controllers/notificationController');
const { authenticate } = require('../middleware/authMiddleware');

// Note: globalApiLimiter is already applied globally in server.js for all /api/* routes.
// No additional per-route limiter is needed here.
router.use(authenticate);

/**
 * GET    /api/notifications           – fetch notifications  (covered by global limit: 200/15min)
 * PATCH  /api/notifications/mark-read – mark as read         (covered by global limit)
 * DELETE /api/notifications/clear-all – clear all            (covered by global limit)
 * DELETE /api/notifications/:id       – delete one           (covered by global limit)
 */
router.get('/', getNotifications);
router.patch('/mark-read', markAsRead);
router.delete('/clear-all', clearAllNotifications);
router.delete('/:id', deleteNotification);

module.exports = router;
