import { OTP } from '../models/OTP.js';
import { sendMail } from './mailService.js';

/**
 * Generate a 6-digit OTP code
 */
export const generateOTPCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Create and send OTP to user's email
 * @param {string} email - User's email address
 * @param {string} name - User's name for personalization
 * @param {string} userId - Optional user ID to associate
 * @returns {Promise<object>} OTP document
 */
export const createAndSendOTP = async (email, name = 'User', userId = null) => {
    try {
        // Invalidate any previous OTPs for this email
        await OTP.updateMany(
            { email, verified: false },
            { expiresAt: new Date() }
        );

        // Generate new OTP
        const code = generateOTPCode();

        // Create OTP document
        const otp = new OTP({
            email,
            code,
            userId,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
        });

        await otp.save();

        // Send OTP via email
        const emailSent = await sendOTPEmail(email, name, code);

        return {
            success: true,
            otpId: otp._id,
            expiresAt: otp.expiresAt,
            emailSent,
        };
    } catch (error) {
        console.error('Error creating and sending OTP:', error);
        throw error;
    }
};

/**
 * Send OTP email to user
 */
export const sendOTPEmail = async (email, name, code) => {
    try {
        await sendMail({
            to: email,
            subject: 'EHR Email Verification - OTP Code',
            text: `Your OTP code is: ${code}. This code will expire in 5 minutes.`,
            html: `
        <div style="font-family:system-ui,Segoe UI,Arial;max-width:520px;margin:0 auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px;background:#ffffff">
          <div style="text-align:center;margin-bottom:24px">
            <h1 style="margin:0;color:#1f2937;font-size:24px">Email Verification</h1>
          </div>
          
          <p style="margin:0 0 16px;color:#374151;font-size:16px">Hi <strong>${name}</strong>,</p>
          
          <p style="margin:0 0 24px;color:#374151;font-size:14px">
            Thank you for registering with EHR. Please use the following One-Time Password (OTP) to verify your email address:
          </p>
          
          <div style="margin:24px 0;padding:20px;background:#f3f4f6;border:2px dashed #9ca3af;border-radius:8px;text-align:center">
            <div style="font-size:32px;font-weight:bold;color:#1f2937;letter-spacing:8px;font-family:monospace">${code}</div>
          </div>
          
          <div style="margin:24px 0;padding:16px;background:#fef3c7;border-left:4px solid #f59e0b;border-radius:4px">
            <p style="margin:0;color:#92400e;font-size:13px">
              ⏱️ This OTP will expire in <strong>5 minutes</strong>.
            </p>
          </div>
          
          <p style="margin:24px 0 0;color:#6b7280;font-size:12px;border-top:1px solid #e5e7eb;padding-top:16px">
            If you did not request this code, please ignore this email. Your account will not be activated without verification.
          </p>
        </div>
      `,
        });
        return true;
    } catch (error) {
        console.error('Failed to send OTP email:', error.message);
        return false;
    }
};

/**
 * Verify OTP code
 * @param {string} email - User's email
 * @param {string} code - OTP code to verify
 * @returns {Promise<object>} Verification result
 */
export const verifyOTP = async (email, code) => {
    try {
        const otp = await OTP.findOne({
            email: email.toLowerCase(),
            code,
            verified: false,
            expiresAt: { $gt: new Date() },
        });

        if (!otp) {
            // Check if there's an expired OTP
            const expiredOTP = await OTP.findOne({
                email: email.toLowerCase(),
                code,
                verified: false,
            });

            if (expiredOTP) {
                return {
                    success: false,
                    message: 'OTP has expired. Please request a new one.',
                };
            }

            // Increment failed attempts (if we can find any recent OTP)
            await OTP.findOneAndUpdate(
                { email: email.toLowerCase(), verified: false },
                { $inc: { attempts: 1 } }
            );

            return {
                success: false,
                message: 'Invalid OTP code.',
            };
        }

        // Check attempts (max 3)
        if (otp.attempts >= 3) {
            await OTP.findByIdAndUpdate(otp._id, { expiresAt: new Date() });
            return {
                success: false,
                message: 'Too many failed attempts. Please request a new OTP.',
            };
        }

        // Mark as verified
        otp.verified = true;
        await otp.save();

        return {
            success: true,
            message: 'OTP verified successfully',
            userId: otp.userId,
        };
    } catch (error) {
        console.error('Error verifying OTP:', error);
        throw error;
    }
};

/**
 * Check if there's a valid unverified OTP for an email
 */
export const hasValidOTP = async (email) => {
    const otp = await OTP.findOne({
        email: email.toLowerCase(),
        verified: false,
        expiresAt: { $gt: new Date() },
    });
    return !!otp;
};

export default {
    generateOTPCode,
    createAndSendOTP,
    sendOTPEmail,
    verifyOTP,
    hasValidOTP,
};
