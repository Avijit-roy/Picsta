# Picsta

> A full-stack Instagram-inspired social media platform for sharing photos, videos, reels, and stories — built for a rich, real-time social experience.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-ISC-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-19.x-61DAFB.svg)

---

## Overview

**Picsta** solves the need for a self-hosted, privacy-conscious social media alternative. It replicates core Instagram-like functionality — photo feeds, reels, stories, direct messaging, and notifications — while giving developers full ownership of the backend and data.

**Target users:** Developers building social apps, students learning full-stack development, and teams wanting a self-hosted media-sharing platform.

**What makes it different:**

- Full ownership and control of data — no third-party analytics
- JWT + HTTP-only cookie auth with a dedicated refresh token flow
- Real-time messaging and notifications via Socket.IO
- Google and Facebook OAuth out of the box
- Centralized media handling via Cloudinary
- **Production-ready**: Gzip compression, edge caching, and PM2 process management
- **Security-first**: Multi-layer rate limiting and NoSQL injection protection

---

## Features

- 🔐 **Authentication** — Register, login, email verification, password reset, Google OAuth, Facebook OAuth
- 📸 **Posts** — Create, edit, delete image/video posts; like, save, and comment
- 📖 **Stories** — 24-hour ephemeral stories with view tracking
- 🎞️ **Reels** — Short-form video feed with like and share support
- 💬 **Direct Messages** — Real-time 1:1 chat with media support via Socket.IO
- 🔔 **Notifications** — Real-time follow, like, and comment notifications
- 👤 **Profiles** — Editable profiles with followers/following, posts grid, and saved posts tabs
- 🔍 **Search** — Live username search with recent search history
- 🌙 **Dark UI** — Full dark-mode Instagram-style interface
- 📱 **Responsive** — Mobile-first layout with bottom navigation bar for small screens

---

## File Structure

```
picsta/
├── client/                         # React frontend (Vite)
│   ├── public/                     # Static assets (logo, favicon)
│   └── src/
│       ├── App.jsx                 # Root component with router config
│       ├── main.jsx                # React DOM entry point
│       ├── assets/                 # Images and static media assets
│       ├── components/             # All UI components
│       │   ├── Auth/               # Login, Register, VerifyEmail, PasswordReset pages
│       │   ├── MainPage/           # Core app shell and sub-views
│       │   │   ├── MainPage.jsx    # Main layout with state-based navigation
│       │   │   ├── ProfilePage.jsx # User profile view
│       │   │   ├── messagepage/    # Direct messages view and components
│       │   │   └── MainpageComponents/
│       │   │       ├── CreatePost/     # Post creation wizard with cropper
│       │   │       ├── PostFeed/       # Feed, PostItem, PostSkeleton, LikersModal
│       │   │       ├── ProfileSection/ # UserCard, EditProfileModal, ImageCropper
│       │   │       ├── ReelsSection/   # Reels player, ReelsSkeleton
│       │   │       ├── SideBar/        # Desktop sidebar, MobileBottomNavigation
│       │   │       └── StoriesSection/ # Stories carousel, StoryViewerModal
│       │   ├── PasswordReset/      # Forgot/reset password pages
│       │   └── TitleHandler.jsx    # Global route-based title updater
│       ├── context/                # React Context providers
│       │   ├── AuthContext.jsx     # AuthProvider component (JWT session)
│       │   ├── AuthUtils.js        # AuthContext + useAuth hook export
│       │   ├── ConfirmDialogContext.jsx # Confirm dialog provider
│       │   └── ConfirmDialogUtils.js   # useConfirm hook export
│       ├── hooks/                  # Custom React hooks
│       │   └── usePageTitle.js     # Reusable page title setter
│       ├── services/               # Axios API service modules
│       │   ├── api.js              # Axios instance with interceptors
│       │   ├── authService.js      # Auth API calls
│       │   ├── postService.js      # Posts API calls
│       │   ├── userService.js      # Users API calls
│       │   ├── storyService.js     # Stories API calls
│       │   ├── chatService.js      # Chats API calls
│       │   ├── messageService.js   # Messages API calls
│       │   ├── notificationService.js # Notifications API calls
│       │   └── socketService.js    # Socket.IO client wrapper
│       └── utils/                  # Utility functions and config
│           ├── cropImage.js        # Canvas-based image crop helper
│           └── titleConfig.js      # Centralized route→title mapping
│
└── server/                         # Node.js + Express backend (CommonJS)
    ├── server.js                   # App entry point, middleware stack, Socket.IO setup
    ├── config/                     # Configuration modules
    │   ├── db.js                   # MongoDB connection via Mongoose
    │   └── passport.js             # Passport Google + Facebook OAuth strategies
    ├── controllers/                # MVC controllers (request handlers)
    │   ├── authController.js       # Register, login, OAuth, token refresh
    │   ├── userController.js       # Profile, follow, search
    │   ├── postController.js       # CRUD posts, likes, saves, comments
    │   ├── storyController.js      # Stories CRUD and view tracking
    │   ├── chatController.js       # Chat session creation and listing
    │   ├── messageController.js    # Message send and retrieval
    │   └── notificationController.js # Notification CRUD
    ├── middleware/                 # Express middleware
    │   ├── authMiddleware.js       # JWT verification middleware
    │   ├── rateLimiter.js          # Route-level rate limiting
    │   └── uploadMiddleware.js     # Multer + Cloudinary upload configs
    ├── models/                     # Mongoose data models
    │   ├── userModel.js            # User schema (auth, profile, follow graph)
    │   ├── postModel.js            # Post schema (media, likes, comments, saves)
    │   ├── commentModel.js         # Embedded comment schema
    │   ├── storyModel.js           # Story schema with TTL expiry
    │   ├── chatModel.js            # Chat session schema
    │   ├── messageModel.js         # Message schema with media support
    │   └── notificationModel.js    # Notification schema
    ├── routes/                     # Express route definitions
    │   ├── authRoutes.js           # /api/auth/*
    │   ├── userRoutes.js           # /api/users/*
    │   ├── postRoutes.js           # /api/posts/*
    │   ├── storyRoutes.js          # /api/stories/*
    │   ├── chatRoutes.js           # /api/chats/*
    │   ├── messageRoutes.js        # /api/messages/*
    │   └── notificationRoutes.js   # /api/notifications/*
    ├── socket/                     # Socket.IO event handlers
    │   └── socketHandler.js        # Real-time messaging and notification logic
    ├── utils/                      # Server utility functions
    │   ├── generateToken.js        # JWT access + refresh token generators
    │   └── sendEmail.js            # Nodemailer email sender
    ├── public/                     # (Production) Built frontend files served by Express
    ├── logs/                       # (Production) Server logs
    ├── ecosystem.config.js         # PM2 production process configuration
    └── uploads/                    # Temporary local upload storage
```

---

## Prerequisites

Ensure you have the following installed and configured before setup:

| Requirement                | Version        | Notes                                         |
| -------------------------- | -------------- | --------------------------------------------- |
| **Node.js**                | ≥ 18.x         | Required for both client and server           |
| **npm**                    | ≥ 9.x          | Comes bundled with Node.js                    |
| **MongoDB**                | Atlas or local | Connection URI required in `.env`             |
| **Cloudinary account**     | —              | For image/video hosting. Free tier sufficient |
| **Google Cloud project**   | —              | OAuth 2.0 credentials (Client ID + Secret)    |
| **Facebook Developer app** | —              | Facebook App ID + Secret for OAuth            |
| **Gmail account**          | —              | SMTP App Password for email delivery          |

---

## Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/avijitroy/picsta.git
cd picsta
```

### 2. Set up the Backend

```bash
cd server
npm install
```

Create a `.env` file in `server/` based on the template below:

```bash
cp .env.example .env
# Then edit .env with your actual credentials
```

```bash
node server.js
# Or with auto-reload:
npx nodemon server.js
```

The server will run at: `http://localhost:5000`

### 3. Production Deployment (Single Server)

Picsta is designed to be served from a single Node.js instance in production.

1. **Build the Client**:
   ```bash
   cd client
   npm install
   npm run build
   ```
   *This bundles the React app into `server/public/`.*

2. **Start the Production Server**:
   ```bash
   cd server
   NODE_ENV=production npm start
   ```

3. **Using PM2 (Recommended)**:
   ```bash
   cd server
   pm2 start ecosystem.config.js --env production
   ```

---

## Environment Variables

### Server — `server/.env`

| Variable                | Description                           | Required | Example                                          |
| ----------------------- | ------------------------------------- | -------- | ------------------------------------------------ |
| `JWT_ACCESS_SECRET`     | Secret key for signing access tokens  | ✅       | `<64-char hex string>`                           |
| `JWT_REFRESH_SECRET`    | Secret key for signing refresh tokens | ✅       | `<64-char hex string>`                           |
| `MONGODB_URI`           | MongoDB connection string             | ✅       | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `EMAIL_HOST`            | SMTP host for email delivery          | ✅       | `smtp.gmail.com`                                 |
| `EMAIL_PORT`            | SMTP port                             | ✅       | `587`                                            |
| `EMAIL_USER`            | SMTP sender email address             | ✅       | `yourapp@gmail.com`                              |
| `EMAIL_PASSWORD`        | SMTP App Password (Gmail)             | ✅       | `xxxx xxxx xxxx xxxx`                            |
| `FRONTEND_URL`          | Client origin for CORS and redirects  | ✅       | `http://localhost:5173`                          |
| `BACKEND_URL`           | Server origin (used for OAuth)        | ✅       | `http://localhost:5000`                          |
| `NODE_ENV`              | Runtime environment                   | ✅       | `production` or `development`                    |
| `GOOGLE_CLIENT_ID`      | Google OAuth 2.0 Client ID            | ✅       | `*.apps.googleusercontent.com`                   |
| `GOOGLE_CLIENT_SECRET`  | Google OAuth 2.0 Client Secret        | ✅       | `GOCSPX-***`                                     |
| `FACEBOOK_APP_ID`       | Facebook Developer App ID             | ✅       | `123456789`                                      |
| `FACEBOOK_APP_SECRET`   | Facebook Developer App Secret         | ✅       | `abc123...`                                      |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name                 | ✅       | `your-cloud-name`                                |
| `CLOUDINARY_API_KEY`    | Cloudinary API key                    | ✅       | `437549418268542`                                |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret                 | ✅       | `your-api-secret`                                |
| `SPECIAL_MAIL`          | Optional admin notification email     | ❌       | `admin@yourdomain.com`                           |

> **Generate secrets securely:**
>
> ```bash
> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
> ```

### Client — `client/.env` (Optional)

In development, the client uses a proxy. In production, it uses relative URLs. If you need to override the API endpoint manually, you can use:

| Variable        | Description                  | Example                  |
| --------------- | ---------------------------- | ------------------------ |
| `VITE_API_URL`  | Custom API backend base URL  | `http://api.yoursite.com` |

Otherwise, it defaults to the same-origin `/api` in production.

---

## Scripts

### Backend (`server/`)

| Script | Command                 | Description                            |
| ------ | ----------------------- | -------------------------------------- |
| Start  | `node server.js`        | Start the production server            |
| Dev    | `npx nodemon server.js` | Start with auto-reload on file changes |

### Frontend (`client/`)

| Script  | Command           | Description                          |
| ------- | ----------------- | ------------------------------------ |
| Dev     | `npm run dev`     | Start Vite dev server with HMR       |
| Build   | `npm run build`   | Bundle for production to `dist/`     |
| Preview | `npm run preview` | Locally preview the production build |
| Lint    | `npm run lint`    | Run ESLint on all source files       |

---

## Usage

### Registering and Logging In

1. Open `http://localhost:5173/register` and fill in your details.
2. A verification email will be sent — click the link to activate your account.
3. Log in at `/login` or use the **Continue with Google** / **Continue with Facebook** OAuth buttons.

### Core Workflows

**Posting content:**

1. Click the **+** (Create) button in the sidebar.
2. Upload a photo or video, add a caption, and post.

**Browsing the feed:**

- The home feed shows posts from accounts you follow.
- Switch to **Reels** in the sidebar for short-form videos.

**Messaging:**

- Click on a user's profile and select **Message** to open a direct chat.
- Messages are delivered in real-time via WebSocket.

**Stories:**

- Stories appear at the top of the feed. Click any avatar to view.
- Upload your own story via the **+** story icon.

### Reusable Hook Example

```js
// Use the usePageTitle hook to set the browser tab title
import { usePageTitle } from "../hooks/usePageTitle";

const MyPage = () => {
  usePageTitle("Dashboard"); // → "Dashboard | Picsta"
  // ...
};
```

---

## API Reference

**Base URL:** `http://localhost:5000/api`

All protected routes require an active session cookie (`accessToken` HTTP-only cookie set by the server on login).

### Auth — `/api/auth`

| Method | Endpoint               | Description                          | Auth |
| ------ | ---------------------- | ------------------------------------ | ---- |
| `POST` | `/register`            | Register a new user (rate limited)   | No   |
| `POST` | `/verify-email`        | Verify email with OTP/token          | No   |
| `POST` | `/resend-verification` | Resend the verification email        | No   |
| `POST` | `/login`               | Log in, sets auth cookies            | No   |
| `POST` | `/logout`              | Clear auth cookies                   | No   |
| `POST` | `/refresh`             | Refresh access token via cookie      | No   |
| `POST` | `/forgot-password`     | Request password reset link          | No   |
| `POST` | `/reset-password`      | Reset password with token            | No   |
| `GET`  | `/me`                  | Get the currently authenticated user | ✅   |
| `POST` | `/change-password`     | Change password (requires current)   | ✅   |
| `GET`  | `/google`              | Initiate Google OAuth flow           | No   |
| `GET`  | `/google/callback`     | Google OAuth callback                | No   |
| `GET`  | `/facebook`            | Initiate Facebook OAuth flow         | No   |
| `GET`  | `/facebook/callback`   | Facebook OAuth callback              | No   |

**Login request/response:**

```json
// POST /api/auth/login
// Request body:
{
  "email": "user@example.com",
  "password": "yourpassword"
}

// Response:
{
  "success": true,
  "data": {
    "user": {
      "_id": "...",
      "username": "@johndoe",
      "email": "user@example.com",
      "profilePicture": "https://..."
    }
  }
}
```

### Users — `/api/users` (All Protected)

| Method   | Endpoint                   | Description                        | Auth |
| -------- | -------------------------- | ---------------------------------- | ---- |
| `GET`    | `/profile`                 | Get own profile                    | ✅   |
| `PUT`    | `/profile`                 | Update own profile                 | ✅   |
| `POST`   | `/profile/profilePicture`  | Upload profile picture (multipart) | ✅   |
| `GET`    | `/u/:username`             | Get a user's profile by username   | ✅   |
| `GET`    | `/search/:query`           | Search users by username           | ✅   |
| `POST`   | `/toggle-follow/:id`       | Follow or unfollow a user          | ✅   |
| `GET`    | `/recent-searches`         | Get recent user searches           | ✅   |
| `DELETE` | `/recent-searches`         | Clear all recent searches          | ✅   |
| `DELETE` | `/recent-searches/:userId` | Remove a single recent search      | ✅   |
| `GET`    | `/:id/followers`           | Get a user's followers list        | ✅   |
| `GET`    | `/:id/following`           | Get a user's following list        | ✅   |

### Posts — `/api/posts` (All Protected)

| Method   | Endpoint                       | Description                        | Auth |
| -------- | ------------------------------ | ---------------------------------- | ---- |
| `GET`    | `/`                            | Get paginated feed posts           | ✅   |
| `POST`   | `/`                            | Create a post (multipart media)    | ✅   |
| `GET`    | `/user/:username`              | Get all posts by a user            | ✅   |
| `GET`    | `/saved`                       | Get current user's saved posts     | ✅   |
| `GET`    | `/reels`                       | Get reels feed                     | ✅   |
| `PATCH`  | `/:id`                         | Update a post (caption, etc.)      | ✅   |
| `DELETE` | `/:id`                         | Delete a post                      | ✅   |
| `POST`   | `/:id/like`                    | Toggle like on a post              | ✅   |
| `GET`    | `/:id/likers`                  | Get list of users who liked a post | ✅   |
| `POST`   | `/:id/save`                    | Toggle save on a post              | ✅   |
| `POST`   | `/:id/comments`                | Add a comment                      | ✅   |
| `GET`    | `/:id/comments`                | Get comments for a post            | ✅   |
| `DELETE` | `/:postId/comments/:commentId` | Delete a comment                   | ✅   |

### Stories — `/api/stories` (All Protected)

| Method   | Endpoint       | Description                        | Auth |
| -------- | -------------- | ---------------------------------- | ---- |
| `GET`    | `/`            | Get active stories grouped by user | ✅   |
| `POST`   | `/`            | Create a story (multipart media)   | ✅   |
| `POST`   | `/:id/view`    | Mark a story as viewed             | ✅   |
| `DELETE` | `/:id`         | Delete a story                     | ✅   |
| `GET`    | `/:id/viewers` | Get list of viewers for a story    | ✅   |

### Chats — `/api/chats` (All Protected)

| Method   | Endpoint   | Description                       | Auth |
| -------- | ---------- | --------------------------------- | ---- |
| `POST`   | `/`        | Create or retrieve a chat session | ✅   |
| `GET`    | `/`        | Get all chats for current user    | ✅   |
| `DELETE` | `/:chatId` | Hide/remove a chat                | ✅   |

### Messages — `/api/messages` (All Protected)

| Method | Endpoint   | Description                     | Auth |
| ------ | ---------- | ------------------------------- | ---- |
| `POST` | `/`        | Send a text message             | ✅   |
| `POST` | `/upload`  | Upload and send a media message | ✅   |
| `GET`  | `/:chatId` | Get all messages in a chat      | ✅   |

### Notifications — `/api/notifications` (All Protected)

| Method   | Endpoint     | Description                            | Auth |
| -------- | ------------ | -------------------------------------- | ---- |
| `GET`    | `/`          | Get all notifications for current user | ✅   |
| `PATCH`  | `/mark-read` | Mark notifications as read             | ✅   |
| `DELETE` | `/clear-all` | Delete all notifications               | ✅   |
| `DELETE` | `/:id`       | Delete a single notification           | ✅   |

---

## Contributing

Contributions are welcome! Please follow this process:

### 1. Fork and Branch

```bash
git fork https://github.com/avijitroy/picsta.git
git checkout -b feat/your-feature-name
```

### Branch Naming Convention

| Prefix   | Use for                         |
| -------- | ------------------------------- |
| `feat/`  | New features                    |
| `fix/`   | Bug fixes                       |
| `chore/` | Dependency updates, refactoring |
| `docs/`  | Documentation changes           |

### 2. Conventional Commits

All commit messages must follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(scope): <short summary>

Examples:
feat(auth): add Facebook OAuth login
fix(posts): correct like count not updating in real-time
chore(deps): upgrade react to v19.2
docs(readme): add environment variable table
```

### 3. Pre-submission Checklist

- [ ] Code passes `npm run lint` (client)
- [ ] No new `console.log` statements left in production paths
- [ ] New features include inline comments explaining logic
- [ ] Environment variable changes are documented in this README

### 4. Open a Pull Request

- Target the `main` branch
- Write a clear PR description explaining _what_ changed and _why_
- Link any related issues

---

## License

This project is licensed under the **MIT License**.  
See the [LICENSE](./LICENSE) file for details.

---

## Contact

**Avijit Roy**

- 📧 Email: [MY MAIL](mailto:aj5298626@gmail.com)
- 🐙 GitHub: [@avijitroy](https://github.com/Avijit-roy)

---

<p align="center">Made with ❤️ by Avijit Roy</p>
