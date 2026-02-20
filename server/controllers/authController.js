const bcrypt = require('bcrypt');
const User = require('../models/userModel');
const {
  generateAccessToken,
  generateRefreshToken,
  generateSecureToken,
  hashToken,
  generateOTP,
  setAuthCookies,
  clearAuthCookies,
  verifyToken  // ADD THIS HERE
} = require('../utils/generateToken');
const {
  sendVerificationEmail,
  sendPasswordResetOTP,
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

    const birthDate = new Date(dob);
    const age = Math.floor((Date.now() - birthDate) / (365.25 * 24 * 60 * 60 * 1000));
    if (age < 13) {
      return res.status(400).json({
        success: false,
        message: 'You must be at least 13 years old to register'
      });
    }

    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }]
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
      name,
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      passwordHash,
      dob: birthDate,
      emailVerificationToken: hashedVerificationToken,
      emailVerificationExpires: Date.now() + 24 * 60 * 60 * 1000
    });

    try {
      await sendVerificationEmail(user.email, user.name, verificationToken);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email to verify your account.',
      data: {
        userId: user._id,
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
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required'
      });
    }

    const hashedToken = hashToken(token);
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    user.isVerified = true;
    await user.clearEmailVerificationFields();

    res.status(200).json({
      success: true,
      message: 'Email verified successfully. You can now log in.'
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

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email address before logging in'
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
      message: 'Token refreshed successfully'
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
// PASSWORD RESET - PHASE 1
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

    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If an account exists, an OTP has been sent to your email'
      });
    }

    const otp = generateOTP();
    const hashedOtp = hashToken(otp);

    user.passwordResetOtpHash = hashedOtp;
    user.passwordResetOtpExpires = Date.now() + (parseInt(process.env.OTP_EXPIRY_MINUTES) || 10) * 60 * 1000;
    user.passwordResetAttempts = 0;
    user.passwordResetVerified = false;
    user.passwordResetLinkToken = undefined;
    user.passwordResetLinkExpires = undefined;

    await user.save();

    try {
      await sendPasswordResetOTP(user.email, user.name, otp);
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP. Please try again.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'OTP sent to your email. Please check your inbox.',
      data: {
        email: user.email
      }
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
// PASSWORD RESET - PHASE 2
// ===========================

exports.verifyResetOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user || !user.passwordResetOtpHash || !user.passwordResetOtpExpires) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    if (Date.now() > user.passwordResetOtpExpires) {
      await user.clearPasswordResetFields();
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one.'
      });
    }

    if (user.passwordResetAttempts >= 3) {
      await user.clearPasswordResetFields();
      return res.status(429).json({
        success: false,
        message: 'Too many attempts. Please request a new OTP.'
      });
    }

    const hashedOtp = hashToken(otp);

    if (hashedOtp !== user.passwordResetOtpHash) {
      user.passwordResetAttempts += 1;
      await user.save();

      return res.status(400).json({
        success: false,
        message: `Invalid OTP. ${3 - user.passwordResetAttempts} attempts remaining.`
      });
    }

    const resetLinkToken = generateSecureToken();
    const hashedResetLinkToken = hashToken(resetLinkToken);

    user.passwordResetVerified = true;
    user.passwordResetLinkToken = hashedResetLinkToken;
    user.passwordResetLinkExpires = Date.now() + (parseInt(process.env.RESET_LINK_EXPIRY_MINUTES) || 15) * 60 * 1000;
    user.passwordResetOtpHash = undefined;
    user.passwordResetOtpExpires = undefined;
    user.passwordResetAttempts = 0;

    await user.save();

    try {
      await sendPasswordResetLink(user.email, user.name, resetLinkToken);
    } catch (emailError) {
      console.error('Failed to send reset link email:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Failed to send reset link. Please try again.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'OTP verified! Password reset link sent to your email.'
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: 'OTP verification failed. Please try again.'
    });
  }
};

// ===========================
// PASSWORD RESET - PHASE 3
// ===========================

exports.verifyResetLink = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Reset token is required'
      });
    }

    const hashedToken = hashToken(token);

    const user = await User.findOne({
      passwordResetLinkToken: hashedToken,
      passwordResetLinkExpires: { $gt: Date.now() },
      passwordResetVerified: true
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset link'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Reset link is valid',
      data: {
        email: user.email
      }
    });
  } catch (error) {
    console.error('Reset link verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Link verification failed'
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
      passwordResetLinkToken: hashedToken,
      passwordResetLinkExpires: { $gt: Date.now() },
      passwordResetVerified: true
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset link'
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