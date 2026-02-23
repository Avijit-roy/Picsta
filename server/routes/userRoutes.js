const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

// All routes here are protected
router.use(authenticate);

/**
 * @route   GET /api/users/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', userController.getProfile);

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile data
 * @access  Private
 */
router.put('/profile', userController.updateProfile);

/**
 * @route   POST /api/users/profile/profilePicture
 * @desc    Upload user profile picture
 * @access  Private
 */
router.post('/profile/profilePicture', upload.single('profilePicture'), userController.uploadProfilePicture);

/**
 * @route   GET /api/users/check-username/:username
 * @desc    Check username availability
 * @access  Private
 */
/**
 * @route   GET /api/users/u/:username
 * @desc    Get user profile by username
 * @access  Private
 */
router.get('/u/:username', userController.getUserProfileByUsername);

/**
 * @route   GET /api/users/search/:query
 * @desc    Search users by username
 * @access  Private
 */
router.get('/search/:query', userController.searchUsers);

/**
 * @route   POST /api/users/toggle-follow/:id
 * @desc    Toggle follow/unfollow a user
 * @access  Private
 */
router.post('/toggle-follow/:id', userController.toggleFollow);

/**
 * @route   GET /api/users/recent-searches
 * @desc    Get recent searches
 * @access  Private
 */
router.get('/recent-searches', userController.getRecentSearches);

/**
 * @route   DELETE /api/users/recent-searches/:userId
 * @desc    Remove an item from recent searches
 * @access  Private
 */
router.delete('/recent-searches/:userId', userController.removeRecentSearch);

/**
 * @route   DELETE /api/users/recent-searches
 * @desc    Clear all recent searches
 * @access  Private
 */
/**
 * @route   GET /api/users/:id/followers
 * @desc    Get user followers
 * @access  Private
 */
router.get('/:id/followers', userController.getFollowers);

/**
 * @route   GET /api/users/:id/following
 * @desc    Get user following
 * @access  Private
 */
router.get('/:id/following', userController.getFollowing);

module.exports = router;
