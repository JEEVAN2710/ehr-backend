import express from 'express';
import { body, param } from 'express-validator';
import {
  register,
  verifyOTP,
  resendOTP,
  login,
  refreshToken,
  getProfile,
  updateProfile,
  changePassword,
  getAllUsers,
  updateUserStatus,
  forgotPassword,
  updateUser,
  verifyPatientEmail,
  getEligibleUploaders,
} from '../controllers/authController.js';
import rateLimit from 'express-rate-limit';
import authenticateToken from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/roles.js';


const router = express.Router();

// Rate limiters
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50,
  message: 'Too many login attempts, please try again later',
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50,
  message: 'Too many registration attempts from this IP, please try again later',
});

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: 'Too many OTP requests, please try again later',
});

// Registration - Step 1: Create account and send OTP
router.post(
  '/register',
  registerLimiter,
  [
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/[a-z]/)
      .withMessage('Password must contain at least one lowercase letter')
      .matches(/[A-Z]/)
      .withMessage('Password must contain at least one uppercase letter')
      .matches(/[0-9]/)
      .withMessage('Password must contain at least one number')
      .matches(/[!@#$%^&*(),.?":{}|<>]/)
      .withMessage('Password must contain at least one special character'),
    body('role').optional().isIn(['patient', 'doctor', 'labassistant']).withMessage('Invalid role'),
    body('phoneNumber').notEmpty().withMessage('Phone number is required').isMobilePhone().withMessage('Invalid phone number'),
    body('dateOfBirth').notEmpty().withMessage('Date of birth is required').isISO8601().withMessage('Invalid date format'),
  ],
  register
);

// OTP Verification - Step 2: Verify OTP and activate account
router.post(
  '/verify-otp',
  otpLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('otp')
      .trim()
      .isLength({ min: 6, max: 6 })
      .isNumeric()
      .withMessage('OTP must be a 6-digit number'),
  ],
  verifyOTP
);

// Resend OTP
router.post(
  '/resend-otp',
  otpLimiter,
  [body('email').isEmail().normalizeEmail().withMessage('Valid email is required')],
  resendOTP
);

// Forgot Password
router.post(
  '/forgot-password',
  otpLimiter,
  [body('email').isEmail().normalizeEmail().withMessage('Valid email is required')],
  forgotPassword
);

// Login
router.post(
  '/login',
  loginLimiter,
  [
    body('email').optional().isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('phoneNumber').optional().isMobilePhone().withMessage('Valid phone number is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  login
);

// Refresh token
router.post(
  '/refresh',
  [body('refreshToken').notEmpty().withMessage('Refresh token is required')],
  refreshToken
);

// Get current user profile (authenticated)
router.get('/profile', authenticateToken, getProfile);

// Update current user profile (authenticated)
router.put(
  '/profile',
  authenticateToken,
  [
    body('phoneNumber').optional().isMobilePhone().withMessage('Invalid phone number'),
    body('dateOfBirth').optional().isISO8601().withMessage('Invalid date format'),
  ],
  updateProfile
);

// Change password (authenticated)
router.put(
  '/change-password',
  authenticateToken,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters')
      .matches(/[a-z]/)
      .withMessage('New password must contain at least one lowercase letter')
      .matches(/[A-Z]/)
      .withMessage('New password must contain at least one uppercase letter')
      .matches(/[0-9]/)
      .withMessage('New password must contain at least one number')
      .matches(/[!@#$%^&*(),.?":{}|<>]/)
      .withMessage('New password must contain at least one special character'),
  ],
  changePassword
);

// Verify patient - for doctors and lab assistants
router.get(
  '/verify-patient',
  authenticateToken,
  authorizeRoles('doctor', 'labassistant'),
  verifyPatientEmail
);

// Get all users (admin only)
router.get('/users', authenticateToken, authorizeRoles('admin'), getAllUsers);

// Update user status (admin only)
router.put(
  '/users/:userId/status',
  authenticateToken,
  authorizeRoles('admin'),
  [
    param('userId').isMongoId().withMessage('Valid user ID is required'),
    body('isActive').isBoolean().withMessage('isActive must be a boolean'),
  ],
  updateUserStatus
);

// Update user details (admin only)
router.put(
  '/users/:userId',
  authenticateToken,
  authorizeRoles('admin'),
  [
    param('userId').isMongoId().withMessage('Valid user ID is required'),
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('role').optional().isIn(['patient', 'doctor', 'labassistant', 'admin']).withMessage('Invalid role'),
    body('phoneNumber').optional().isMobilePhone().withMessage('Invalid phone number'),
  ],
  updateUser
);

// Get eligible uploaders (admin only)
router.get('/users/eligible-uploaders', authenticateToken, authorizeRoles('admin'), getEligibleUploaders);

export default router;

