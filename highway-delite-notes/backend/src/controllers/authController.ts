import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import OTP from '../models/OTP';
import emailService from '../services/emailService';
import googleAuthService from '../services/googleAuthService';
import { 
  SignupRequest, 
  LoginRequest, 
  VerifyOTPRequest, 
  GoogleAuthRequest,
  AuthRequest 
} from '../types';

const generateToken = (userId: string, email: string): string => {
  return jwt.sign(
    { id: userId, email },
    process.env.JWT_SECRET as string,
    { expiresIn: '7d' }
  );
};

export const signup = async (req: Request<{}, {}, SignupRequest>, res: Response) => {
  try {
    const { name, email, dateOfBirth, password } = req.body;

    // Validation
    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    if (name.length < 2 || name.length > 50) {
      return res.status(400).json({ message: 'Name must be between 2 and 50 characters' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // For email/password signup, password is required
    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Create user but don't save yet
    const userData: any = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      isEmailVerified: false
    };

    if (dateOfBirth) {
      const dob = new Date(dateOfBirth);
      if (isNaN(dob.getTime())) {
        return res.status(400).json({ message: 'Please enter a valid date of birth' });
      }
      userData.dateOfBirth = dob;
    }

    const user = new User(userData);
    await user.save();

    // Generate and send OTP
    const otp = emailService.generateOTP();
    
    // Save OTP to database
    await OTP.create({
      email: user.email,
      otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    });

    // Send OTP email
    await emailService.sendOTP(user.email, otp, user.name);

    res.status(201).json({
      message: 'User created successfully. Please verify your email with the OTP sent.',
      email: user.email,
      needsVerification: true
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const verifyOTP = async (req: Request<{}, {}, VerifyOTPRequest>, res: Response) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    // Find valid OTP
    const otpRecord = await OTP.findOne({
      email: email.toLowerCase().trim(),
      otp,
      isUsed: false,
      expiresAt: { $gt: new Date() }
    });

    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Mark OTP as used
    otpRecord.isUsed = true;
    await otpRecord.save();

    // Verify user email
    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase().trim() },
      { isEmailVerified: true },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate JWT token
    const token = generateToken(user._id!.toString(), user.email);

    res.json({
      message: 'Email verified successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        dateOfBirth: user.dateOfBirth,
        isEmailVerified: user.isEmailVerified
      }
    });

  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const login = async (req: Request<{}, {}, LoginRequest>, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if user signed up with Google
    if (user.googleId && !user.password) {
      return res.status(400).json({ 
        message: 'This account was created with Google. Please sign in with Google.' 
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      // Generate and send new OTP
      const otp = emailService.generateOTP();
      
      await OTP.create({
        email: user.email,
        otp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000)
      });

      await emailService.sendOTP(user.email, otp, user.name);

      return res.status(400).json({
        message: 'Please verify your email. A new OTP has been sent.',
        needsVerification: true,
        email: user.email
      });
    }

    // Generate JWT token
    const token = generateToken(user._id!.toString(), user.email);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        dateOfBirth: user.dateOfBirth,
        isEmailVerified: user.isEmailVerified
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const googleAuth = async (req: Request<{}, {}, GoogleAuthRequest>, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Google token is required' });
    }

    // Verify Google token
    const googleUser = await googleAuthService.verifyToken(token);

    // Check if user exists
    let user = await User.findOne({ 
      $or: [
        { email: googleUser.email },
        { googleId: googleUser.googleId }
      ]
    });

    if (user) {
      // Update existing user with Google ID if not set
      if (!user.googleId) {
        user.googleId = googleUser.googleId;
        user.isEmailVerified = true;
        await user.save();
      }
    } else {
      // Create new user
      user = new User({
        name: googleUser.name,
        email: googleUser.email,
        googleId: googleUser.googleId,
        isEmailVerified: true
      });
      await user.save();
    }

    // Generate JWT token
    const jwtToken = generateToken(user._id!.toString(), user.email);

    res.json({
      message: 'Google authentication successful',
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        dateOfBirth: user.dateOfBirth,
        isEmailVerified: user.isEmailVerified
      }
    });

  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ message: 'Google authentication failed' });
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user!.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        dateOfBirth: user.dateOfBirth,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const resendOTP = async (req: Request<{}, {}, { email: string }>, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    // Generate and send new OTP
    const otp = emailService.generateOTP();
    
    await OTP.create({
      email: user.email,
      otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    });

    await emailService.sendOTP(user.email, otp, user.name);

    res.json({ message: 'OTP sent successfully' });

  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
