const jwt = require('jsonwebtoken');
const crypto = require('crypto');

/**
 * Generate JWT access token
 * @param {Object} payload - Token payload
 * @returns {String} JWT token
 */
const generateAccessToken = (payload) => {
  return jwt.sign(
    payload,
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m' }
  );
};

/**
 * Generate JWT refresh token
 * @param {Object} payload - Token payload
 * @returns {String} JWT token
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d' }
  );
};

/**
 * Generate secure random token (for email verification, password reset)
 * @param {Number} bytes - Number of random bytes (default: 32)
 * @returns {String} Hex string token
 */
const generateSecureToken = (bytes = 32) => {
  return crypto.randomBytes(bytes).toString('hex');
};

/**
 * Hash a token using SHA256
 * @param {String} token - Token to hash
 * @returns {String} Hashed token
 */
const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Generate 6-digit OTP
 * @returns {String} 6-digit OTP
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Verify JWT token
 * @param {String} token - JWT token
 * @param {String} secret - JWT secret
 * @returns {Object|null} Decoded payload or null if invalid
 */
const verifyToken = (token, secret) => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
};

/**
 * Set authentication cookies
 * @param {Object} res - Express response object
 * @param {String} accessToken - Access token
 * @param {String} refreshToken - Refresh token
 */
const setAuthCookies = (res, accessToken, refreshToken) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === 'true', // HTTPS only in production
    sameSite: 'strict',
    path: '/'
  };

  // Access token - short lived
  res.cookie('accessToken', accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000 // 15 minutes
  });

  // Refresh token - long lived
  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};

/**
 * Clear authentication cookies
 * @param {Object} res - Express response object
 */
const clearAuthCookies = (res) => {
  res.clearCookie('accessToken', { path: '/' });
  res.clearCookie('refreshToken', { path: '/' });
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateSecureToken,
  hashToken,
  generateOTP,
  verifyToken,
  setAuthCookies,
  clearAuthCookies
};