import axios from 'axios';
import type { AxiosResponse } from 'axios';
import type {
  AuthResponse,
  SignupData,
  LoginData,
  VerifyOTPData,
  Note,
  CreateNoteData,
  UpdateNoteData,
  User,
} from '../types';

// Prefer environment variable; fallback to deployed Render backend if not set.
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://highwaydelite-k3i2.onrender.com/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/signin';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  signup: (data: SignupData): Promise<AxiosResponse<AuthResponse>> =>
    api.post('/auth/signup', data),
  
  login: (data: LoginData): Promise<AxiosResponse<AuthResponse>> =>
    api.post('/auth/login', data),
  
  verifyOTP: (data: VerifyOTPData): Promise<AxiosResponse<AuthResponse>> =>
    api.post('/auth/verify-otp', data),
  
  googleAuth: (token: string): Promise<AxiosResponse<AuthResponse>> =>
    api.post('/auth/google', { token }),
  
  getProfile: (): Promise<AxiosResponse<{ user: User }>> =>
    api.get('/auth/profile'),
  
  resendOTP: (email: string): Promise<AxiosResponse<{ message: string }>> =>
    api.post('/auth/resend-otp', { email }),
};

// Notes API
export const notesAPI = {
  getNotes: (page = 1, limit = 10): Promise<AxiosResponse<{
    notes: Note[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }>> =>
    api.get(`/notes?page=${page}&limit=${limit}`),
  
  getNote: (id: string): Promise<AxiosResponse<{ note: Note }>> =>
    api.get(`/notes/${id}`),
  
  createNote: (data: CreateNoteData): Promise<AxiosResponse<{
    message: string;
    note: Note;
  }>> =>
    api.post('/notes', data),
  
  updateNote: (id: string, data: UpdateNoteData): Promise<AxiosResponse<{
    message: string;
    note: Note;
  }>> =>
    api.put(`/notes/${id}`, data),
  
  deleteNote: (id: string): Promise<AxiosResponse<{ message: string }>> =>
    api.delete(`/notes/${id}`),
  
  searchNotes: (query: string): Promise<AxiosResponse<{ notes: Note[] }>> =>
    api.get(`/notes/search?q=${encodeURIComponent(query)}`),
};

export default api;
