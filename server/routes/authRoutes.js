const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');
const { authLimiter, strictAuthLimiter, emailLimiter } = require('../middleware/rateLimiter');

// ===========================
// PUBLIC ROUTES
// ===========================

/**
 * @route   POST /api/auth/register
 * @desc    Register new user
 * @access  Public
 */
router.post('/register', authLimiter, authController.register);

/**
 * @route   GET /api/auth/verify-email/:token
 * @desc    Verify email address
 * @access  Public
 */
router.get('/verify-email/:token', authController.verifyEmail);

/**
 * @route   POST /api/auth/resend-verification
 * @desc    Resend verification email
 * @access  Public
 */
router.post('/resend-verification', emailLimiter, authController.resendVerificationEmail);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', authLimiter, authController.login);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Public
 */
router.post('/logout', authController.logout);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh', authController.refreshToken);

// ===========================
// PASSWORD RESET ROUTES
// ===========================

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset (sends OTP)
 * @access  Public
 */
router.post('/forgot-password', strictAuthLimiter, authController.forgotPassword);

/**
 * @route   POST /api/auth/verify-reset-otp
 * @desc    Verify OTP and get reset link
 * @access  Public
 */
router.post('/verify-reset-otp', strictAuthLimiter, authController.verifyResetOTP);

/**
 * @route   GET /api/auth/verify-reset-link/:token
 * @desc    Verify reset link token validity
 * @access  Public
 */
router.get('/verify-reset-link/:token', authController.verifyResetLink);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
router.post('/reset-password', authController.resetPassword);

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
 */
router.post('/change-password', authenticate, authController.changePassword);

module.exports = router;