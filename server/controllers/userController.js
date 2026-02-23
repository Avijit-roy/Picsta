const User = require('../models/userModel');
const Notification = require('../models/notificationModel');
const cloudinary = require('cloudinary').v2;
const path = require('path');

/**
 * @desc    Update user profile data
 * @route   PUT /api/users/profile
 * @access  Private
 */
exports.updateProfile = async (req, res, next) => {
  try {
    let { name, username, bio, dob, gender } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Trim and sanitize inputs
    if (name) name = name.trim().toLowerCase();
    if (bio) {
      bio = bio.trim().replace(/<[^>]*>?/gm, ''); // Basic HTML tag strip
    }

    // Update fields if provided
    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (dob) user.dob = dob;
    if (gender) user.gender = gender;

    // Handle username change and normalization
    if (username) {
      username = username.trim().toLowerCase();
      if (!username.startsWith('@')) {
        username = '@' + username;
      }

      if (username !== user.username) {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
          return res.status(409).json({ success: false, message: 'Username already taken' });
        }
        user.username = username;
      }
    }

    await user.save();

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        bio: user.bio,
        profilePicture: user.profilePicture,
        dob: user.dob,
        gender: user.gender,
        postsCount: user.postsCount,
        followersCount: user.followers.length,
        followingCount: user.following.length
      }
    });
  } catch (error) {
    next(error); // Pass to global error handler to get specific validation messages
  }
};

/**
 * Helper to extract Cloudinary Public ID from URL
 */
const extractPublicId = (url) => {
  if (!url || !url.includes('cloudinary.com')) return null;
  // Format: https://res.cloudinary.com/cloud_name/image/upload/v123456789/folder/public_id.jpg
  const parts = url.split('/');
  const lastPart = parts[parts.length - 1]; // public_id.jpg
  const folderPart = parts[parts.length - 2]; // folder (if exists)
  
  const publicIdWithExtension = lastPart.split('.')[0];
  
  // If there's a folder (like 'picsta_profiles'), include it
  if (url.includes('picsta_profiles')) {
    return `picsta_profiles/${publicIdWithExtension}`;
  }
  
  return publicIdWithExtension;
};

/**
 * @desc    Upload user profile picture
 * @route   POST /api/users/profile/profilePicture
 * @access  Private
 */
exports.uploadProfilePicture = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a file' });
    }

    const userId = req.user.id;
    const profilePictureUrl = req.file.path;

    // Destroy old image if it exists
    const user = await User.findById(userId);
    if (user && user.profilePicture) {
      const publicId = extractPublicId(user.profilePicture);
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId);
          console.log(`Destroyed old Cloudinary asset: ${publicId}`);
        } catch (destroyError) {
          console.error(`Failed to destroy old Cloudinary asset: ${publicId}`, destroyError);
        }
      }
    }

    user.profilePicture = profilePictureUrl;
    await user.save();

    res.status(200).json({
      success: true,
      profilePicture: profilePictureUrl
    });
  } catch (error) {
    next(error);
  }
};
/**
 * @desc    Get current user profile
 * @route   GET /api/users/profile
 * @access  Private
 */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isFollowing = user.followers?.includes(req.user.id) || false;

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        bio: user.bio,
        profilePicture: user.profilePicture,
        dob: user.dob,
        gender: user.gender,
        postsCount: user.postsCount || 0,
        followersCount: user.followers?.length || 0,
        followingCount: user.following?.length || 0,
        isFollowing
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Check username availability
 * @route   GET /api/users/check-username/:username
 * @access  Private
 */
exports.checkUsername = async (req, res) => {
  try {
    let { username } = req.params;
    username = username.toLowerCase().trim();
    if (!username.startsWith('@')) {
      username = '@' + username;
    }

    // Find if username exists, excluding the current user
    const existingUser = await User.findOne({ 
      username, 
      _id: { $ne: req.user.id } 
    });

    res.status(200).json({
      success: true,
      available: !existingUser,
      message: existingUser ? 'Username is already taken' : 'Username is available'
    });
  } catch (error) {
    console.error('Check username error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
/**
 * @desc    Get user profile by username
 * @route   GET /api/users/:username
 * @access  Private
 */
exports.getUserProfileByUsername = async (req, res) => {
  try {
    let { username } = req.params;
    username = username.toLowerCase().trim();
    if (!username.startsWith('@')) {
      username = '@' + username;
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isFollowing = user.followers?.includes(req.user.id) || false;

    // Record this visit in recent search if not self
    if (user._id.toString() !== req.user.id) {
      try {
        // Move to front if exists, then slice to 5
        await User.findByIdAndUpdate(req.user.id, {
          $pull: { recentSearches: user._id }
        });
        await User.findByIdAndUpdate(req.user.id, {
          $push: {
            recentSearches: {
              $each: [user._id],
              $position: 0,
              $slice: 5
            }
          }
        });
      } catch (err) {
        console.error('Error updating recent searches:', err);
      }
    }

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        username: user.username,
        bio: user.bio,
        profilePicture: user.profilePicture,
        postsCount: user.postsCount || 0,
        followersCount: user.followers?.length || 0,
        followingCount: user.following?.length || 0,
        isVerified: user.isVerified || false,
        isFollowing
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Toggle follow/unfollow a user
 * @route   POST /api/users/toggle-follow/:id
 * @access  Private
 */
exports.toggleFollow = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user.id;

    if (targetUserId === currentUserId) {
      return res.status(400).json({ success: false, message: 'You cannot follow yourself' });
    }

    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser || !currentUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isFollowing = currentUser.following.includes(targetUserId);

    if (isFollowing) {
      // Unfollow
      currentUser.following.pull(targetUserId);
      targetUser.followers.pull(currentUserId);
    } else {
      // Follow
      currentUser.following.push(targetUserId);
      targetUser.followers.push(currentUserId);

      // Trigger Notification
      try {
        await Notification.create({
          recipient: targetUserId,
          sender: currentUserId,
          type: 'follow'
        });
      } catch (err) {
        console.error('Follow notification error:', err);
      }
    }

    await currentUser.save();
    await targetUser.save();

    res.status(200).json({
      success: true,
      isFollowing: !isFollowing,
      followersCount: targetUser.followers.length,
      followingCount: targetUser.following.length,
      message: isFollowing ? 'Unfollowed successfully' : 'Followed successfully'
    });
  } catch (error) {
    console.error('Toggle follow error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
/**
 * @desc    Search users by username
 * @route   GET /api/users/search/:query
 * @access  Private
 */
exports.searchUsers = async (req, res) => {
  try {
    let { query } = req.params;
    if (!query) return res.status(200).json({ success: true, data: [] });

    query = query.toLowerCase().trim();
    // If query doesn't start with @, add it for searching if that's the format
    const searchStr = query.startsWith('@') ? query : '@' + query;

    const users = await User.find({
      username: { $regex: searchStr, $options: 'i' },
      _id: { $ne: req.user.id } // Exclude self
    })
    .select('name username profilePicture isVerified followers following')
    .limit(10);

    const formattedUsers = users.map(user => ({
      id: user._id,
      name: user.name,
      username: user.username,
      profilePicture: user.profilePicture,
      isVerified: user.isVerified || false,
      followersCount: user.followers?.length || 0,
      followingCount: user.following?.length || 0,
      isFollowing: user.followers?.includes(req.user.id) || false
    }));

    res.status(200).json({
      success: true,
      data: formattedUsers
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Get recent searches
 * @route   GET /api/users/recent-searches
 * @access  Private
 */
exports.getRecentSearches = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('recentSearches', 'name username profilePicture isVerified');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      data: user.recentSearches
    });
  } catch (error) {
    console.error('Get recent searches error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Remove an item from recent searches
 * @route   DELETE /api/users/recent-searches/:userId
 * @access  Private
 */
exports.removeRecentSearch = async (req, res) => {
  try {
    const { userId } = req.params;
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { recentSearches: userId }
    });

    res.status(200).json({ success: true, message: 'Removed from recent searches' });
  } catch (error) {
    console.error('Remove recent search error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Clear all recent searches
 * @route   DELETE /api/users/recent-searches
 * @access  Private
 */
exports.clearAllRecentSearches = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, {
      $set: { recentSearches: [] }
    });

    res.status(200).json({ success: true, message: 'Cleared all recent searches' });
  } catch (error) {
    console.error('Clear all recent searches error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Get user followers
 * @route   GET /api/users/:id/followers
 * @access  Private
 */
exports.getFollowers = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('followers', 'name username profilePicture bio isVerified');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      data: user.followers
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user following
 * @route   GET /api/users/:id/following
 * @access  Private
 */
exports.getFollowing = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('following', 'name username profilePicture bio isVerified');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      data: user.following
    });
  } catch (error) {
    next(error);
  }
};
