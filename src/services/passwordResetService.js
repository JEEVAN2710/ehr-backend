import { User } from '../models/User.js';
import { sendMail } from './mailService.js';

/**
 * Generate a secure temporary password
 * 12 characters with uppercase, lowercase, numbers, and special characters
 */
export const generateTempPassword = () => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '!@#$%^&*';

    const all = uppercase + lowercase + numbers + special;

    let password = '';
    // Ensure at least one of each type
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];

    // Fill the rest randomly
    for (let i = 4; i < 12; i++) {
        password += all[Math.floor(Math.random() * all.length)];
    }

    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
};

/**
 * Send password reset email with temporary password
 */
export const sendPasswordResetEmail = async (email, name, tempPassword) => {
    try {
        await sendMail({
            to: email,
            subject: 'EHR - Password Reset Request',
            text: `Your temporary password is: ${tempPassword}. Please log in and change your password immediately.`,
            html: `
        <div style="font-family:system-ui,Segoe UI,Arial;max-width:520px;margin:0 auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px;background:#ffffff">
          <div style="text-align:center;margin-bottom:24px">
            <h1 style="margin:0;color:#1f2937;font-size:24px">Password Reset</h1>
          </div>
          
          <p style="margin:0 0 16px;color:#374151;font-size:16px">Hi <strong>${name}</strong>,</p>
          
          <p style="margin:0 0 24px;color:#374151;font-size:14px">
            We received a request to reset your password. Here is your temporary password:
          </p>
          
          <div style="margin:24px 0;padding:20px;background:#f3f4f6;border:2px dashed #9ca3af;border-radius:8px;text-align:center">
            <div style="font-size:28px;font-weight:bold;color:#1f2937;letter-spacing:4px;font-family:monospace">${tempPassword}</div>
          </div>
          
          <div style="margin:24px 0;padding:16px;background:#fef3c7;border-left:4px solid #f59e0b;border-radius:4px">
            <p style="margin:0;color:#92400e;font-size:13px">
              ⚠️ <strong>Important:</strong> Please log in and change your password immediately. This temporary password should not be shared with anyone.
            </p>
          </div>
          
          <div style="margin:24px 0;padding:16px;background:#dbeafe;border-left:4px solid #3b82f6;border-radius:4px">
            <p style="margin:0;color:#1e40af;font-size:13px">
              💡 <strong>Next Steps:</strong>
            </p>
            <ol style="margin:8px 0 0 16px;color:#1e40af;font-size:13px;padding-left:8px">
              <li>Log in using this temporary password</li>
              <li>Go to your profile settings</li>
              <li>Change your password to a new secure password</li>
            </ol>
          </div>
          
          <p style="margin:24px 0 0;color:#6b7280;font-size:12px;border-top:1px solid #e5e7eb;padding-top:16px">
            If you did not request a password reset, please contact support immediately.
          </p>
        </div>
      `,
        });
        return true;
    } catch (error) {
        console.error('Failed to send password reset email:', error.message);
        return false;
    }
};

/**
 * Reset user password with temporary password
 */
export const resetUserPassword = async (email) => {
    try {
        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            // Don't reveal if user exists or not for security
            return {
                success: true,
                message: 'If that email is registered, a password reset link has been sent.'
            };
        }

        // Check if user is verified and active
        if (!user.isVerified || !user.isActive) {
            return {
                success: false,
                message: 'Account is not active or verified.'
            };
        }

        // Generate temporary password
        const tempPassword = generateTempPassword();

        console.log(`\n🔑 Password Reset for: ${email}`);
        console.log(`📧 Temporary Password: ${tempPassword}\n`);

        // Update user password (will be hashed by pre-save hook)
        user.password = tempPassword;
        await user.save();

        // Send email with temporary password
        const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ');
        await sendPasswordResetEmail(email, fullName, tempPassword);

        return {
            success: true,
            message: 'If that email is registered, a password reset link has been sent.'
        };
    } catch (error) {
        console.error('Error in password reset:', error);
        throw error;
    }
};

export default {
    generateTempPassword,
    sendPasswordResetEmail,
    resetUserPassword
};
