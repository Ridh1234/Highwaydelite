import { Request } from 'express';
import { Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  dateOfBirth?: Date;
  googleId?: string;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface INote extends Document {
  title: string;
  content: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOTP extends Document {
  email: string;
  otp: string;
  expiresAt: Date;
  isUsed: boolean;
  createdAt: Date;
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export interface SignupRequest {
  name: string;
  email: string;
  dateOfBirth?: string;
  password?: string;
}

export interface LoginRequest {
  email: string;
  password?: string;
}

export interface VerifyOTPRequest {
  email: string;
  otp: string;
}

export interface GoogleAuthRequest {
  token: string;
}

export interface CreateNoteRequest {
  title: string;
  content: string;
}

export interface UpdateNoteRequest {
  title?: string;
  content?: string;
}
