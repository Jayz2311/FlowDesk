import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Check } from 'lucide-react';
import Preloader from '../components/Preloader';
import './Auth.css';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
   const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(name, email, password);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="auth-split-container">
      <div className="auth-left">
        <div className="auth-left-content">
          <h2 className="logo-text">FlowDesk</h2>
          <p className="hero-text">Start your journey towards perfect task management.</p>
          
          <div className="floating-cards">
            <div className="float-card card-1">
              <div className="fc-header">
                <span className="fc-title">New Team Workspace</span>
                <span className="fc-badge fc-high">Active</span>
              </div>
              <div className="fc-footer">
                <div className="fc-avatar"></div>
              </div>
            </div>
            
            <div className="float-card card-2">
              <div className="fc-checkbox">
                <Check size={12} strokeWidth={4} />
              </div>
              <span className="fc-title" style={{textDecoration: 'line-through', color: '#64748b'}}>Setup Profile</span>
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
            <h2>Create Account</h2>
            <p>Join FlowDesk today and boost your productivity</p>
          </div>
          
          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="floating-form-group">
              <input 
                type="text" 
                className="floating-input" 
                placeholder=" "
                value={name} 
                onChange={(e) => setName(e.target.value)}
                required 
              />
              <label className="floating-label">Full Name</label>
            </div>
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
            <button type="submit" className="btn-glowing-teal">Sign Up</button>
          </form>

          <div className="auth-footer">
            <p>Already have an account? <Link to="/login">Sign in</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
