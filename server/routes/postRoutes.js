const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { authenticate } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

// All post routes require authentication
router.use(authenticate);

router.route('/')
  .get(postController.getPosts)
  .post(upload.single('media'), postController.createPost);

router.get('/user/:username', postController.getUserPosts);
router.get('/saved', postController.getSavedPosts);

router.route('/:id')
  .patch(postController.updatePost)
  .delete(postController.deletePost);

router.post('/:id/like', postController.toggleLike);
router.post('/:id/save', postController.toggleSave);

// Comment routes
router.post('/:id/comments', postController.addComment);
router.get('/:id/comments', postController.getPostComments);
router.delete('/:postId/comments/:commentId', postController.deleteComment);

module.exports = router;
