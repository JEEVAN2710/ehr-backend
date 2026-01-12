// Test Email Route - For SMTP Verification
import express from 'express';
import { sendMail } from '../services/mailService.js';

const router = express.Router();

// GET /api/test-email - Send test email to verify SMTP
router.get('/test-email', async (req, res) => {
    try {
        console.log('\n📧 Test email requested...');

        const testEmail = process.env.SMTP_USER || 'test@example.com';
        const result = await sendMail({
            to: testEmail,
            subject: 'EHR System - SMTP Test Email',
            text: 'This is a test email from your EHR backend.\n\nIf you received this, Gmail SMTP is working correctly!\n\nTimestamp: ' + new Date().toISOString(),
            html: `<div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>EHR System Test Email</h2>
                <p>This is a test email from your EHR backend.</p>
                <p><strong>If you received this, Gmail SMTP is working correctly!</strong></p>
                <p style="color: #666; font-size: 12px;">Timestamp: ${new Date().toISOString()}</p>
            </div>`
        });

        res.status(200).json({
            success: true,
            message: 'Test email sent successfully! Check your inbox.',
            messageId: result.messageId,
            sentTo: testEmail,
        });
    } catch (error) {
        console.error('Test email failed:', error.message);

        res.status(500).json({
            success: false,
            message: 'Failed to send test email',
            error: error.message,
        });
    }
});

export default router;
