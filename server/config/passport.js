const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/userModel');

// Shared logic for creating or finding a user via Social OAuth
const handleSocialLogin = async (idField, profile, done) => {
  try {
    const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
    
    // 1. Try to find user by social ID (googleId or facebookId)
    let user = await User.findOne({ [idField]: profile.id });
    
    if (user) {
      return done(null, user);
    }

    if (!email) {
      return done(new Error('Email is required for social login, but not provided by social provider.'), null);
    }

    // 2. If not found by ID, try to find by email
    user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      // Link social ID to existing email account
      user[idField] = profile.id;
      user.isVerified = true; 
      await user.save();
      return done(null, user);
    }

    // 3. Create new user if none exists
    const normalize = (str) => {
      let clean = str.toLowerCase()
        .replace(/[^a-z0-9_]/g, '_') // Replace invalid chars with _
        .replace(/__+/g, '_')        // No consecutive underscores
        .replace(/^_+|_+$/g, '');   // No leading/trailing underscores
      
      // Ensure at least 4 chars (pad if necessary)
      if (clean.length < 4) clean = (clean + 'base').substring(0, 4);
      // Trim to 20 chars
      if (clean.length > 20) clean = clean.substring(0, 20);
      
      // Ensure at least one letter
      if (!/[a-z]/.test(clean)) clean = 'user' + clean.substring(0, 16);
      
      return clean;
    };

    let normalizedName = normalize(profile.displayName || profile.name?.givenName || 'user');
    let baseUsername = '@' + normalize(profile.username || profile.displayName || 'user');
    
    let username = baseUsername;
    let counter = 1;
    
    while (await User.findOne({ username })) {
      const suffix = counter.toString();
      const allowedLength = 21 - suffix.length;
      username = baseUsername.substring(0, allowedLength) + suffix;
      counter++;
    }

    user = await User.create({
      name: normalizedName,
      username: username,
      email: email.toLowerCase(),
      [idField]: profile.id,
      isVerified: true 
    });

    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
};

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || 'dummy_id',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy_secret',
    callbackURL: "/api/auth/google/callback",
    proxy: true
  },
  (accessToken, refreshToken, profile, done) => handleSocialLogin('googleId', profile, done)
));

passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID || 'dummy_id',
    clientSecret: process.env.FACEBOOK_APP_SECRET || 'dummy_secret',
    callbackURL: "/api/auth/facebook/callback",
    profileFields: ['id', 'displayName', 'emails', 'name'],
    proxy: true
  },
  (accessToken, refreshToken, profile, done) => handleSocialLogin('facebookId', profile, done)
));

// We are not using passport sessions (using JWT cookies instead)
// But passport requires these methods if initialized with session: false is not handled correctly in some middlewares
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => User.findById(id, (err, user) => done(err, user)));

module.exports = passport;
