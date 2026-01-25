import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Input from '../components/Input';
import api from '../services/api';
import { Mail, Lock, AlertCircle, Activity, CheckCircle } from 'lucide-react';
import { validateEmail } from '../utils/utils';
import './Auth.css';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    identifier: '', // Can be email or phone
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    setServerError('');
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.identifier) {
      newErrors.identifier = 'Email or phone number is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    setServerError('');

    try {
      // Determine if identifier is email or phone
      const isEmail = validateEmail(formData.identifier);
      const loginData = {
        password: formData.password
      };

      if (isEmail) {
        loginData.email = formData.identifier;
      } else {
        loginData.phoneNumber = formData.identifier;
      }

      await login(loginData.email || loginData.phoneNumber, formData.password, !isEmail);
      navigate('/dashboard');
    } catch (error) {
      setServerError(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    if (!forgotEmail) {
      setForgotError('Please enter your email address');
      return;
    }

    if (!validateEmail(forgotEmail)) {
      setForgotError('Please enter a valid email address');
      return;
    }

    setForgotLoading(true);
    setForgotError('');

    try {
      await api.forgotPassword(forgotEmail);
      setResetSuccess(true);
    } catch (error) {
      setForgotError(error.message || 'Failed to send reset email');
    } finally {
      setForgotLoading(false);
    }
  };

  const closeForgotPasswordModal = () => {
    setShowForgotPassword(false);
    setForgotEmail('');
    setForgotError('');
    setResetSuccess(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass animate-scaleIn">
        <div className="auth-header">
          <div className="auth-logo">
            <Activity size={40} className="logo-icon" />
          </div>
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to access your health records</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {serverError && (
            <div className="error-alert">
              <AlertCircle size={20} />
              <span>{serverError}</span>
            </div>
          )}

          <Input
            label="Email or Phone Number"
            type="text"
            name="identifier"
            value={formData.identifier}
            onChange={handleChange}
            placeholder="your.email@example.com or +1234567890"
            icon={<Mail size={18} />}
            error={errors.identifier}
            required
          />

          <Input
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            icon={<Lock size={18} />}
            error={errors.password}
            required
          />

          <div style={{ textAlign: 'right', marginTop: '-8px', marginBottom: '8px' }}>
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="forgot-password-link"
            >
              Forgot Password?
            </button>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/signup" className="auth-link">Create Account</Link>
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="modal-overlay" onClick={closeForgotPasswordModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {!resetSuccess ? (
              <>
                <h2 style={{ marginBottom: '8px' }}>Reset Password</h2>
                <p style={{ color: 'var(--color-text-secondary)', marginBottom: '24px', fontSize: '14px' }}>
                  Enter your email address and we'll send you a temporary password.
                </p>

                {forgotError && (
                  <div className="error-alert" style={{ marginBottom: '16px' }}>
                    <AlertCircle size={20} />
                    <span>{forgotError}</span>
                  </div>
                )}

                <form onSubmit={handleForgotPassword}>
                  <Input
                    label="Email Address"
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => {
                      setForgotEmail(e.target.value);
                      setForgotError('');
                    }}
                    placeholder="your.email@example.com"
                    icon={<Mail size={18} />}
                    required
                  />

                  <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                    <Button
                      type="button"
                      variant="ghost"
                      fullWidth
                      onClick={closeForgotPasswordModal}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      fullWidth
                      loading={forgotLoading}
                    >
                      {forgotLoading ? 'Sending...' : 'Send Reset Email'}
                    </Button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <div style={{ textAlign: 'center' }}>
                  <CheckCircle size={48} style={{ color: 'var(--color-success)', margin: '0 auto 16px' }} />
                  <h2 style={{ marginBottom: '8px' }}>Check Your Email!</h2>
                  <p style={{ color: 'var(--color-text-secondary)', marginBottom: '24px', fontSize: '14px' }}>
                    If an account exists with that email, we've sent a temporary password.
                    Check your inbox and use it to log in.
                  </p>
                </div>
                <Button
                  variant="primary"
                  fullWidth
                  onClick={closeForgotPasswordModal}
                >
                  Got it!
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
