import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Input from '../components/Input';
import api from '../services/api';
import { Mail, Lock, AlertCircle, Shield, CheckCircle, Stethoscope, Activity, FileText, Syringe, Clock, Smartphone } from 'lucide-react';
import { validateEmail } from '../utils/utils';
import './Login.css';

const Login = () => {
  const { login, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    identifier: '',
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
  const [unlocking, setUnlocking] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
      const isEmail = validateEmail(formData.identifier);
      const loginData = { password: formData.password };

      if (isEmail) {
        loginData.email = formData.identifier;
      } else {
        loginData.phoneNumber = formData.identifier;
      }

      await login(loginData.email || loginData.phoneNumber, formData.password, !isEmail);
      // Trigger vault unlock animation before navigating
      setUnlocking(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2200);
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

  // If user is already logged in and NOT in the unlock animation, redirect to dashboard
  if (user && !unlocking) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="vault-login-page">
      {/* Ambient background glow */}
      <div className="vault-ambient-light"></div>

      {/* Vault 3D Scene */}
      <div className={`vault-scene-container ${unlocking ? 'vault-is-unlocking' : ''}`}>
        <div className="vault-assembly">
          {/* Central vault core */}
          <div className="vault-core">
            <div className="vault-door">
              <div className="vault-handle"></div>
            </div>
          </div>

          {/* Orbit rings with medical icons */}
          <div className="vault-orbit-ring vault-orbit-1">
            <div className="vault-icon-floater vault-pos-1">
              <Stethoscope size={24} />
            </div>
            <div className="vault-icon-floater vault-pos-2">
              <Activity size={24} />
            </div>
            <div className="vault-icon-floater vault-pos-3">
              <Shield size={24} />
            </div>
          </div>

          <div className="vault-orbit-ring vault-orbit-2">
            <div className="vault-icon-floater vault-pos-4">
              <FileText size={24} />
            </div>
            <div className="vault-icon-floater vault-pos-5">
              <Syringe size={24} />
            </div>
            <div className="vault-icon-floater vault-pos-6">
              <Clock size={24} />
            </div>
          </div>

          <div className="vault-orbit-ring vault-orbit-3">
            <div className="vault-icon-floater vault-pos-7">
              <Lock size={24} />
            </div>
            <div className="vault-icon-floater vault-pos-8">
              <Smartphone size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Success Message */}
      <div className={`vault-success-message ${unlocking ? 'vault-success-visible' : ''}`}>
        ACCESS GRANTED<br />RECORDS DECRYPTED
      </div>

      {/* Login Form Overlay */}
      <form className={`vault-login-overlay ${unlocking ? 'vault-form-hiding' : ''}`} onSubmit={handleSubmit}>
        <div className="vault-app-header">
          <h1>Medi Locker <span>EHR</span></h1>
          <p className="vault-subtitle">Secure Provider Access</p>
        </div>

        {serverError && (
          <div className="vault-error-alert">
            <AlertCircle size={18} />
            <span>{serverError}</span>
          </div>
        )}

        <Input
          label="Provider ID / Email"
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
          label="Secure Key"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="••••••••"
          icon={<Lock size={18} />}
          error={errors.password}
          required
        />

        <div style={{ textAlign: 'right', marginTop: '-8px', marginBottom: '4px' }}>
          <button
            type="button"
            onClick={() => setShowForgotPassword(true)}
            className="vault-forgot-link"
          >
            Forgot Password?
          </button>
        </div>

        <button type="submit" className="vault-submit-btn" disabled={loading}>
          {loading ? 'Authenticating...' : 'Authenticate & Unlock'}
        </button>

        <div className="vault-auth-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/signup" className="vault-auth-link">Create Account</Link>
          </p>
        </div>
      </form>

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
