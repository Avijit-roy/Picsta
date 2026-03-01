const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// ── Profile picture uploads ──────────────────────────────────────────────────

const profileStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'picsta_profiles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }]
  },
});

const upload = multer({
  storage: profileStorage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB
});

// ── Chat media uploads ───────────────────────────────────────────────────────

const chatMediaStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'picsta_chats',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'mp4'],
    resource_type: 'auto'
  },
});

const uploadChatMedia = multer({
  storage: chatMediaStorage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB
});

// ── Post media uploads (Images & Videos) ───────────────────────────────────

const postStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'picsta_posts',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'mp4', 'webm'],
    resource_type: 'auto'
  },
});

const uploadPost = multer({
  storage: postStorage,
  limits: { fileSize: 20 * 1024 * 1024 } // 20 MB
});

// ── Story media uploads (Images & Videos) ───────────────────────────────────

const storyStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'picsta_stories',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'mp4', 'webm'],
    resource_type: 'auto'
  },
});

const uploadStory = multer({
  storage: storyStorage,
  limits: { fileSize: 15 * 1024 * 1024 } // 15 MB for stories
});

module.exports = { upload, uploadChatMedia, uploadPost, uploadStory, cloudinary };
