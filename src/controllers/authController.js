import { validationResult } from 'express-validator';
import { User } from '../models/User.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../services/jwtService.js';
import { sendMail } from '../services/mailService.js';
import { createAndSendOTP, verifyOTP as verifyOTPService } from '../services/otpService.js';
import { resetUserPassword } from '../services/passwordResetService.js';
import bcrypt from 'bcryptjs';

// Step 1: Register user and send OTP (user created but not verified)
export const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { firstName, lastName, email, password, role = 'patient', phoneNumber, dateOfBirth } = req.body;

    console.log(`\n📝 Registration attempt for: ${email} (${role})`);

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      // If user exists but is not verified, allow resending OTP
      if (!existingUser.isVerified) {
        console.log(`♻️  User exists but not verified. Resending OTP to: ${email}`);
        const fullName = [existingUser.firstName, existingUser.lastName].filter(Boolean).join(' ');
        const otpResult = await createAndSendOTP(email, fullName, existingUser._id);

        return res.status(200).json({
          success: true,
          message: 'User already exists but not verified. OTP has been resent.',
          data: {
            email: existingUser.email,
            requiresVerification: true,
            otpExpiresAt: otpResult.expiresAt,
          },
        });
      }

      console.log(`❌ Registration failed: Email already registered (${email})`);
      return res.status(409).json({
        success: false,
        message: 'Email already registered and verified',
      });
    }

    // Create new user (not verified yet)
    console.log(`✨ Creating new user: ${email}`);
    const newUser = new User({
      firstName,
      lastName,
      email,
      password,
      role,
      phoneNumber,
      dateOfBirth,
      isVerified: false,
      isActive: false, // Account inactive until email is verified
    });

    await newUser.save();
    console.log(`✅ User created successfully: ${email}`);

    // Generate and send OTP
    const fullName = [firstName, lastName].filter(Boolean).join(' ');
    console.log(`🔐 Generating OTP for: ${email}`);
    const otpResult = await createAndSendOTP(email, fullName, newUser._id);

    return res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email for OTP verification code.',
      data: {
        email: newUser.email,
        requiresVerification: true,
        otpExpiresAt: otpResult.expiresAt,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message,
    });
  }
};

// Step 2: Verify OTP and activate account
export const verifyOTP = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { email, otp } = req.body;

    // Verify OTP
    const otpVerification = await verifyOTPService(email, otp);

    if (!otpVerification.success) {
      return res.status(400).json({
        success: false,
        message: otpVerification.message,
      });
    }

    // Find and activate user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.isVerified = true;
    user.isActive = true;
    await user.save();

    // Generate tokens
    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      data: {
        user: user.toJSON(),
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'OTP verification failed',
      error: error.message,
    });
  }
};

// Resend OTP
export const resendOTP = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email',
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Account is already verified',
      });
    }

    const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ');
    const otpResult = await createAndSendOTP(email, fullName, user._id);

    return res.status(200).json({
      success: true,
      message: 'OTP has been resent to your email',
      data: {
        email: user.email,
        otpExpiresAt: otpResult.expiresAt,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to resend OTP',
      error: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User account is inactive',
      });
    }

    const isPasswordValid = await user.matchPassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.toJSON(),
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message,
    });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { refreshToken: token } = req.body;

    const decoded = verifyRefreshToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token',
      });
    }

    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive',
      });
    }

    const newAccessToken = generateAccessToken(user._id, user.role);
    const newRefreshToken = generateRefreshToken(user._id);

    return res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Token refresh failed',
      error: error.message,
    });
  }
};

// Get current user profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        user: user.toJSON(),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve profile',
      error: error.message,
    });
  }
};

// Change password
export const changePassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Verify current password
    const isPasswordValid = await user.matchPassword(currentPassword);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: error.message,
    });
  }
};

// Get all users (admin only)
export const getAllUsers = async (req, res) => {
  try {
    const { skip: rawSkip = 0, limit: rawLimit = 10, role, isActive } = req.query;

    const skip = parseInt(rawSkip, 10);
    const limit = Math.min(parseInt(rawLimit, 10), 100); // Max 100 items per page

    // Build filter
    const filter = {};
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    return res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: {
        users: users.map(user => user.toJSON()),
        pagination: {
          total,
          skip,
          limit,
          hasMore: skip + limit < total,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve users',
      error: error.message,
    });
  }
};

// Update user status (admin only)
export const updateUserStatus = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { userId } = req.params;
    const { isActive } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.isActive = isActive;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        user: user.toJSON(),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update user status',
      error: error.message,
    });
  }
};

// Forgot Password - Send temporary password via email
export const forgotPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { email } = req.body;

    const result = await resetUserPassword(email);

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to reset password',
    });
  }
};

// Update user details (admin only)
export const updateUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { userId } = req.params;
    const { email, role, phoneNumber } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if email is being changed and if it's already in use
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email is already in use',
        });
      }
      user.email = email;
    }

    // Update role if provided
    if (role) {
      user.role = role;
    }

    // Update phone number if provided (can be empty string to clear it)
    if (phoneNumber !== undefined) {
      user.phoneNumber = phoneNumber || null;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: {
        user: user.toJSON(),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error.message,
    });
  }
};

export default {
  register,
  verifyOTP,
  resendOTP,
  login,
  refreshToken,
  getProfile,
  changePassword,
  getAllUsers,
  updateUserStatus,
  forgotPassword,
  updateUser,
};
