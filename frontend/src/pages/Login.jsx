import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { Check } from 'lucide-react';
import Preloader from '../components/Preloader';
import './Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, googleLoginWithToken } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSuccess = async (response) => {
    try {
      await googleLoginWithToken(response.credential);
      navigate('/');
    } catch (err) {
      setError('Google Auth failed. Ensure your Client ID is valid.');
    }
  };

  const handleGoogleError = () => {
    setError('Google Sign-In was unsuccessful. Try again.');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="auth-split-container">
      <div className="auth-left">
        <div className="auth-left-content">
          <h2 className="logo-text">FlowDesk</h2>
          <p className="hero-text">Manage your tasks with seamless flow.</p>
          
          {/* Floating task cards illustration */}
          <div className="floating-cards">
            <div className="float-card card-1">
              <div className="fc-header">
                <span className="fc-title">Design System Update</span>
                <span className="fc-badge fc-high">High</span>
              </div>
              <div className="fc-footer">
                <div className="fc-avatar"></div>
              </div>
            </div>
            
            <div className="float-card card-2">
              <div className="fc-checkbox">
                <Check size={12} strokeWidth={4} />
              </div>
              <span className="fc-title" style={{textDecoration: 'line-through', color: '#64748b'}}>Homepage Hero</span>
            </div>
          </div>
        </div>
        <div className="grid-noise-overlay"></div>
        <div className="geometric-bg-1"></div>
        <div className="geometric-bg-2"></div>
      </div>
      
      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-header">
            <h2>Welcome Back</h2>
            <p>Log in to your account to continue</p>
          </div>
          
          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="floating-form-group">
              <input 
                type="email" 
                className="floating-input" 
                placeholder=" "
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
              <label className="floating-label">Email Address</label>
            </div>
            <div className="floating-form-group">
              <input 
                type="password" 
                className="floating-input" 
                placeholder=" "
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
              <label className="floating-label">Password</label>
            </div>
            
            <button type="submit" className="btn-glowing-teal">Sign In</button>
            
            <div className="divider">
              <span>OR</span>
            </div>
            
            <div className="google-login-center">
              <GoogleLogin 
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="filled_blue"
                shape="pill"
                width="100%"
              />
            </div>
          </form>

          <div className="auth-footer">
            <p>Don't have an account? <Link to="/register">Create one</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
