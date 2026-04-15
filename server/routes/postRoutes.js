const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { authenticate } = require('../middleware/authMiddleware');
const { upload, uploadPost } = require('../middleware/uploadMiddleware');
const {
  createPostLimiter,
  likeOrSaveLimiter,
  commentLimiter,
} = require('../middleware/rateLimiter');

// All post routes require authentication
router.use(authenticate);

// ─── Feed & Post CRUD ─────────────────────────────────────────────────────────
/**
 * GET  /api/posts       – fetch feed posts
 * POST /api/posts       – create a new post (10/hr)
 */
router.get('/', postController.getPosts);
router.post('/', createPostLimiter, uploadPost.single('media'), postController.createPost);

router.get('/user/:username', postController.getUserPosts);
router.get('/saved', postController.getSavedPosts);
router.get('/reels', postController.getReels);

router.route('/:id')
  .patch(postController.updatePost)
  .delete(postController.deletePost);

// ─── Engagement ────────────────────────────────────────────────────────────────
/**
 * POST /api/posts/:id/like  – toggle like  (60/min)
 * POST /api/posts/:id/save  – toggle save  (60/min)
 */
router.post('/:id/like', likeOrSaveLimiter, postController.toggleLike);
router.get('/:id/likers', postController.getLikers);
router.post('/:id/save', likeOrSaveLimiter, postController.toggleSave);

// ─── Comments ──────────────────────────────────────────────────────────────────
/**
 * POST   /api/posts/:id/comments             – add comment     (20/min)
 * GET    /api/posts/:id/comments             – get comments
 * DELETE /api/posts/:postId/comments/:commentId – delete comment
 */
router.post('/:id/comments', commentLimiter, postController.addComment);
router.get('/:id/comments', postController.getPostComments);
router.delete('/:postId/comments/:commentId', postController.deleteComment);

module.exports = router;
