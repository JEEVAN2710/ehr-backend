# Environment Variables Reference

## Backend (Render) - https://ehr-backend-uedr.onrender.com

Copy these to your Render backend service → Environment tab:

```bash
# ===========================
# Server Configuration
# ===========================
NODE_ENV=production
PORT=4000

# ===========================
# Database
# ===========================
MONGO_URI=mongodb+srv://Jeevan_user:FY93SY1yDDJ1rc15@cluster0.tefbiph.mongodb.net/?appName=Cluster0

# ===========================
# JWT Secrets
# ===========================
# IMPORTANT: Generate strong random secrets for production!
# You can use: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production-min-32-chars

# ===========================
# Email Configuration (Gmail)
# ===========================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password-16-chars
MAIL_FROM=your-email@gmail.com

# ===========================
# CORS Configuration
# ===========================
# CRITICAL: Must match your Vercel frontend URL exactly (no trailing slash)
CORS_ORIGIN=https://ehr-frontend-zeta.vercel.app

# ===========================
# Cloudflare R2 Storage (Optional)
# ===========================
# Only needed if you're using file uploads
R2_ACCOUNT_ID=your-r2-account-id
R2_BUCKET_NAME=ehr-medical-files
R2_ACCESS_KEY_ID=your-r2-access-key
R2_SECRET_ACCESS_KEY=your-r2-secret-key
R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com

# ===========================
# AWS S3 Storage (Alternative)
# ===========================
# Use this if not using R2
# S3_BUCKET=your-s3-bucket-name
# AWS_ACCESS_KEY_ID=your-aws-access-key
# AWS_SECRET_ACCESS_KEY=your-aws-secret-key
# AWS_REGION=ap-south-1
```

---

## Frontend (Vercel) - https://ehr-frontend-zeta.vercel.app

Go to Vercel dashboard → ehr-frontend → Settings → Environment Variables

Add this single variable for **Production** environment:

```bash
VITE_API_URL=https://ehr-backend-uedr.onrender.com
```

---

## How to Set on Render

1. Go to https://dashboard.render.com
2. Click on your backend service
3. Click **Environment** in the left sidebar
4. Click **Add Environment Variable**
5. Add each variable (key-value pair)
6. Click **Save Changes**
7. Service will automatically redeploy

---

## How to Set on Vercel

1. Go to https://vercel.com/dashboard
2. Click on your frontend project
3. Click **Settings** → **Environment Variables**
4. Add variable name and value
5. Select **Production** environment
6. Click **Save**
7. Redeploy: Go to **Deployments** → **Redeploy**

---

## Important Notes

### JWT Secrets
Generate strong random secrets using Node.js:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Run this twice to get two different secrets for `JWT_SECRET` and `JWT_REFRESH_SECRET`.

### Gmail App Password
1. Enable 2-Step Verification on your Google account
2. Go to: https://myaccount.google.com/apppasswords
3. Generate a new app password for "Mail"
4. Use the 16-character password (no spaces) for `SMTP_PASS`
5. **Important:** This is NOT your regular Gmail password!

### CORS Configuration
The `CORS_ORIGIN` must match your frontend URL **exactly**:
- ✅ Correct: `https://ehr-frontend-zeta.vercel.app`
- ❌ Wrong: `https://ehr-frontend-zeta.vercel.app/` (trailing slash)
- ❌ Wrong: `http://ehr-frontend-zeta.vercel.app` (http instead of https)

If you have multiple frontend URLs (preview, production), separate with commas:
```bash
CORS_ORIGIN=https://ehr-frontend-zeta.vercel.app,https://ehr-frontend-preview.vercel.app
```

### MongoDB Atlas
Make sure MongoDB Atlas allows connections:
1. Go to MongoDB Atlas → Network Access
2. Add IP: `0.0.0.0/0` (allows all - for Render/Vercel)
3. Or add specific Render/Vercel IP ranges

---

## Local Development

Your local `.env` files should remain:

**Backend (e:\EHR\.env):**
```bash
PORT=4000
MONGO_URI=mongodb+srv://...
JWT_SECRET=your-local-secret
JWT_REFRESH_SECRET=your-local-refresh-secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
MAIL_FROM=your-email@gmail.com
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
# ... R2 or S3 config if using
```

**Frontend (e:\EHR\frontend\.env):**
```bash
VITE_API_URL=http://localhost:4000
```

---

## Quick Checklist

Before deploying:
- [ ] Generate strong JWT secrets
- [ ] Get Gmail App Password
- [ ] Verify MongoDB Atlas allows Render/Vercel IPs
- [ ] Set `CORS_ORIGIN` to match Vercel URL exactly
- [ ] Set `VITE_API_URL` on Vercel to Render backend URL
- [ ] Test locally first
- [ ] Commit and push to Git
