require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const morgan = require('morgan');
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
const { globalApiLimiter } = require('./middleware/rateLimiter');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Enable trust proxy for production environments (e.g. Nginx, Cloudflare)
app.set('trust proxy', 1);

// Enable Gzip compression
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

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
// GLOBAL API RATE LIMITER
// Safety-net: 200 requests per 15 min per IP across all /api routes
// Feature-specific limiters (stricter) are applied per-route
// ===========================
app.use('/api', globalApiLimiter);

// ===========================
// SECURITY MIDDLEWARE
// ===========================

// Helmet: Set security headers with relaxed CSP for images
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "blob:", "https://res.cloudinary.com", "http://localhost:5000", "https://i.pravatar.cc", "https://static.vecteezy.com", "https://images.unsplash.com"],
      connectSrc: ["'self'", "ws://localhost:5173", "http://localhost:5000"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'", "https://res.cloudinary.com"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));


// CORS: In production the client is served from same origin — no CORS needed.
// In development, allow the Vite dev server origin.
if (process.env.NODE_ENV !== 'production') {
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
  }));
}

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
// LOGGING MIDDLEWARE (Development - Custom)
// Combined with morgan above
// ===========================
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    // Already handled by morgan('dev')
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

// Serve uploads as static with caching in production
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: process.env.NODE_ENV === 'production' ? 86400000 : 0 // 1 day in ms
}));

// ===========================
// PRODUCTION STATIC CLIENT
// Serve the built React app from server/public/
// Must come BEFORE API routes so /api still takes priority
// ===========================
if (process.env.NODE_ENV === 'production') {
  // Use long-term caching for built assets (index.html is NOT cached here)
  app.use(express.static(path.join(__dirname, 'public'), {
    maxAge: 86400000, // 1 day in ms
    index: false // Let the catch-all handle index.html for SPAs
  }));
}

// Authentication routes
app.use('/api/auth', authRoutes);

// User routes
app.use('/api/users', userRoutes);

// Post routes
app.use('/api/posts', postRoutes);

// Story routes
const storyRoutes = require('./routes/storyRoutes');
app.use('/api/stories', storyRoutes);

// Chat routes
app.use('/api/chats', chatRoutes);

// Message routes
app.use('/api/messages', messageRoutes);

// Notification routes
app.use('/api/notifications', notificationRoutes);

// ===========================
// SPA CATCH-ALL (must be after all API routes)
// In production: serve index.html for any unmatched GET so React Router works.
// In development: return 404 JSON (Vite handles routing on the frontend).
// ===========================
if (process.env.NODE_ENV === 'production') {
  // Express 5 / path-to-regexp v8 requires named wildcard params — use /{*splat}
  app.get('/{*splat}', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
} else {
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: 'Route not found'
    });
  });
}

// ===========================
// GLOBAL ERROR HANDLER
// ===========================

app.use((err, req, res, next) => {
  // Always log the full error to console for server logs
  console.error('Error Details:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method
  });

  const isProduction = process.env.NODE_ENV === 'production';

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

  // Default error: Hide internal details in production
  const statusCode = err.statusCode || 500;
  const message = isProduction && statusCode === 500 
    ? 'Internal server error' 
    : (err.message || 'Internal server error');

  res.status(statusCode).json({
    success: false,
    message
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