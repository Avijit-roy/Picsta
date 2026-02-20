const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,  // This creates an index automatically
    lowercase: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
    match: [/^[a-z0-9_]+$/, 'Username can only contain lowercase letters, numbers, and underscores']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,  // This creates an index automatically
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  passwordHash: {
    type: String,
    required: [true, 'Password is required']
  },
  dob: {
    type: Date,
    required: [true, 'Date of birth is required']
  },
  isVerified: {
    type: Boolean,
    default: false
  },

  // Email verification fields
  emailVerificationToken: String,
  emailVerificationExpires: Date,

  // Password reset fields - OTP phase
  passwordResetOtpHash: String,
  passwordResetOtpExpires: Date,
  passwordResetAttempts: {
    type: Number,
    default: 0
  },
  passwordResetVerified: {
    type: Boolean,
    default: false
  },

  // Password reset fields - Link phase
  passwordResetLinkToken: String,
  passwordResetLinkExpires: Date,

  // Token versioning for session invalidation
  tokenVersion: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// REMOVED: Duplicate index definitions that were causing warnings
// The 'unique: true' in the schema above already creates indexes
// No need for additional schema.index() calls for email and username

// Index for faster lookups on verification and reset tokens
userSchema.index({ emailVerificationToken: 1 });
userSchema.index({ passwordResetLinkToken: 1 });

// Method to increment token version (invalidates all JWTs)
userSchema.methods.invalidateTokens = function() {
  this.tokenVersion += 1;
  return this.save();
};

// Method to clear password reset fields
userSchema.methods.clearPasswordResetFields = function() {
  this.passwordResetOtpHash = undefined;
  this.passwordResetOtpExpires = undefined;
  this.passwordResetAttempts = 0;
  this.passwordResetVerified = false;
  this.passwordResetLinkToken = undefined;
  this.passwordResetLinkExpires = undefined;
  return this.save();
};

// Method to clear email verification fields
userSchema.methods.clearEmailVerificationFields = function() {
  this.emailVerificationToken = undefined;
  this.emailVerificationExpires = undefined;
  return this.save();
};

module.exports = mongoose.model('User', userSchema);