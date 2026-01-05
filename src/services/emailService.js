// Gmail SMTP Email Service for Render
// Uses Nodemailer with Gmail App Password authentication
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// SMTP Configuration - Optimized for Render + Gmail
const SMTP_CONFIG = {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Use STARTTLS
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
    tls: {
        rejectUnauthorized: false,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
};

let transporter = null;
let smtpReady = false;

// Initialize transporter
function initializeTransporter() {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
        console.error('❌ SMTP NOT CONFIGURED - Missing GMAIL_USER or GMAIL_APP_PASSWORD');
        return;
    }

    transporter = nodemailer.createTransport(SMTP_CONFIG);
    console.log('📧 SMTP Transporter created for:', process.env.GMAIL_USER);
}

// Verify SMTP connection on startup
export async function verifySmtpConnection() {
    if (!transporter) {
        console.error('❌ SMTP FAILED - Transporter not initialized');
        return false;
    }

    try {
        await transporter.verify();
        smtpReady = true;
        console.log('✅ SMTP READY - Gmail connection verified');
        return true;
    } catch (error) {
        smtpReady = false;
        console.error('❌ SMTP VERIFICATION FAILED');
        console.error('Error Code:', error.code);
        console.error('Error Message:', error.message);
        console.error('Error Details:', error.response || 'No additional details');

        // Common error explanations
        if (error.code === 'ETIMEDOUT') {
            console.error('→ Gmail is blocking connection from this IP (Render server)');
        } else if (error.code === 'EAUTH') {
            console.error('→ Check GMAIL_APP_PASSWORD is correct (16 chars, no spaces)');
        } else if (error.code === 'ECONNREFUSED') {
            console.error('→ Port 587 might be blocked');
        }

        return false;
    }
}

// Send email function
export async function sendEmail(to, subject, text, html = null) {
    if (!transporter) {
        throw new Error('SMTP not configured - transporter not initialized');
    }

    if (!smtpReady) {
        console.warn('⚠️  SMTP verification failed, but attempting to send anyway...');
    }

    const mailOptions = {
        from: process.env.GMAIL_USER,
        to,
        subject,
        text,
        html: html || text,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully');
        console.log('   To:', to);
        console.log('   Subject:', subject);
        console.log('   Message ID:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ EMAIL SEND FAILED');
        console.error('   To:', to);
        console.error('   Error Code:', error.code);
        console.error('   Error Message:', error.message);
        console.error('   Error Response:', error.response || 'No response');

        // Re-throw with clear message
        throw new Error(`Failed to send email: ${error.message}`);
    }
}

// Test email function
export async function sendTestEmail() {
    const testEmail = process.env.GMAIL_USER;

    if (!testEmail) {
        throw new Error('GMAIL_USER not set in environment variables');
    }

    return sendEmail(
        testEmail,
        'EHR System - SMTP Test Email',
        'This is a test email from your EHR backend on Render.\n\nIf you received this, Gmail SMTP is working correctly!\n\nTimestamp: ' + new Date().toISOString()
    );
}

// Initialize on module load
initializeTransporter();

export default {
    sendEmail,
    sendTestEmail,
    verifySmtpConnection,
};
