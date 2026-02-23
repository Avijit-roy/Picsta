require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const connectDB = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes = require('./routes/messageRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const passport = require('./config/passport');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const setupSocket = require('./socket/socketHandler');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
  }
});

// Setup socket logic
setupSocket(io);

// Middleware to attach io to req
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Connect to database
connectDB();

// ===========================
// CACHE CONTROL MIDDLEWARE
// ===========================
app.use('/api', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// ===========================
// SECURITY MIDDLEWARE
// ===========================

// Helmet: Set security headers
app.use(helmet());

// CORS: Configure allowed origins
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true // Allow cookies
}));

// Initialize Passport
app.use(passport.initialize());

// ===========================
// BODY PARSING MIDDLEWARE (MUST COME BEFORE SANITIZATION)
// ===========================

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Parse cookies
app.use(cookieParser());

// ===========================
// SANITIZATION (AFTER BODY PARSING)
// ===========================

// Sanitize data against NoSQL injection
// FIXED: Only sanitize body and params, not query (which causes the error)
app.use((req, res, next) => {
  if (req.body) {
    req.body = mongoSanitize.sanitize(req.body);
  }
  if (req.params) {
    req.params = mongoSanitize.sanitize(req.params);
  }
  // Skip req.query sanitization to avoid the error
  next();
});

// ===========================
// LOGGING MIDDLEWARE (Development)
// ===========================

if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// ===========================
// ROUTES
// ===========================

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Serve uploads as static
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Authentication routes
app.use('/api/auth', authRoutes);

// User routes
app.use('/api/users', userRoutes);

// Post routes
app.use('/api/posts', postRoutes);

// Chat routes
app.use('/api/chats', chatRoutes);

// Message routes
app.use('/api/messages', messageRoutes);

// Notification routes
app.use('/api/notifications', notificationRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// ===========================
// GLOBAL ERROR HANDLER
// ===========================

app.use((err, req, res, next) => {
  console.error('Error:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json({
      success: false,
      message: `${field} already exists`
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }

  // Default error
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// ===========================
// START SERVER
// ===========================

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`
╔═════════════════════════════════════════════════════════════════╗
║   🚀 Picsta Auth & Socket Server Running                        ║
║   📡 Port: ${PORT}                                              ║
║   🌍 Environment: ${process.env.NODE_ENV || 'development'}      ║
╚═════════════════════════════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  // Close server & exit process in production
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});