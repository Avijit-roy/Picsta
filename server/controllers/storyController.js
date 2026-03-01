const Story = require('../models/storyModel');
const User = require('../models/userModel');
const { cloudinary } = require('../middleware/uploadMiddleware');

/**
 * @desc    Get active stories grouped by user
 * @route   GET /api/stories
 * @access  Private
 */
exports.getActiveStories = async (req, res, next) => {
  try {
    // Basic implementation: fetch stories from past 24h
    // The TTL index will handle deletion, but just in case, query for recent ones
    const activeTime = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    // Find all active stories
    const stories = await Story.find({ createdAt: { $gt: activeTime } })
      .populate('user', 'name username profilePicture')
      .sort({ createdAt: 1 });

    // Group stories by user
    const groupedStoriesMap = new Map();

    stories.forEach(story => {
      const userId = story.user._id.toString();
      if (!groupedStoriesMap.has(userId)) {
        groupedStoriesMap.set(userId, {
          user: story.user,
          stories: []
        });
      }
      groupedStoriesMap.get(userId).stories.push(story);
    });

    const groupedStories = Array.from(groupedStoriesMap.values());

    res.status(200).json({
      success: true,
      data: groupedStories
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new story
 * @route   POST /api/stories
 * @access  Private
 */
exports.createStory = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload media (image or video)' });
    }

    const { mimetype, path } = req.file;
    const mediaType = mimetype.startsWith('video') ? 'video' : 'image';

    const story = await Story.create({
      user: req.user.id,
      mediaUrl: path,
      mediaType: mediaType
    });

    const populatedStory = await Story.findById(story._id).populate('user', 'name username profilePicture');

    res.status(201).json({
      success: true,
      data: populatedStory
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark story as viewed
 * @route   POST /api/stories/:id/view
 * @access  Private
 */
exports.markAsViewed = async (req, res, next) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) {
      return res.status(404).json({ success: false, message: 'Story not found' });
    }

    // Don't add owner to viewers list
    if (story.user.toString() === req.user.id) {
      return res.status(200).json({ success: true, message: 'Owner view not recorded' });
    }

    // Add user to viewers array uniquely
    await Story.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { viewers: req.user.id } }
    );

    res.status(200).json({
      success: true,
      message: 'Story marked as viewed'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a story
 * @route   DELETE /api/stories/:id
 * @access  Private
 */
exports.deleteStory = async (req, res, next) => {
  try {
    const story = await Story.findById(req.params.id);

    if (!story) {
      return res.status(404).json({ success: false, message: 'Story not found' });
    }

    // Ensure user owns the story
    if (story.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this story' });
    }

    // Delete media from Cloudinary
    if (story.mediaUrl) {
      const publicIdMatch = story.mediaUrl.match(/\/v\d+\/([a-zA-Z0-9_\-/]+)\./);
      if (publicIdMatch && publicIdMatch[1]) {
        try {
          await cloudinary.uploader.destroy(publicIdMatch[1], {
            resource_type: story.mediaType === 'video' ? 'video' : 'image'
          });
        } catch (err) {
          console.error("Cloudinary story deletion error:", err);
        }
      }
    }

    await story.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Story deleted'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get detailed list of viewers for a story
 * @route   GET /api/stories/:id/viewers
 * @access  Private (Owner only)
 */
exports.getStoryViewers = async (req, res, next) => {
  try {
    const story = await Story.findById(req.params.id)
      .populate('viewers', 'name username profilePicture');

    if (!story) {
      return res.status(404).json({ success: false, message: 'Story not found' });
    }

    // Ensure only the story owner can see the detailed viewer list
    if (story.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to see viewers list' });
    }

    // Ensure uniqueness (in case of legacy duplicates)
    const uniqueViewers = [];
    const seenIds = new Set();
    
    story.viewers.forEach(viewer => {
      const id = viewer._id.toString();
      if (!seenIds.has(id)) {
        seenIds.add(id);
        uniqueViewers.push(viewer);
      }
    });

    res.status(200).json({
      success: true,
      data: uniqueViewers
    });
  } catch (error) {
    next(error);
  }
};
