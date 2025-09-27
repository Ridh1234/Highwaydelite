import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import type { LoginData, ErrorResponse } from '../../types';

const SignIn: React.FC = () => {
  const [formData, setFormData] = useState<LoginData>({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [showOTPForm, setShowOTPForm] = useState(false);
  const [otp, setOTP] = useState('');
  const [userEmail, setUserEmail] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Load Google Identity Services
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your-google-client-id',
          callback: handleGoogleSignIn,
        });

        const googleButton = document.getElementById('google-signin-button');
        if (googleButton) {
          window.google.accounts.id.renderButton(googleButton, {
            theme: 'outline',
            size: 'large',
            width: '100%',
            text: 'signin_with',
          });
        }
      }
    };

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleGoogleSignIn = async (response: any) => {
    try {
      setLoading(true);
      const result = await authAPI.googleAuth(response.credential);
      login(result.data.token!, result.data.user!);
      navigate('/dashboard');
    } catch (error: any) {
      const errorData: ErrorResponse = error.response?.data || { message: 'Google sign in failed' };
      setError(errorData.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const validateForm = (): string | null => {
    if (!formData.email.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return 'Please enter a valid email';
    if (!formData.password) return 'Password is required';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError('');

      const result = await authAPI.login(formData);
      
      if (result.data.needsVerification) {
        setShowOTPForm(true);
        setUserEmail(result.data.email || formData.email);
      } else {
        login(result.data.token!, result.data.user!);
        navigate('/dashboard');
      }
    } catch (error: any) {
      const errorData: ErrorResponse = error.response?.data || { message: 'Login failed' };
      setError(errorData.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const result = await authAPI.verifyOTP({ email: userEmail, otp });
      login(result.data.token!, result.data.user!);
      navigate('/dashboard');
    } catch (error: any) {
      const errorData: ErrorResponse = error.response?.data || { message: 'OTP verification failed' };
      setError(errorData.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      setLoading(true);
      setError('');
      await authAPI.resendOTP(userEmail);
      setError('');
      // Show success message
      alert('OTP sent successfully!');
    } catch (error: any) {
      const errorData: ErrorResponse = error.response?.data || { message: 'Failed to resend OTP' };
      setError(errorData.message);
    } finally {
      setLoading(false);
    }
  };

  if (showOTPForm) {
    return (
      <div className="auth-container otp-view">
        <div className="auth-left">
          <form className="auth-form" onSubmit={handleOTPSubmit}>
            <div className="logo"><img src="/logo.png" alt="Logo" className="logo-image" /><span className="logo-text">HD</span></div>
            <h1 className="auth-title">Verify Email</h1>
            <p className="auth-subtitle">Enter the 6-digit code sent to {userEmail}</p>
            {error && <div className="error-message">{error}</div>}
            <div className="form-group"><label className="form-label">OTP</label><input className="form-input otp-input" placeholder="000000" value={otp} onChange={e=>setOTP(e.target.value.replace(/\D/g,'').slice(0,6))} maxLength={6} /></div>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? <div className="spinner"/> : 'Verify'}</button>
            <div className="auth-link" style={{marginTop:'16px'}}>Didn't get code? <button type="button" onClick={handleResendOTP} disabled={loading} style={{background:'none',border:'none',padding:0,cursor:'pointer',color:'#1d64e9',fontWeight:500}}>Resend OTP</button></div>
          </form>
        </div>
        <div className="auth-right" />
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="brand-header">
        <img src="/logo.png" alt="Logo" className="logo-image" />
        <span className="logo-text">HD</span>
      </div>
      <div className="auth-left">
        <form className="auth-form" onSubmit={handleSubmit}>
          <h1 className="auth-title">Sign in</h1>
          <p className="auth-subtitle">Please login to continue to your account.</p>
          {error && <div className="error-message">{error}</div>}
          <div id="google-signin-button" style={{ width: '100%', marginBottom: '12px' }} />
          <div className="form-group"><label className="form-label">Email</label><input name="email" type="email" className="form-input" placeholder="Enter your email" value={formData.email} onChange={handleInputChange} /></div>
          <div className="form-group"><label className="form-label">Password</label><input name="password" type="password" className="form-input" placeholder="Enter your password" value={formData.password} onChange={handleInputChange} /></div>
          <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? <div className="spinner"/> : 'Sign in'}</button>
          <div className="auth-link">Need an account? <Link to="/signup">Create one</Link></div>
        </form>
      </div>
      <div className="auth-right">
        <img src="/bg-image.png" alt="Background" className="auth-bg" />
      </div>
    </div>
  );
};

export default SignIn;
