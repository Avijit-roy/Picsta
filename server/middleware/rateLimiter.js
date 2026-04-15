const rateLimit = require('express-rate-limit');

// ─────────────────────────────────────────────
// HELPER – builds a limiter with shared defaults
// ─────────────────────────────────────────────
const createLimiter = (windowMs, max, message, opts = {}) =>
  rateLimit({
    windowMs,
    max,
    message: { success: false, message },
    standardHeaders: true,   // Return rate-limit info in `RateLimit-*` headers
    legacyHeaders: false,    // Disable the `X-RateLimit-*` headers
    ...opts,
  });

// ─────────────────────────────────────────────
// AUTH LIMITERS
// ─────────────────────────────────────────────

/**
 * General auth limiter – login / register
 * 10 attempts per 15 minutes
 */
const authLimiter = createLimiter(
  parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 10,
  'Too many attempts. Please try again later.'
);

/**
 * Strict limiter – forgot-password / OTP verify
 * 5 attempts per 15 minutes
 */
const strictAuthLimiter = createLimiter(
  15 * 60 * 1000,
  5,
  'Too many attempts. Please try again after 15 minutes.'
);

/**
 * Email sending limiter – resend-verification
 * 3 emails per hour
 */
const emailLimiter = createLimiter(
  60 * 60 * 1000,
  3,
  'Too many email requests. Please try again later.'
);

/**
 * Change password limiter
 * 5 attempts per 15 minutes
 */
const changePasswordLimiter = createLimiter(
  15 * 60 * 1000,
  5,
  'Too many password change attempts. Please wait 15 minutes.'
);

// ─────────────────────────────────────────────
// POST LIMITERS
// ─────────────────────────────────────────────

/**
 * Create post – 10 posts per hour
 */
const createPostLimiter = createLimiter(
  60 * 60 * 1000,
  10,
  'You are creating posts too fast. Please wait before posting again.'
);

/**
 * Like / Save toggle – 60 actions per minute
 */
const likeOrSaveLimiter = createLimiter(
  60 * 1000,
  60,
  'You are liking or saving too fast. Please slow down.'
);

/**
 * Add Comment – 20 comments per minute
 */
const commentLimiter = createLimiter(
  60 * 1000,
  20,
  'You are commenting too fast. Please slow down.'
);

// ─────────────────────────────────────────────
// STORY LIMITERS
// ─────────────────────────────────────────────

/**
 * Create story – 10 stories per hour
 */
const createStoryLimiter = createLimiter(
  60 * 60 * 1000,
  10,
  'You are posting stories too fast. Please try again later.'
);

/**
 * Mark story viewed – 120 per minute (rapid-fire viewing is normal)
 */
const storyViewLimiter = createLimiter(
  60 * 1000,
  120,
  'Too many story view requests. Please slow down.'
);

// ─────────────────────────────────────────────
// MESSAGE / CHAT LIMITERS
// ─────────────────────────────────────────────

/**
 * Send message – 30 per minute
 */
const messageLimiter = createLimiter(
  60 * 1000,
  30,
  'You are sending messages too fast. Please slow down.'
);

/**
 * Upload chat media – 10 per hour
 */
const chatMediaUploadLimiter = createLimiter(
  60 * 60 * 1000,
  10,
  'Too many media uploads. Please try again later.'
);

/**
 * Create / get chat – 30 per minute
 */
const createChatLimiter = createLimiter(
  60 * 1000,
  30,
  'Too many chat requests. Please slow down.'
);

// ─────────────────────────────────────────────
// USER / SOCIAL LIMITERS
// ─────────────────────────────────────────────

/**
 * Follow / Unfollow toggle – 30 per minute
 */
const followLimiter = createLimiter(
  60 * 1000,
  30,
  'You are following/unfollowing too fast. Please slow down.'
);

/**
 * Search users – 30 per minute
 */
const searchLimiter = createLimiter(
  60 * 1000,
  30,
  'Too many search requests. Please slow down.'
);

/**
 * Update profile – 10 per 15 minutes
 */
const profileUpdateLimiter = createLimiter(
  15 * 60 * 1000,
  10,
  'Too many profile update requests. Please wait a moment.'
);

/**
 * Upload profile picture – 5 uploads per hour
 */
const profilePictureLimiter = createLimiter(
  60 * 60 * 1000,
  5,
  'Too many profile picture uploads. Please try again later.'
);

// ─────────────────────────────────────────────
// GLOBAL API LIMITER (safety net for any route)
// ─────────────────────────────────────────────

/**
 * Global limiter – applied in server.js as a blanket safeguard
 * 200 requests per 15 minutes per IP
 */
const globalApiLimiter = createLimiter(
  15 * 60 * 1000,
  200,
  'Too many requests from this IP. Please try again later.'
);

module.exports = {
  // Auth
  authLimiter,
  strictAuthLimiter,
  emailLimiter,
  changePasswordLimiter,

  // Posts
  createPostLimiter,
  likeOrSaveLimiter,
  commentLimiter,

  // Stories
  createStoryLimiter,
  storyViewLimiter,

  // Messages & Chats
  messageLimiter,
  chatMediaUploadLimiter,
  createChatLimiter,

  // Users / Social
  followLimiter,
  searchLimiter,
  profileUpdateLimiter,
  profilePictureLimiter,

  // Global
  globalApiLimiter,
};