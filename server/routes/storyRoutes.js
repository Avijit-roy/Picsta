const express = require('express');
const router = express.Router();
const storyController = require('../controllers/storyController');
const { authenticate } = require('../middleware/authMiddleware');
const { uploadStory } = require('../middleware/uploadMiddleware');

// All story routes require authentication
router.use(authenticate);

// Get active stories grouped by user
router.get('/', storyController.getActiveStories);

// Create a new story
router.post('/', uploadStory.single('media'), storyController.createStory);

// Mark story as viewed
router.post('/:id/view', storyController.markAsViewed);

// Delete a story
router.delete('/:id', storyController.deleteStory);

// Get story viewers
router.get('/:id/viewers', storyController.getStoryViewers);

module.exports = router;
