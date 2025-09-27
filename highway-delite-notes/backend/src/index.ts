import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

import authRoutes from './routes/auth';
import noteRoutes from './routes/notes';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());

// Allow multiple origins (production + local dev)
const allowedOrigins = [
  process.env.FRONTEND_URL,                // primary configured frontend
  'http://localhost:5173',                 // local dev (vite)
  'https://notesapp-pearl-two.vercel.app'  // deployed Vercel frontend (fallback if not set in env)
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // non-browser or same-origin
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('CORS: Origin not allowed'));
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Root route (helpful for Render base URL checks)
app.get('/', (req, res) => {
  res.json({
    name: 'Highway Delite Notes API',
    status: 'OK',
    health: '/api/health',
    authEndpoints: ['/api/auth/signup','/api/auth/login','/api/auth/verify-otp','/api/auth/google','/api/auth/profile'],
    notesEndpoints: ['/api/notes','/api/notes/:id','/api/notes/search']
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use(errorHandler);

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI!);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

// Start server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
};

startServer();

export default app;
