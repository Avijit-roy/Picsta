const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');
const {
  authLimiter,
  strictAuthLimiter,
  emailLimiter,
  changePasswordLimiter
} = require('../middleware/rateLimiter');

// ===========================
// PUBLIC ROUTES
// ===========================

/**
 * @route   POST /api/auth/register
 * @desc    Register new user
 * @access  Public
 * @limit   10 req / 15 min
 */
router.post('/register', authLimiter, authController.register);

/**
 * @route   POST /api/auth/verify-email
 * @desc    Verify email address
 * @access  Public
 * @limit   5 req / 15 min (strict)
 */
router.post('/verify-email', strictAuthLimiter, authController.verifyEmail);

/**
 * @route   POST /api/auth/resend-verification
 * @desc    Resend verification email
 * @access  Public
 * @limit   3 req / hour
 */
router.post('/resend-verification', emailLimiter, authController.resendVerificationEmail);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 * @limit   10 req / 15 min
 */
router.post('/login', authLimiter, authController.login);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Public
 */
router.post('/logout', authController.logout);

// ===========================
// GOOGLE OAUTH ROUTES
// ===========================

/**
 * @route   GET /api/auth/google
 * @desc    Initiate Google OAuth flow
 * @access  Public
 * @limit   10 req / 15 min
 */
const passport = require('passport');
router.get('/google', authLimiter, passport.authenticate('google', { scope: ['profile', 'email'] }));

/**
 * @route   GET /api/auth/google/callback
 * @desc    Google OAuth callback
 * @access  Public
 * @limit   10 req / 15 min
 */
router.get('/google/callback',
    authLimiter,
    passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL}/login?error=oauth_failed` }),
    authController.googleCallback
);

/**
 * @route   GET /api/auth/facebook
 * @desc    Initiate Facebook OAuth flow
 * @access  Public
 * @limit   10 req / 15 min
 */
router.get('/facebook', authLimiter, passport.authenticate('facebook', { scope: ['email'] }));

/**
 * @route   GET /api/auth/facebook/callback
 * @desc    Facebook OAuth callback
 * @access  Public
 * @limit   10 req / 15 min
 */
router.get('/facebook/callback',
    authLimiter,
    passport.authenticate('facebook', { session: false, failureRedirect: `${process.env.FRONTEND_URL}/login?error=oauth_failed` }),
    authController.googleCallback
);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 * @limit   10 req / 15 min
 */
router.post('/refresh', authLimiter, authController.refreshToken);

// ===========================
// PASSWORD RESET ROUTES
// ===========================

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset (sends link)
 * @access  Public
 * @limit   5 req / 15 min (strict)
 */
router.post('/forgot-password', strictAuthLimiter, authController.forgotPassword);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 * @limit   5 req / 15 min (strict)
 */
router.post('/reset-password', strictAuthLimiter, authController.resetPassword);

// ===========================
// PROTECTED ROUTES
// ===========================

/**
 * @route   GET /api/auth/me
 * @desc    Get current authenticated user
 * @access  Private
 */
router.get('/me', authenticate, authController.getCurrentUser);

/**
 * @route   POST /api/auth/change-password
 * @desc    Change password (requires current password)
 * @access  Private
 * @limit   5 req / 15 min
 */
router.post('/change-password', authenticate, changePasswordLimiter, authController.changePassword);

module.exports = router;