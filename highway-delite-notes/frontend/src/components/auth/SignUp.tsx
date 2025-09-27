import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import type { SignupData, ErrorResponse } from '../../types';

const SignUp: React.FC = () => {
  // Removed dateOfBirth per new requirement
  const [formData, setFormData] = useState<SignupData>({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showOTPForm, setShowOTPForm] = useState(false);
  const [otp, setOTP] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Load Google Identity Services and render button
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your-google-client-id',
          callback: async (response: any) => {
            try {
              setLoading(true); setError('');
              const result = await authAPI.googleAuth(response.credential);
              login(result.data.token!, result.data.user!);
              navigate('/dashboard');
            } catch (err: any) {
              const errorData: ErrorResponse = err.response?.data || { message: 'Google sign up failed' }; setError(errorData.message);
            } finally { setLoading(false); }
          }
        });
        const container = document.getElementById('google-signup-button');
        if (container) {
          window.google.accounts.id.renderButton(container, {
            theme: 'outline',
            size: 'large',
            width: '100%',
            text: 'signup_with'
          });
        }
      }
    };

    return () => { if (document.body.contains(script)) document.body.removeChild(script); };
  }, [login, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); setError('');
  };

  const validate = () => {
    if (!formData.name.trim()) return 'Name is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return 'Valid email required';
    if (formData.password.length < 6) return 'Password must be at least 6 characters';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); const v = validate(); if (v) { setError(v); return; }
    try {
      setLoading(true); setError(''); setSuccess('');
      const res = await authAPI.signup(formData);
      if (res.data.needsVerification) { setShowOTPForm(true); setUserEmail(res.data.email || formData.email); setSuccess('OTP sent to your email'); }
    } catch (err: any) {
      const errorData: ErrorResponse = err.response?.data || { message: 'Signup failed' }; setError(errorData.message);
    } finally { setLoading(false); }
  };

  // Google sign up handled via credential callback; no manual button needed now

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); if (otp.length !== 6) { setError('Enter 6 digit OTP'); return; }
    try {
      setLoading(true); setError('');
      const res = await authAPI.verifyOTP({ email: userEmail, otp });
      login(res.data.token!, res.data.user!); navigate('/dashboard');
    } catch (err: any) {
      const errorData: ErrorResponse = err.response?.data || { message: 'OTP verification failed' }; setError(errorData.message);
    } finally { setLoading(false); }
  };

  const handleResendOTP = async () => {
    try { setLoading(true); await authAPI.resendOTP(userEmail); setSuccess('OTP resent'); }
    catch { setError('Failed to resend OTP'); }
    finally { setLoading(false); }
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
            {success && <div className="success-message">{success}</div>}
            <div className="form-group"><label className="form-label">OTP</label><input className="form-input otp-input" value={otp} onChange={e=>setOTP(e.target.value.replace(/\D/g,'').slice(0,6))} maxLength={6} placeholder="000000" /></div>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? <div className="spinner" /> : 'Verify'}</button>
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
          <h1 className="auth-title">Sign up</h1>
          <p className="auth-subtitle">Sign up to enjoy the feature of HD</p>
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          <div id="google-signup-button" style={{ width: '100%', marginBottom: '12px' }} />
          <div className="form-group"><label className="form-label">Your Name</label><input name="name" value={formData.name} onChange={handleInputChange} className="form-input" placeholder="Jonas Khanwald" required /></div>
          <div className="form-group"><label className="form-label">Email</label><input name="email" type="email" value={formData.email} onChange={handleInputChange} className="form-input" placeholder="jonas_khanwald@gmail.com" required /></div>
          <div className="form-group"><label className="form-label">Password</label><input name="password" type="password" value={formData.password} onChange={handleInputChange} className="form-input" placeholder="Enter your password" required /></div>
          <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? <div className="spinner"/> : 'Get OTP'}</button>
          <div className="auth-link">Already have an account? <Link to="/signin">Sign in</Link></div>
        </form>
      </div>
      <div className="auth-right">
        <img src="/bg-image.png" alt="Background" className="auth-bg" />
      </div>
    </div>
  );
};

export default SignUp;
