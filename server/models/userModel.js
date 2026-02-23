const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Display name is required'],
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        // Unified rule: 4-20 chars, lowercase letters/numbers/underscores only, no __, no leading/trailing _
        const unifiedRegex = /^(?![_])(?!.*__)(?![a-z0-9_]*_$)[a-z0-9_]{4,20}$/;
        if (!unifiedRegex.test(v)) return false;

        // Must contain at least one letter
        if (!/[a-z]/.test(v)) return false;

        // Block reserved words
        const reserved = ['admin', 'support', 'picsta', 'official', 'moderator', 'staff'];
        return !reserved.includes(v);
      },
      message: props => `${props.value} is invalid. Name must be 4-20 chars long, use only letters/numbers/underscores, and no consecutive underscores.`
    }
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        // Unified rule (must start with @): 4-20 chars after @, lowercase letters/numbers/underscores only, no __, no leading/trailing _
        const usernameRegex = /^@(?![_])(?!.*__)(?![a-z0-9_]*_$)[a-z0-9_]{4,20}$/;
        if (!usernameRegex.test(v)) return false;

        // Must contain at least one letter (after @)
        const namePart = v.substring(1);
        if (!/[a-z]/.test(namePart)) return false;

        // Block reserved words
        const reserved = ['admin', 'support', 'picsta', 'official', 'moderator', 'staff'];
        return !reserved.includes(namePart);
      },
      message: props => `${props.value} is invalid. Username must start with @, be 4-20 chars long (after @), use only letters/numbers/underscores, and no consecutive underscores.`
    }
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
    required: function() { return !this.googleId && !this.facebookId; } // Required only if not a social user
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  facebookId: {
    type: String,
    unique: true,
    sparse: true
  },
  dob: {
    type: Date,
    required: function() { return !this.googleId && !this.facebookId; } // Required only if not a social user
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other', 'Not Specified'],
    default: 'Not Specified'
  },
  bio: {
    type: String,
    maxlength: [150, 'Bio cannot exceed 150 characters'],
    default: ''
  },
  profilePicture: {
    type: String,
    default: 'https://static.vecteezy.com/system/resources/previews/036/280/650/non_2x/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg'
  },
  postsCount: {
    type: Number,
    default: 0
  },
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isVerified: {
    type: Boolean,
    default: false
  },

  // Email verification fields
  emailVerificationToken: String,
  emailVerificationExpires: Date,

  // Password reset fields
  resetPasswordToken: String,
  resetPasswordExpires: Date,

  // Token versioning for session invalidation
  tokenVersion: {
    type: Number,
    default: 0
  },
  recentSearches: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

// REMOVED: Duplicate index definitions that were causing warnings
// The 'unique: true' in the schema above already creates indexes
// No need for additional schema.index() calls for email and username

// Index for faster lookups on verification and reset tokens
userSchema.index({ emailVerificationToken: 1 });
userSchema.index({ resetPasswordToken: 1 });

// Method to increment token version (invalidates all JWTs)
userSchema.methods.invalidateTokens = function() {
  this.tokenVersion += 1;
  return this.save();
};

// Method to clear password reset fields
userSchema.methods.clearPasswordResetFields = function() {
  this.resetPasswordToken = undefined;
  this.resetPasswordExpires = undefined;
  return this.save();
};

// Method to clear email verification fields
userSchema.methods.clearEmailVerificationFields = function() {
  this.emailVerificationToken = undefined;
  this.emailVerificationExpires = undefined;
  return this.save();
};

module.exports = mongoose.model('User', userSchema);