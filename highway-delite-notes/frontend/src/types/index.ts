export interface User {
  id: string;
  name: string;
  email: string;
  dateOfBirth?: string;
  isEmailVerified: boolean;
}

export interface Note {
  _id: string;
  title: string;
  content: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  message: string;
  token?: string;
  user?: User;
  needsVerification?: boolean;
  email?: string;
}

export interface SignupData {
  name: string;
  email: string;
  dateOfBirth?: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface VerifyOTPData {
  email: string;
  otp: string;
}

export interface CreateNoteData {
  title: string;
  content: string;
}

export interface UpdateNoteData {
  title?: string;
  content?: string;
}

export interface ErrorResponse {
  message: string;
  errors?: string[];
}

// Google Auth types
declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (parent: HTMLElement, options: any) => void;
          prompt: () => void;
        };
      };
    };
  }
}
