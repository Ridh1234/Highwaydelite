import express from 'express';
import { 
  signup, 
  verifyOTP, 
  login, 
  googleAuth, 
  getProfile, 
  resendOTP 
} from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Public routes
router.post('/signup', signup);
router.post('/verify-otp', verifyOTP);
router.post('/login', login);
router.post('/google', googleAuth);
router.post('/resend-otp', resendOTP);

// Protected routes
router.get('/profile', authenticateToken, getProfile);

export default router;
