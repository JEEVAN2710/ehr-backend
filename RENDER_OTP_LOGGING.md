# OTP Logging for Production Testing

## Problem
When deployed to Render, email services may be blocked, preventing OTP emails from being sent during user registration and password reset.

## Solution
The OTP service now automatically logs OTP codes to the console in two scenarios:

### 1. Development Mode (Automatic)
OTPs are always logged when `NODE_ENV=development`

### 2. Production/Render (Manual Enable)
Add environment variable on Render to enable OTP logging:

**Environment Variable:**
```
SHOW_OTP_IN_LOGS=true
```

### 3. Email Failure Fallback (Always Active)
If email sending fails for any reason, OTP is automatically logged to console as a fallback.

## How to Enable on Render

1. Go to your Render dashboard
2. Select your backend service
3. Go to **Environment** tab
4. Add new environment variable:
   - **Key:** `SHOW_OTP_IN_LOGS`
   - **Value:** `true`
5. Save changes (service will redeploy)

## Viewing OTP in Render Logs

1. Go to your Render service
2. Click **Logs** tab
3. When user registers, you'll see:
```
🔐 =========================
📧 OTP for user@example.com: 123456
👤 Name: John Doe
⏱️  Expires in 5 minutes
=========================
```

4. Copy the OTP code and use it for verification

## Email Failure Logs

If email sending fails, you'll see:
```
⚠️  EMAIL SEND FAILED - OTP CODE:
=================================
📧 Email: user@example.com
🔐 OTP Code: 123456
👤 Name: John Doe
⏱️  Expires in 5 minutes
=================================
```

## Security Note

⚠️ **Important:** Remember to **disable** `SHOW_OTP_IN_LOGS` in production once email service is working properly, as logging OTPs can be a security risk.

## Testing Workflow

1. User registers on hosted version
2. Check Render logs
3. Find OTP code in logs
4. Copy and paste into verification form
5. User account verified!
