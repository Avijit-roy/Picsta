const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

/**
 * Send email verification email
 * @param {String} email - Recipient email
 * @param {String} name - User name
 * @param {String} token - Verification token
 */
const sendVerificationEmail = async (email, name, token) => {
  const transporter = createTransporter();
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Verify Your Picsta Account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to Picsta, ${name}!</h2>
        <p>Thank you for registering. Please verify your email address to activate your account.</p>
        <p>Click the button below to verify your email:</p>
        <a href="${verificationUrl}" style="display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 16px 0;">
          Verify Email
        </a>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
        <p style="color: #999; font-size: 12px; margin-top: 24px;">
          This link will expire in 24 hours. If you didn't create a Picsta account, please ignore this email.
        </p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

/**
 * Send OTP for password reset
 * @param {String} email - Recipient email
 * @param {String} name - User name
 * @param {String} otp - 6-digit OTP
 */
const sendPasswordResetOTP = async (email, name, otp) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Password Reset OTP - Picsta',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>Hello ${name},</p>
        <p>We received a request to reset your password. Use the OTP below to verify your identity:</p>
        <div style="background-color: #f5f5f5; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <h1 style="margin: 0; color: #007bff; letter-spacing: 8px; font-size: 36px;">${otp}</h1>
        </div>
        <p style="color: #666;">This OTP will expire in ${process.env.OTP_EXPIRY_MINUTES || 10} minutes.</p>
        <p style="color: #999; font-size: 12px; margin-top: 24px;">
          If you didn't request a password reset, please ignore this email and ensure your account is secure.
        </p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

/**
 * Send password reset link after OTP verification
 * @param {String} email - Recipient email
 * @param {String} name - User name
 * @param {String} token - Reset token
 */
const sendPasswordResetLink = async (email, name, token) => {
  const transporter = createTransporter();
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Complete Your Password Reset - Picsta',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Reset Your Password</h2>
        <p>Hello ${name},</p>
        <p>Your identity has been verified. Click the button below to create a new password:</p>
        <a href="${resetUrl}" style="display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 16px 0;">
          Reset Password
        </a>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${resetUrl}</p>
        <p style="color: #d9534f; font-weight: bold;">⚠️ This link will expire in ${process.env.RESET_LINK_EXPIRY_MINUTES || 15} minutes.</p>
        <p style="color: #999; font-size: 12px; margin-top: 24px;">
          For security reasons, this link can only be used once. If you didn't request this, please contact support immediately.
        </p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

/**
 * Send password change confirmation email
 * @param {String} email - Recipient email
 * @param {String} name - User name
 */
const sendPasswordChangeConfirmation = async (email, name) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Password Changed Successfully - Picsta',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Changed</h2>
        <p>Hello ${name},</p>
        <p>Your password has been successfully changed. All active sessions have been logged out for security.</p>
        <p>If you did not make this change, please contact our support team immediately.</p>
        <p style="margin-top: 24px;">
          <a href="${process.env.FRONTEND_URL}/login" style="color: #007bff;">Log in with your new password</a>
        </p>
        <p style="color: #999; font-size: 12px; margin-top: 24px;">
          This is an automated security notification from Picsta.
        </p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetOTP,
  sendPasswordResetLink,
  sendPasswordChangeConfirmation
};