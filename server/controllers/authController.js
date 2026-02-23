const bcrypt = require('bcrypt');
const User = require('../models/userModel');
const {
  generateAccessToken,
  generateRefreshToken,
  generateSecureToken,
  hashToken,
  setAuthCookies,
  clearAuthCookies,
  verifyToken  // ADD THIS HERE
} = require('../utils/generateToken');
const {
  sendVerificationEmail,
  sendPasswordResetLink,
  sendPasswordChangeConfirmation
} = require('../utils/sendEmail');

// ===========================
// REGISTRATION
// ===========================

exports.register = async (req, res) => {
  try {
    const { name, username, email, password, dob } = req.body;

    if (!name || !username || !email || !password || !dob) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long'
      });
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain uppercase, lowercase, number, and special character'
      });
    }

    // Unified length and character checks
    const unifiedRegex = /^(?![_])(?!.*__)(?![a-z0-9_]*_$)[a-z0-9_]{4,20}$/;
    const reserved = ['admin', 'support', 'picsta', 'official', 'moderator', 'staff'];

    // Trim and normalize
    const normalizedName = name.trim().toLowerCase();
    let normalizedUsername = username.trim().toLowerCase();
    if (!normalizedUsername.startsWith('@')) {
      normalizedUsername = '@' + normalizedUsername;
    }

    // Validate Name
    if (!unifiedRegex.test(normalizedName) || !/[a-z]/.test(normalizedName)) {
      return res.status(400).json({
        success: false,
        message: 'Name must be 4-20 chars long, contain only lowercase letters/numbers/underscores, at least one letter, and no consecutive underscores.'
      });
    }
    if (reserved.includes(normalizedName)) {
      return res.status(400).json({ success: false, message: 'This name is reserved' });
    }

    // Validate Username
    const usernamePart = normalizedUsername.substring(1);
    if (!unifiedRegex.test(usernamePart) || !/[a-z]/.test(usernamePart)) {
      return res.status(400).json({
        success: false,
        message: 'Username must be 4-20 chars long (after @), contain only lowercase letters/numbers/underscores, at least one letter, and no consecutive underscores.'
      });
    }
    if (reserved.includes(usernamePart)) {
      return res.status(400).json({ success: false, message: 'This username is reserved' });
    }

    const birthDate = new Date(dob);
    const age = Math.floor((Date.now() - birthDate) / (365.25 * 24 * 60 * 60 * 1000));
    if (age < 13) {
      return res.status(400).json({
        success: false,
        message: 'You must be at least 13 years old to register'
      });
    }

    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username: normalizedUsername }]
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User already exists'
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const verificationToken = generateSecureToken();
    const hashedVerificationToken = hashToken(verificationToken);

    const user = await User.create({
      name: normalizedName,
      username: normalizedUsername,
      email: email.toLowerCase(),
      passwordHash,
      dob: birthDate,
      emailVerificationToken: hashedVerificationToken,
      emailVerificationExpires: Date.now() + (parseInt(process.env.EMAIL_VERIFY_TOKEN_EXPIRY_MINUTES) || 15) * 60 * 1000
    });

    try {
      await sendVerificationEmail(user.email, user.name, verificationToken);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
    }

    // Do NOT auto-login — user must verify email first
    res.status(201).json({
      success: true,
      message: 'Account created! Check your inbox to verify your email.',
      data: {
        email: user.email
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.'
    });
  }
};

// ===========================
// EMAIL VERIFICATION
// ===========================

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required'
      });
    }

    // Hash and find the user by verification token
    const hashedToken = hashToken(token);
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() }
    });

    // Check if token is valid but user already verified (expired or used)
    if (!user) {
      // Check if someone tried an already-used token
      const alreadyVerifiedUser = await User.findOne({
        isVerified: true,
        emailVerificationToken: undefined
      });

      return res.status(400).json({
        success: false,
        code: 'TOKEN_INVALID_OR_EXPIRED',
        message: 'This verification link has expired or already been used. Please request a new one.'
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        code: 'ALREADY_VERIFIED',
        message: 'Your email is already verified. You can log in.'
      });
    }

    // Mark as verified and clear token fields
    user.isVerified = true;
    await user.clearEmailVerificationFields();

    // Auto-login: issue tokens now that email is confirmed
    const tokenPayload = { userId: user._id, tokenVersion: user.tokenVersion };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);
    setAuthCookies(res, accessToken, refreshToken);

    res.status(200).json({
      success: true,
      message: 'Email verified! Welcome to Picsta.',
      data: {
        user: {
          id: user._id,
          name: user.name,
          username: user.username,
          email: user.email,
          profilePicture: user.profilePicture,
          isVerified: true
        }
      }
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Verification failed. Please try again.'
    });
  }
};

exports.resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If an account exists, a verification email has been sent'
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    const verificationToken = generateSecureToken();
    const hashedVerificationToken = hashToken(verificationToken);

    user.emailVerificationToken = hashedVerificationToken;
    user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    await sendVerificationEmail(user.email, user.name, verificationToken);

    res.status(200).json({
      success: true,
      message: 'Verification email sent successfully'
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send verification email'
    });
  }
};

// ===========================
// LOGIN
// ===========================

exports.login = async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email/username and password are required'
      });
    }

    const user = await User.findOne({
      $or: [
        { email: emailOrUsername.toLowerCase() },
        { username: emailOrUsername.toLowerCase() }
      ]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    /* isVerified check — active */
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        code: 'EMAIL_NOT_VERIFIED',
        email: user.email,
        message: 'Please verify your email before logging in. Check your inbox or resend the verification email.'
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const tokenPayload = {
      userId: user._id,
      tokenVersion: user.tokenVersion
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    setAuthCookies(res, accessToken, refreshToken);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          username: user.username,
          email: user.email,
          profilePicture: user.profilePicture,
          isVerified: user.isVerified
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.'
    });
  }
};

// ===========================
// GOOGLE CALLBACK
// ===========================

exports.googleCallback = async (req, res) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
    }

    const tokenPayload = {
      userId: user._id,
      tokenVersion: user.tokenVersion
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    setAuthCookies(res, accessToken, refreshToken);

    // Redirect to frontend main page
    res.redirect(`${process.env.FRONTEND_URL}/main`);
  } catch (error) {
    console.error('Google callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=server_error`);
  }
};

// ===========================
// LOGOUT
// ===========================

exports.logout = async (req, res) => {
  try {
    clearAuthCookies(res);

    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
};

// ===========================
// REFRESH TOKEN
// ===========================

exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token not found'
      });
    }

    // FIXED: Use verifyToken from top import
    const decoded = verifyToken(refreshToken, process.env.JWT_REFRESH_SECRET);

    if (!decoded) {
      clearAuthCookies(res);
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    const user = await User.findById(decoded.userId);

    if (!user) {
      clearAuthCookies(res);
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    if (decoded.tokenVersion !== user.tokenVersion) {
      clearAuthCookies(res);
      return res.status(401).json({
        success: false,
        message: 'Session invalidated. Please log in again.'
      });
    }

    const tokenPayload = {
      userId: user._id,
      tokenVersion: user.tokenVersion
    };

    const newAccessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    setAuthCookies(res, newAccessToken, newRefreshToken);

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          username: user.username,
          email: user.email,
          profilePicture: user.profilePicture,
          isVerified: user.isVerified
        }
      }
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      message: 'Token refresh failed'
    });
  }
};

// ===========================
// PASSWORD RESET - LINK-BASED
// ===========================

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    // Always return success to prevent email enumeration
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If an account exists with this email, a reset link has been sent.'
      });
    }

    const resetToken = generateSecureToken();
    const hashedResetToken = hashToken(resetToken);

    user.resetPasswordToken = hashedResetToken;
    user.resetPasswordExpires = Date.now() + (parseInt(process.env.RESET_LINK_EXPIRY_MINUTES) || 15) * 60 * 1000;

    await user.save();

    try {
      await sendPasswordResetLink(user.email, user.name, resetToken);
    } catch (emailError) {
      console.error('Failed to send reset link email:', emailError);
      // We still return success to the user, but log the error
    }

    res.status(200).json({
      success: true,
      message: 'If an account exists with this email, a reset link has been sent.'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Password reset request failed. Please try again.'
    });
  }
};

// ===========================
// PASSWORD RESET - PHASE 4
// ===========================

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token and new password are required'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long'
      });
    }

    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain uppercase, lowercase, number, and special character'
      });
    }

    const hashedToken = hashToken(token);

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    user.passwordHash = newPasswordHash;
    user.tokenVersion += 1;

    await user.clearPasswordResetFields();

    try {
      await sendPasswordChangeConfirmation(user.email, user.name);
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
    }

    res.status(200).json({
      success: true,
      message: 'Password reset successful. All sessions have been logged out. Please log in with your new password.'
    });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({
      success: false,
      message: 'Password reset failed. Please try again.'
    });
  }
};

// ===========================
// CHANGE PASSWORD
// ===========================

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long'
      });
    }

    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      return res.status(400).json({
        success: false,
        message: 'New password must contain uppercase, lowercase, number, and special character'
      });
    }

    const user = await User.findById(userId);

    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.passwordHash);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: 'New password must be different from current password'
      });
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    user.passwordHash = newPasswordHash;
    user.tokenVersion += 1;
    await user.save();

    clearAuthCookies(res);

    try {
      await sendPasswordChangeConfirmation(user.email, user.name);
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
    }

    res.status(200).json({
      success: true,
      message: 'Password changed successfully. Please log in again.'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Password change failed. Please try again.'
    });
  }
};

// ===========================
// GET CURRENT USER
// ===========================

exports.getCurrentUser = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        user: {
          id: req.user._id,
          name: req.user.name,
          username: req.user.username,
          email: req.user.email,
          profilePicture: req.user.profilePicture,
          dob: req.user.dob,
          isVerified: req.user.isVerified,
          createdAt: req.user.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user data'
    });
  }
};