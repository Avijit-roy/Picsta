const Post = require('../models/postModel');
const User = require('../models/userModel');
const Comment = require('../models/commentModel');
const Notification = require('../models/notificationModel');
const { cloudinary } = require('../middleware/uploadMiddleware');

/**
 * @desc    Create a new post
 * @route   POST /api/posts
 * @access  Private
 */
exports.createPost = async (req, res, next) => {
  try {
    const { caption, location, visibility } = req.body;
    const authorId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'At least one media file is required' 
      });
    }

    // Media from Cloudinary (via uploadMiddleware)
    const media = [
      {
        url: req.file.path,
        type: req.file.mimetype.startsWith('video') ? 'video' : 'image'
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
    const populatedPost = await Post.findById(newPost._id).populate('author', 'name username profilePicture');

    // Update user's post count
    await User.findByIdAndUpdate(authorId, { $inc: { postsCount: 1 } });

    res.status(201).json({
      success: true,
      message: 'Post shared successfully',
      data: populatedPost
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
      .populate('author', 'name username profilePicture')
      .limit(20);

    res.status(200).json({
      success: true,
      count: posts.length,
      data: posts
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
      .populate('author', 'name username profilePicture');

    res.status(200).json({
      success: true,
      count: posts.length,
      data: posts
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
    const updatedPost = await Post.findById(post._id).populate('author', 'name username profilePicture');

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

    const comment = await Comment.create({
      post: postId,
      author: authorId,
      text,
      parentComment: parentCommentId || null
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
    const populatedComment = await Comment.findById(comment._id).populate('author', 'name username profilePicture');

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
      .populate('author', 'name username profilePicture')
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
      .populate('author', 'name username profilePicture');

    res.status(200).json({
      success: true,
      count: posts.length,
      data: posts
    });
  } catch (error) {
    next(error);
  }
};
