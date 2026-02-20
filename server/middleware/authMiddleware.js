const { verifyToken } = require('../utils/generateToken');
const User = require('../models/userModel');

/**
 * Middleware to verify JWT access token from cookies
 * Validates token version against database for session invalidation
 */
const authenticate = async (req, res, next) => {
  try {
    // Get access token from HTTP-only cookie
    const { accessToken } = req.cookies;

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Verify token
    const decoded = verifyToken(accessToken, process.env.JWT_ACCESS_SECRET);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    // Fetch user from database
    const user = await User.findById(decoded.userId).select('-passwordHash');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Critical: Check token version for session invalidation
    if (decoded.tokenVersion !== user.tokenVersion) {
      return res.status(401).json({
        success: false,
        message: 'Session has been invalidated. Please log in again.'
      });
    }

    // Check if user is verified
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email address'
      });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

/**
 * Middleware to optionally authenticate user
 * Does not reject if no token present
 */
const optionalAuthenticate = async (req, res, next) => {
  try {
    const { accessToken } = req.cookies;

    if (accessToken) {
      const decoded = verifyToken(accessToken, process.env.JWT_ACCESS_SECRET);

      if (decoded) {
        const user = await User.findById(decoded.userId).select('-passwordHash');

        if (user && decoded.tokenVersion === user.tokenVersion && user.isVerified) {
          req.user = user;
        }
      }
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

module.exports = {
  authenticate,
  optionalAuthenticate
};