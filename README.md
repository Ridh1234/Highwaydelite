# Highway Delite Notes App

A full-stack note-taking application built with React (TypeScript), Node.js (Express), and MongoDB. Features email/OTP authentication, Google OAuth integration, and JWT-based authorization.

## 🚀 Features

- **Authentication System**
  - Email/Password signup with OTP verification
  - Google OAuth integration
  - JWT-based authorization
  - Email verification system

- **Note Management**
  - Create, read, and delete notes
  - Rich text content support
  - Real-time updates
  - Mobile-responsive design

- **Security**
  - Password hashing with bcrypt
  - JWT token authentication
  - Input validation and sanitization
  - Protected routes

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **React Router** for navigation
- **Axios** for API communication
- **CSS3** with responsive design

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Nodemailer** for email services
- **Google Auth Library** for OAuth

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or higher)
- MongoDB (v5.0 or higher)
- npm or yarn package manager

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd highway-delite-notes
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env file with your configuration
# Required environment variables:
# - MONGODB_URI: Your MongoDB connection string
# - JWT_SECRET: A secure random string for JWT signing
# - EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS: SMTP configuration
# - GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET: Google OAuth credentials
```

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env file with your configuration
# Required environment variables:
# - VITE_API_URL: Backend API URL (default: http://localhost:5000/api)
# - VITE_GOOGLE_CLIENT_ID: Your Google OAuth client ID
```

### 4. Database Setup

Ensure MongoDB is running on your system:

```bash
# Start MongoDB (if using local installation)
mongod

# Or use MongoDB Compass/Atlas for cloud database
```

### 5. Email Configuration

For OTP functionality, configure SMTP settings in backend `.env`:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

**Note**: If using Gmail, you'll need to generate an App Password from your Google Account settings.

### 6. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized origins:
   - `http://localhost:5173` (development)
   - Your production domain
6. Copy the Client ID to your environment files

## 🚀 Running the Application

### Development Mode

1. **Start the Backend Server:**
   ```bash
   cd backend
   npm run dev
   ```
   The backend will start on `http://localhost:5000`

2. **Start the Frontend Development Server:**
   ```bash
   cd frontend
   npm run dev
   ```
   The frontend will start on `http://localhost:5173`

3. **Access the Application:**
   Open your browser and navigate to `http://localhost:5173`

### Production Build

1. **Build the Frontend:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Build the Backend:**
   ```bash
   cd backend
   npm run build
   ```

3. **Start Production Server:**
   ```bash
   cd backend
   npm start
   ```

## 📱 Usage

### Sign Up Process

1. Navigate to the signup page
2. Fill in your details (name, email, optional date of birth, password)
3. Click "Get OTP" to receive a verification code via email
4. Enter the 6-digit OTP to verify your email
5. You'll be automatically logged in and redirected to the dashboard

### Google Sign Up/In

1. Click the "Sign up with Google" or "Sign in with Google" button
2. Complete the Google authentication flow
3. You'll be automatically logged in and redirected to the dashboard

### Dashboard Features

- **Welcome Section**: Displays user information
- **Notes Management**: Create and delete notes
- **Responsive Design**: Works seamlessly on mobile and desktop

## 🔒 API Endpoints

### Authentication Routes

- `POST /api/auth/signup` - User registration
- `POST /api/auth/verify-otp` - Email verification
- `POST /api/auth/login` - User login
- `POST /api/auth/google` - Google OAuth
- `POST /api/auth/resend-otp` - Resend OTP
- `GET /api/auth/profile` - Get user profile (protected)

### Notes Routes (Protected)

- `GET /api/notes` - Get user notes
- `POST /api/notes` - Create new note
- `GET /api/notes/:id` - Get specific note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note
- `GET /api/notes/search` - Search notes

## 🎨 Design

The application follows the provided design specifications with:
- Clean, modern UI with HD branding
- Blue gradient color scheme (#667eea to #764ba2)
- Mobile-first responsive design
- Smooth transitions and hover effects
- Intuitive user experience

## 🔧 Environment Variables

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/highway-delite-notes
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

## 🚦 Testing

### Manual Testing Checklist

- [ ] User can sign up with email/password
- [ ] OTP is sent and can be verified
- [ ] User can sign in with existing credentials
- [ ] Google OAuth signup/signin works
- [ ] Protected routes require authentication
- [ ] User can create notes
- [ ] User can delete notes
- [ ] Notes persist after logout/login
- [ ] Responsive design works on mobile
- [ ] Error handling works properly

### Running Tests

```bash
# Backend tests (if implemented)
cd backend
npm test

# Frontend tests (if implemented)
cd frontend
npm test
```

## 🚀 Deployment

### Recommended Deployment Platforms

#### Frontend
- **Vercel** (Recommended)
- **Netlify**
- **AWS S3 + CloudFront**

#### Backend
- **Railway** (Recommended)
- **Heroku**
- **AWS EC2**
- **DigitalOcean App Platform**

#### Database
- **MongoDB Atlas** (Recommended)
- **AWS DocumentDB**

### Deployment Steps

1. **Deploy Backend:**
   - Update environment variables for production
   - Deploy to chosen platform
   - Update CORS settings for production domain

2. **Deploy Frontend:**
   - Update `VITE_API_URL` to production backend URL
   - Build and deploy to chosen platform

3. **Update Google OAuth:**
   - Add production domain to authorized origins
   - Update redirect URIs if necessary

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error:**
   - Check if MongoDB is running
   - Verify connection string in .env file

2. **Google OAuth Not Working:**
   - Verify Google Client ID is correct
   - Check authorized origins in Google Cloud Console
   - Ensure script is loading correctly

3. **Email OTP Not Sending:**
   - Verify SMTP configuration
   - Check if app password is generated (for Gmail)
   - Check spam folder

4. **JWT Token Issues:**
   - Ensure JWT_SECRET is set and consistent
   - Check token expiration settings

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🔗 Links

- [Live Demo](#) - (Add your deployment URL here)
- [API Documentation](#) - (Add API docs link if available)
- [Design Mockups](#) - (Add design links if available)

---

## 📸 Application Interface Screenshots

### Authentication & Verification
- Sign Up (Desktop)
   ![Sign Up Interface](./frontend/public/signupinterface.png)
- Sign In (Desktop)
   ![Sign In Interface](./frontend/public/signininterface.png)
- Sign In (Mobile)
   ![Sign In Mobile](./frontend/public/signinmobile.png)
- OTP Verification
   ![OTP Page](./frontend/public/otppage.png)

### Dashboard
- Dashboard (Desktop)
   ![Dashboard Desktop](./frontend/public/Dashboard.png)
- Dashboard (Mobile)
   ![Dashboard Mobile](./frontend/public/dashboardmobile.png)

### Shared Assets
- Background Image
   ![Background Image](./frontend/public/bg-image.png)
- Logo
   ![Logo](./frontend/public/logo.png)

> Keep this section updated if you add or rename interface images in `frontend/public`.
