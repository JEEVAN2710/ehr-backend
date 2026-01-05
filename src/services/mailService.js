import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
dotenv.config()

export const isSmtpConfigured = () =>
  !!process.env.SMTP_HOST && !!process.env.SMTP_USER && !!process.env.SMTP_PASS

let transporter

if (isSmtpConfigured()) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
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

  if (transporter) {
    const info = await transporter.sendMail({ from, to, subject, text, html })
    return { messageId: info.messageId }
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
