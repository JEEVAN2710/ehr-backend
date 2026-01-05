// Test Email Route - For SMTP Verification
import express from 'express';
import { sendTestEmail } from '../services/emailService.js';

const router = express.Router();

// GET /api/test-email - Send test email to verify SMTP
router.get('/test-email', async (req, res) => {
    try {
        console.log('\n📧 Test email requested...');

        const result = await sendTestEmail();

        res.status(200).json({
            success: true,
            message: 'Test email sent successfully! Check your inbox.',
            messageId: result.messageId,
            sentTo: process.env.GMAIL_USER,
        });
    } catch (error) {
        console.error('Test email failed:', error.message);

        res.status(500).json({
            success: false,
            message: 'Failed to send test email',
            error: error.message,
            hint: 'Check Render logs for detailed error information',
        });
    }
});

export default router;
