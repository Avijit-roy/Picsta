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
 * Send password reset link after OTP verification
 * @param {String} email - Recipient email
 * @param {String} name - User name
 * @param {String} token - Reset token
 */
const sendPasswordResetLink = async (email, name, token) => {
  const transporter = createTransporter();
  const resetUrl = `${process.env.FRONTEND_URL}/new-password?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Reset Your Password - Picsta',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>Hello ${name},</p>
        <p>We received a request to reset your password for your Picsta account. Click the button below to set a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="display: inline-block; background-color: #0095f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Reset Password
          </a>
        </div>
        <p>This link will expire in ${process.env.RESET_LINK_EXPIRY_MINUTES || 15} minutes. If you did not request this, please ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #999;">If you're having trouble clicking the button, copy and paste this URL into your browser:</p>
        <p style="word-break: break-all; font-size: 12px; color: #0095f6;">${resetUrl}</p>
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
  sendPasswordResetLink,
  sendPasswordChangeConfirmation
};