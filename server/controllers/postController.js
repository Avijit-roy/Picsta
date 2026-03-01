const Post = require('../models/postModel');
const User = require('../models/userModel');
const Comment = require('../models/commentModel');
const Notification = require('../models/notificationModel');
const { cloudinary } = require('../middleware/uploadMiddleware');
const Message = require('../models/messageModel');
const Chat = require('../models/chatModel');

/**
 * Helper to format post with user-specific status
 */
const formatPost = (post, userId) => {
  const postObj = post.toObject ? post.toObject() : post;
  const currentUserId = userId?.toString();
  
  const formattedPost = {
    ...postObj,
    isLiked: postObj.likes && currentUserId ? postObj.likes.some(id => id.toString() === currentUserId) : false,
    isSaved: postObj.saves && currentUserId ? postObj.saves.some(id => id.toString() === currentUserId) : false,
    isFollowing: postObj.author && postObj.author.followers && currentUserId 
      ? postObj.author.followers.some(id => id.toString() === currentUserId) 
      : false,
    likesCount: postObj.likes ? postObj.likes.length : 0
  };

  // Also inject isFollowing into the author object if it's an object populated with followers
  if (formattedPost.author && typeof formattedPost.author === 'object') {
    formattedPost.author.isFollowing = formattedPost.isFollowing;
  }

  return formattedPost;
};

/**
 * @desc    Create a new post
 * @route   POST /api/posts
 * @access  Private
 */
exports.createPost = async (req, res, next) => {
  try {
    const { caption, location, visibility, duration } = req.body;
    const authorId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'At least one media file is required' 
      });
    }

    const isVideo = req.file.mimetype.startsWith('video');
    
    // Server-side validation for video duration if provided
    if (isVideo && duration) {
      const videoDuration = parseFloat(duration);
      if (videoDuration < 3 || videoDuration > 30) {
        // We should delete the file from Cloudinary if it's invalid
        if (req.file.filename) {
          await cloudinary.uploader.destroy(req.file.filename, { resource_type: 'video' });
        }
        return res.status(400).json({
          success: false,
          message: 'Video duration must be between 3 and 30 seconds'
        });
      }
    }

    // Media from Cloudinary (via uploadMiddleware)
    // For videos, Cloudinary provides a thumbnail URL if we use the right transformation
    let thumbnailUrl = null;
    if (isVideo) {
      // Generate a thumbnail URL from the video URL
      // Cloudinary allows getting a frame by changing extension to jpg or using transformations
      // Format: .../video/upload/so_0/v123/public_id.jpg
      thumbnailUrl = req.file.path.replace(/\/video\/upload\/(?:v\d+\/)?(.+?)\.(.+)$/, (match, p1, p2) => {
        return `/video/upload/so_0/${p1}.jpg`;
      });
    }

    const media = [
      {
        url: req.file.path,
        type: isVideo ? 'video' : 'image',
        thumbnailUrl: isVideo ? thumbnailUrl : null,
        duration: isVideo ? parseFloat(duration) : null
      }
    ];

    const newPost = await Post.create({
      author: authorId,
      caption,
      media,
      location,
      visibility
    });

    // Populate author info for the response
    const populatedPost = await Post.findById(newPost._id).populate('author', 'name username profilePicture followers');

    // Update user's post count
    await User.findByIdAndUpdate(authorId, { $inc: { postsCount: 1 } });

    res.status(201).json({
      success: true,
      message: 'Post shared successfully',
      data: formatPost(populatedPost, req.user.id)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all posts (Feed)
 * @route   GET /api/posts
 * @access  Private
 */
exports.getPosts = async (req, res, next) => {
  try {
    // Basic feed: all public posts or posts from users being followed
    // For now, let's just get everything sorted by date
    const posts = await Post.find({ visibility: 'public' })
      .sort({ createdAt: -1 })
      .populate('author', 'name username profilePicture followers')
      .limit(20);

    const formattedPosts = posts.map(post => formatPost(post, req.user.id));

    res.status(200).json({
      success: true,
      count: posts.length,
      data: formattedPosts
    });
  } catch (error) {
    next(error);
  }
};
/**
 * @desc    Get user's posts
 * @route   GET /api/posts/user/:username
 * @access  Private
 */
exports.getUserPosts = async (req, res, next) => {
  try {
    const { username } = req.params;
    
    // Find user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const posts = await Post.find({ author: user._id })
      .sort({ createdAt: -1 })
      .populate('author', 'name username profilePicture followers');

    const formattedPosts = posts.map(post => formatPost(post, req.user.id));

    res.status(200).json({
      success: true,
      count: posts.length,
      data: formattedPosts
    });
  } catch (error) {
    next(error);
  }
};
/**
 * @desc    Delete a post
 * @route   DELETE /api/posts/:id
 * @access  Private
 */
exports.deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check ownership
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this post'
      });
    }

    // Delete media from Cloudinary
    for (const item of post.media) {
      if (item.url.includes('cloudinary.com')) {
        try {
          // Cloudinary URLs: .../upload/v12345/folder/id.jpg
          const parts = item.url.split('/');
          const fileNameWithExt = parts[parts.length - 1];
          const fileName = fileNameWithExt.split('.')[0];
          const folder = parts[parts.length - 2];
          const publicId = `${folder}/${fileName}`;
          
          await cloudinary.uploader.destroy(publicId);
          console.log(`Destroyed Cloudinary asset: ${publicId}`);
        } catch (cloudinaryError) {
          console.error("Cloudinary deletion error:", cloudinaryError);
        }
      }
    }

    // Handle shared messages deletion
    const sharedMessages = await Message.find({ post: req.params.id });
    const affectedChatIds = [...new Set(sharedMessages.map(m => m.chat.toString()))];

    await Message.deleteMany({ post: req.params.id });
    await Notification.deleteMany({ post: req.params.id });

    // Update affected chats
    for (const chatId of affectedChatIds) {
      const lastMsg = await Message.findOne({ chat: chatId }).sort({ createdAt: -1 });
      const updateData = {
        lastMessage: lastMsg ? lastMsg._id : null
      };
      if (lastMsg) {
          updateData.updatedAt = lastMsg.createdAt;
      }
      
      const updatedChat = await Chat.findByIdAndUpdate(chatId, updateData, { new: true })
        .populate('lastMessage')
        .populate('participants', 'name username profilePicture');

      if (req.io) {
        // Notify chat room about message deletion
        req.io.to(chatId).emit('messages_deleted', { postId: req.params.id });
        // Update sidebar preview
        req.io.to(chatId).emit('chat_updated', updatedChat);
      }
    }

    await Post.deleteOne({ _id: req.params.id });

    // Decrement user's post count (safely)
    await User.findOneAndUpdate(
      { _id: req.user.id, postsCount: { $gt: 0 } },
      { $inc: { postsCount: -1 } }
    );

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a post (e.g., caption)
 * @route   PATCH /api/posts/:id
 * @access  Private
 */
exports.updatePost = async (req, res, next) => {
  try {
    const { caption } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Check ownership
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this post' });
    }

    // Update fields
    if (caption !== undefined) {
      post.caption = caption;
      post.isEdited = true;
    }

    await post.save();

    // Re-populate author for frontend consistency
    const updatedPost = await Post.findById(post._id).populate('author', 'name username profilePicture followers');

    res.status(200).json({
      success: true,
      message: 'Post updated successfully',
      data: updatedPost
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle like/unlike a post
 * @route   POST /api/posts/:id/like
 * @access  Private
 */
exports.toggleLike = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const isLiked = post.likes.includes(req.user.id);

    if (isLiked) {
      // Unlike
      post.likes.pull(req.user.id);
    } else {
      // Like
      post.likes.push(req.user.id);

      // Trigger Notification (only if not liking own post)
      if (post.author.toString() !== req.user.id) {
        try {
          await Notification.create({
            recipient: post.author,
            sender: req.user.id,
            type: 'like',
            post: post._id
          });
        } catch (err) {
          console.error('Like notification error:', err);
        }
      }
    }

    await post.save();

    res.status(200).json({
      success: true,
      isLiked: !isLiked,
      likesCount: post.likes.length,
      data: formatPost(post, req.user.id),
      message: isLiked ? 'Post unliked' : 'Post liked'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add a comment to a post
 * @route   POST /api/posts/:id/comments
 * @access  Private
 */
exports.addComment = async (req, res, next) => {
  try {
    const { text, parentCommentId } = req.body;
    const postId = req.params.id;
    const authorId = req.user.id;

    if (!text) {
      return res.status(400).json({ success: false, message: 'Comment text is required' });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    let finalParentId = parentCommentId || null;
    let replyToUserId = null;

    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId);
      if (parentComment) {
        replyToUserId = parentComment.author;
        // If the parent is itself a reply, attach to its parent (top-level)
        if (parentComment.parentComment) {
          finalParentId = parentComment.parentComment;
        }
      }
    }

    const comment = await Comment.create({
      post: postId,
      author: authorId,
      text,
      parentComment: finalParentId,
      replyToUser: replyToUserId
    });

    // Trigger Notification (only if not commenting on own post)
    if (post.author.toString() !== authorId) {
      try {
        await Notification.create({
          recipient: post.author,
          sender: authorId,
          type: 'comment',
          post: postId,
          comment: comment._id
        });
      } catch (err) {
        console.error('Comment notification error:', err);
      }
    }

    // Increment comment count in post
    post.commentsCount += 1;
    await post.save();

    // Populate author for response
    const populatedComment = await Comment.findById(comment._id).populate('author', 'name username profilePicture followers');

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: populatedComment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get comments for a post
 * @route   GET /api/posts/:id/comments
 * @access  Private
 */
exports.getPostComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({ post: req.params.id })
      .populate('author', 'name username profilePicture followers')
      .populate('replyToUser', 'name username')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: comments.length,
      data: comments
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a comment
 * @route   DELETE /api/posts/:postId/comments/:commentId
 * @access  Private
 */
exports.deleteComment = async (req, res, next) => {
  try {
    const { postId, commentId } = req.params;
    
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    // Check ownership
    if (comment.author.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this comment' });
    }

    await Comment.deleteOne({ _id: commentId });

    // Decrement comment count in post
    await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: -1 } });

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle save/unsave a post
 * @route   POST /api/posts/:id/save
 * @access  Private
 */
exports.toggleSave = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const isSaved = post.saves.includes(req.user.id);

    if (isSaved) {
      // Unsave
      post.saves.pull(req.user.id);
    } else {
      // Save
      post.saves.push(req.user.id);
    }

    await post.save();

    res.status(200).json({
      success: true,
      isSaved: !isSaved,
      data: formatPost(post, req.user.id),
      message: isSaved ? 'Post unsaved' : 'Post saved'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get saved posts for current user
 * @route   GET /api/posts/saved
 * @access  Private
 */
exports.getSavedPosts = async (req, res, next) => {
  try {
    const posts = await Post.find({ saves: req.user.id })
      .sort({ createdAt: -1 })
      .populate('author', 'name username profilePicture followers');

    const formattedPosts = posts.map(post => formatPost(post, req.user.id));

    res.status(200).json({
      success: true,
      count: posts.length,
      data: formattedPosts
    });
  } catch (error) {
    next(error);
  }
};
/**
 * @desc    Get all video posts (Reels)
 * @route   GET /api/posts/reels
 * @access  Private
 */
exports.getReels = async (req, res, next) => {
  try {
    const reels = await Post.find({ 'media.type': 'video' })
      .sort({ createdAt: -1 })
      .populate('author', 'name username profilePicture followers');

    const formattedReels = reels.map(reel => formatPost(reel, req.user.id));

    res.status(200).json({
      success: true,
      count: reels.length,
      data: formattedReels
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get users who liked a post
 * @route   GET /api/posts/:id/likers
 * @access  Private
 */
exports.getLikers = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate({
        path: 'likes',
        select: 'name username profilePicture followers'
      });

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const currentUserId = req.user.id;
    const likers = post.likes.map(liker => {
      const isFollowing = liker.followers && liker.followers.some(id => id.toString() === currentUserId);
      return {
        _id: liker._id,
        name: liker.name,
        username: liker.username,
        profilePicture: liker.profilePicture,
        isFollowing
      };
    });

    res.status(200).json({
      success: true,
      count: likers.length,
      data: likers
    });
  } catch (error) {
    next(error);
  }
};
