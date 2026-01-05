import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
dotenv.config()

export const isSmtpConfigured = () =>
  !!process.env.SMTP_HOST && !!process.env.SMTP_USER && !!process.env.SMTP_PASS

let transporter

if (isSmtpConfigured()) {
  const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
  const isSecure = smtpPort === 465; // Use secure for port 465, TLS for 587

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: smtpPort,
    secure: isSecure, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 5000,
    socketTimeout: 10000,
    tls: {
      rejectUnauthorized: false, // Allow self-signed certificates
    },
  })

  console.log(`📧 SMTP configured: ${process.env.SMTP_HOST}:${smtpPort} (secure: ${isSecure})`);
} else {
  transporter = null
  console.log('SMTP missing:', {
    host: !!process.env.SMTP_HOST,
    user: !!process.env.SMTP_USER,
    pass: !!process.env.SMTP_PASS,
  })
}

export const sendMail = async ({ to, subject, text, html }) => {
  const from = process.env.MAIL_FROM || 'no-reply@ehr.local'

  // Extract OTP code if present
  const otpMatch = text ? text.match(/Your OTP code is: (\d{6})/) : null

  if (transporter) {
    try {
      const info = await transporter.sendMail({ from, to, subject, text, html })
      console.log(`✅ Email sent to ${to}`);
      return { messageId: info.messageId }
    } catch (error) {
      console.error(`❌ Email failed:`, error.message);
      // Log OTP as fallback
      if (otpMatch) {
        console.log(`\n🔐 OTP CODE (Email failed): ${otpMatch[1]}\n`);
      }
      throw error;
    }
  }

  // Extract OTP code if present
  const otpMatch = text ? text.match(/Your OTP code is: (\d{6})/) : null

  console.log('\n' + '='.repeat(60))
  console.log('📧 MAIL (Development Mode - SMTP Not Configured)')
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
  if (!transporter) {
    return { configured: false }
  }
  try {
    await transporter.verify()
    return { configured: true, ok: true }
  } catch (error) {
    return { configured: true, ok: false, error: error.message }
  }
}

export default { sendMail, verifySMTP, isSmtpConfigured }
