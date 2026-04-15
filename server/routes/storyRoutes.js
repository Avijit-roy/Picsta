const express = require('express');
const router = express.Router();
const storyController = require('../controllers/storyController');
const { authenticate } = require('../middleware/authMiddleware');
const { uploadStory } = require('../middleware/uploadMiddleware');
const { createStoryLimiter, storyViewLimiter } = require('../middleware/rateLimiter');

// All story routes require authentication
router.use(authenticate);

/**
 * GET  /api/stories  – get active stories grouped by user
 * POST /api/stories  – create a new story (10/hr)
 */
router.get('/', storyController.getActiveStories);
router.post('/', createStoryLimiter, uploadStory.single('media'), storyController.createStory);

/**
 * POST   /api/stories/:id/view  – mark story as viewed (120/min)
 * DELETE /api/stories/:id       – delete a story
 * GET    /api/stories/:id/viewers – get story viewers
 */
router.post('/:id/view', storyViewLimiter, storyController.markAsViewed);
router.delete('/:id', storyController.deleteStory);
router.get('/:id/viewers', storyController.getStoryViewers);

module.exports = router;
