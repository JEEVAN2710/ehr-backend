import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Input from '../components/Input';
import api from '../services/api';
import {
  Mail,
  Lock,
  User,
  Phone,
  Calendar,
  AlertCircle,
  Activity,
  CheckCircle,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { validateEmail, validatePassword, getPasswordStrength, validatePhone } from '../utils/utils';
import { USER_ROLES } from '../utils/constants';
import './Auth.css';

const Signup = () => {
  const { verifyOtp } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Registration Form, 2: OTP Verification
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: USER_ROLES.PATIENT,
    phoneNumber: '',
    dateOfBirth: ''
  });
  const [phoneConfirmed, setPhoneConfirmed] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    setServerError('');
  };

  const validateStep1 = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      newErrors.password = 'Password must meet requirements';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.phoneNumber) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!validatePhone(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Invalid phone number format';
    }

    if (!phoneConfirmed) {
      newErrors.phoneConfirmed = 'Please confirm your phone number is correct';
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStep1Submit = async (e) => {
    e.preventDefault();

    if (!validateStep1()) return;

    setLoading(true);
    setServerError('');

    try {
      const { confirmPassword, ...registrationData } = formData;
      await api.register(registrationData);
      setOtpSent(true);
      setStep(2);
    } catch (error) {
      setServerError(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setServerError('');

    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();

    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setServerError('Please enter the complete 6-digit OTP');
      return;
    }

    setLoading(true);
    setServerError('');

    try {
      await verifyOtp(formData.email, otpValue);
      navigate('/dashboard');
    } catch (error) {
      setServerError(error.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setServerError('');

    try {
      await api.resendOtp(formData.email);
      setOtp(['', '', '', '', '', '']);
      // Show success message
      alert('New OTP sent to your email!');
    } catch (error) {
      setServerError(error.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = formData.password ? getPasswordStrength(formData.password) : null;
  const passwordValidation = validatePassword(formData.password);

  return (
    <div className="auth-container">
      <div className="auth-card glass animate-scaleIn">
        <div className="auth-header">
          <div className="auth-logo">
            <Activity size={40} className="logo-icon" />
          </div>
          <h1 className="auth-title">
            {step === 1 ? 'Create Account' : 'Verify Your Email'}
          </h1>
          <p className="auth-subtitle">
            {step === 1
              ? 'Sign up to get started with your health records'
              : `Enter the 6-digit code sent to ${formData.email}`
            }
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleStep1Submit} className="auth-form">
            {serverError && (
              <div className="error-alert">
                <AlertCircle size={20} />
                <span>{serverError}</span>
              </div>
            )}

            <div className="form-row">
              <Input
                label="First Name"
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="John"
                icon={<User size={18} />}
                error={errors.firstName}
                required
              />

              <Input
                label="Last Name"
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Doe"
                error={errors.lastName}
                required
              />
            </div>

            <Input
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your.email@example.com"
              icon={<Mail size={18} />}
              error={errors.email}
              required
            />

            <div className="input-wrapper">
              <label className="input-label">
                Role<span className="input-required">*</span>
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="input-field"
              >
                <option value={USER_ROLES.PATIENT}>Patient</option>
                <option value={USER_ROLES.DOCTOR}>Doctor</option>
                <option value={USER_ROLES.LAB_ASSISTANT}>Lab Assistant</option>
              </select>
            </div>

            <Input
              label="Phone Number"
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="+1234567890"
              icon={<Phone size={18} />}
              error={errors.phoneNumber}
              required
            />

            <div style={{ marginTop: '-8px', marginBottom: 'var(--spacing-md)' }}>
              <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={phoneConfirmed}
                  onChange={(e) => {
                    setPhoneConfirmed(e.target.checked);
                    if (errors.phoneConfirmed) {
                      setErrors(prev => ({ ...prev, phoneConfirmed: '' }));
                    }
                  }}
                  style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                />
                <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                  I confirm this is my correct phone number
                </span>
              </label>
              {errors.phoneConfirmed && (
                <div style={{ color: 'var(--color-error)', fontSize: '12px', marginTop: '4px', marginLeft: '24px' }}>
                  {errors.phoneConfirmed}
                </div>
              )}
            </div>

            <Input
              label="Date of Birth"
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              icon={<Calendar size={18} />}
              error={errors.dateOfBirth}
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

            {formData.password && (
              <div className="password-strength">
                <div className="strength-bar">
                  <div
                    className="strength-fill"
                    style={{
                      width: passwordValidation.isValid ? '100%' : '33%',
                      backgroundColor: passwordStrength?.color || '#6b7280'
                    }}
                  />
                </div>
                <div className="password-requirements">
                  {passwordValidation.errors.map((error, i) => (
                    <div key={i} className="requirement-item">
                      <span className="requirement-icon">✗</span>
                      {error}
                    </div>
                  ))}
                  {passwordValidation.isValid && (
                    <div className="requirement-item requirement-met">
                      <CheckCircle size={14} />
                      All requirements met!
                    </div>
                  )}
                </div>
              </div>
            )}

            <Input
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              icon={<Lock size={18} />}
              error={errors.confirmPassword}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              icon={<ArrowRight size={18} />}
            >
              {loading ? 'Creating Account...' : 'Continue'}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="auth-form">
            {serverError && (
              <div className="error-alert">
                <AlertCircle size={20} />
                <span>{serverError}</span>
              </div>
            )}

            <div className="otp-container">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  className="otp-input"
                  autoFocus={index === 0}
                />
              ))}
            </div>

            <div className="otp-info">
              <p>Didn't receive the code?</p>
              <button
                type="button"
                onClick={handleResendOtp}
                className="resend-button"
                disabled={loading}
              >
                Resend OTP
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
            >
              {loading ? 'Verifying...' : 'Verify & Sign Up'}
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="lg"
              fullWidth
              onClick={() => setStep(1)}
              icon={<ArrowLeft size={18} />}
              disabled={loading}
            >
              Back to Registration
            </Button>
          </form>
        )}

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="auth-link">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
