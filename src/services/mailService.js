// Mail Service - Supports both Resend SDK and SMTP (Nodemailer)
// 
// Usage:
// - Set RESEND_API_KEY to use Resend SDK (recommended for cloud deployments)
// - Set SMTP_HOST, SMTP_USER, SMTP_PASS to use SMTP (for traditional email servers)
// - If neither is configured, OTPs will be logged to console (development mode)

import { Resend } from 'resend'
import dotenv from 'dotenv'

// SMTP support - ENABLED FOR LOCAL DEV
import nodemailer from 'nodemailer'

dotenv.config()

// Check which email method is configured
const isResendConfigured = () => !!process.env.RESEND_API_KEY
const isSmtpConfigured = () => !!process.env.SMTP_HOST && !!process.env.SMTP_USER && !!process.env.SMTP_PASS

let resendClient = null
let transporter = null

// DEPLOYMENT: Initialize Resend if API key is provided (COMMENTED FOR LOCAL DEV)
/*
if (isResendConfigured()) {
  resendClient = new Resend(process.env.RESEND_API_KEY)
  console.log('📧 Email configured: Resend SDK')
}
*/

// LOCAL DEV: SMTP Configuration (ENABLED)
if (isSmtpConfigured()) {
  const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
  const isSecure = smtpPort === 465;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: smtpPort,
    secure: isSecure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    connectionTimeout: 10000,
    greetingTimeout: 5000,
    socketTimeout: 10000,
    tls: {
      rejectUnauthorized: false,
    },
  })

  console.log(`📧 Email configured: SMTP ${process.env.SMTP_HOST}:${smtpPort}`)
}
else {
  console.log('⚠️  No email service configured - OTPs will be logged to console')
}

export const sendMail = async ({ to, subject, text, html }) => {
  const from = process.env.MAIL_FROM || 'onboarding@resend.dev'

  // Extract OTP code if present (for fallback logging)
  const otpMatch = text ? text.match(/Your OTP code is: (\d{6})/) : null

  // Method 1: Resend SDK (Preferred for cloud deployments)
  if (resendClient) {
    try {
      const data = await resendClient.emails.send({
        from,
        to,
        subject,
        text,
        html,
      })
      console.log(`✅ Email sent to ${to} (ID: ${data.id})`)
      return { messageId: data.id }
    } catch (error) {
      console.error(`❌ Resend email failed:`, error.message)
      // Log OTP as fallback
      if (otpMatch) {
        console.log(`\n🔐 OTP CODE (Email failed): ${otpMatch[1]}\n`)
      }
      throw error
    }
  }

  // Method 2: SMTP/Nodemailer - ENABLED FOR LOCAL DEV
  if (transporter) {
    try {
      const info = await transporter.sendMail({ from, to, subject, text, html })
      console.log(`✅ Email sent to ${to}`)
      return { messageId: info.messageId }
    } catch (error) {
      console.error(`❌ SMTP email failed:`, error.message)
      if (otpMatch) {
        console.log(`\n🔐 OTP CODE (Email failed): ${otpMatch[1]}\n`)
      }
      throw error
    }
  }

  // Method 3: Development mode - log to console
  console.log('\n' + '='.repeat(60))
  console.log('📧 MAIL (Development Mode - No Email Service Configured)')
  console.log('='.repeat(60))
  console.log(`  To: ${to}`)
  console.log(`  Subject: ${subject}`)

  if (otpMatch) {
    console.log('\n' + '🔐 OTP CODE (COPY THIS):')
    console.log('  ┌─────────────┐')
    console.log(`  │   ${otpMatch[1]}   │`)
    console.log('  └─────────────┘')
  }

  if (text) console.log(`\n  Full Text: ${text}`)
  console.log('='.repeat(60) + '\n')

  return { messageId: 'dev-log' }
}

export const verifySMTP = async () => {
  if (resendClient) {
    return { configured: true, ok: true, method: 'resend' }
  }

  // SMTP verify - ENABLED FOR LOCAL DEV
  if (transporter) {
    try {
      await transporter.verify()
      return { configured: true, ok: true, method: 'smtp' }
    } catch (error) {
      return { configured: true, ok: false, method: 'smtp', error: error.message }
    }
  }

  return { configured: false }
}

export { isResendConfigured, isSmtpConfigured }

export default { sendMail, verifySMTP, isResendConfigured, isSmtpConfigured }
