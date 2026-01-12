# EHR Application - Deployment Guide

## 📋 Deployment Overview

- **Backend:** Render (https://ehr-backend-uedr.onrender.com)
- **Frontend:** Vercel (https://ehr-frontend-zeta.vercel.app)
- **Database:** MongoDB Atlas
- **Storage:** Cloudflare R2

---

## 🚀 Quick Deployment Steps

### 1. Push Changes to Git

```bash
# Commit all changes
git add .
git commit -m "Configure deployment for Render and Vercel"
git push origin main
```

### 2. Configure Backend on Render

Go to your Render dashboard → **ehr-backend** service → **Environment**

Add/update these environment variables:

```bash
# Server Configuration
NODE_ENV=production
PORT=4000

# Database
MONGO_URI=mongodb+srv://Jeevan_user:FY93SY1yDDJ1rc15@cluster0.tefbiph.mongodb.net/?appName=Cluster0

# JWT Secrets (IMPORTANT: Use strong secrets!)
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production-min-32-chars

# Email Configuration (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
MAIL_FROM=your-email@gmail.com

# CORS - CRITICAL: Must match your frontend URL exactly
CORS_ORIGIN=https://ehr-frontend-zeta.vercel.app

# Cloudflare R2 Storage (if using)
R2_ACCOUNT_ID=your-r2-account-id
R2_BUCKET_NAME=ehr-medical-files
R2_ACCESS_KEY_ID=your-r2-access-key
R2_SECRET_ACCESS_KEY=your-r2-secret-key
R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
```

**Build Settings:**
- Build Command: `npm install`
- Start Command: `npm start`

### 3. Configure Frontend on Vercel

Go to your Vercel dashboard → **ehr-frontend** → **Settings** → **Environment Variables**

Add this environment variable:

```bash
VITE_API_URL=https://ehr-backend-uedr.onrender.com
```

**Important:** Make sure to set this for **Production** environment.

**Build Settings:**
- Framework Preset: **Vite**
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

### 4. Deploy

#### Backend (Render)
Render will automatically deploy when you push to GitHub. You can also:
- Go to Render dashboard
- Click **Manual Deploy** → **Deploy latest commit**

#### Frontend (Vercel)
Vercel will automatically deploy when you push to GitHub. You can also:
- Go to Vercel dashboard
- Click **Deployments** → **Redeploy**

---

## ✅ Verification Steps

### 1. Check Backend Health

Open in browser or use curl:
```bash
curl https://ehr-backend-uedr.onrender.com/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is healthy",
  "timestamp": "2026-01-12T..."
}
```

### 2. Check Frontend

Visit: https://ehr-frontend-zeta.vercel.app

- Should load without errors
- Check browser console for API connection errors
- Try logging in with admin credentials

### 3. Test Login Flow

1. Go to https://ehr-frontend-zeta.vercel.app
2. Click **Login**
3. Use admin credentials:
   - Email: `admin@ehr.com`
   - Password: `admin`
4. Should successfully log in and redirect to dashboard

### 4. Check CORS

If you see CORS errors in browser console:
- Verify `CORS_ORIGIN` on Render matches your Vercel URL exactly
- No trailing slash: ✅ `https://ehr-frontend-zeta.vercel.app`
- With trailing slash: ❌ `https://ehr-frontend-zeta.vercel.app/`

---

## 🔧 Local Development

Your local setup is already configured:

**Backend (.env):**
```bash
PORT=4000
MONGO_URI=mongodb+srv://...
CORS_ORIGIN=http://localhost:5173
# ... other vars
```

**Frontend (.env):**
```bash
VITE_API_URL=http://localhost:4000
```

**Run locally:**
```bash
# Terminal 1 - Backend
cd e:\EHR
npm run dev

# Terminal 2 - Frontend
cd e:\EHR\frontend
npm run dev
```

---

## 🐛 Troubleshooting

### Backend Issues

**Problem:** "Cannot read environment variable"
- **Solution:** Check all environment variables are set on Render

**Problem:** "Database connection failed"
- **Solution:** Verify MongoDB Atlas allows connections from 0.0.0.0/0 (or add Render's IP)

**Problem:** "Emails not sending"
- **Solution:** Verify Gmail App Password is correct (not your regular password)

### Frontend Issues

**Problem:** "API calls failing" or "Network Error"
- **Solution:** Check `VITE_API_URL` is set on Vercel
- **Solution:** Verify backend is running (check health endpoint)

**Problem:** "404 on page refresh"
- **Solution:** Verify `vercel.json` has rewrite rules for SPA routing

**Problem:** "CORS errors in console"
- **Solution:** Update `CORS_ORIGIN` on Render backend to match Vercel URL

### General Issues

**Problem:** "Changes not deploying"
- **Solution:** Check deployment logs on Render/Vercel
- **Solution:** Try manual redeploy
- **Solution:** Clear build cache on Vercel

---

## 📝 Environment Variables Checklist

### Backend (Render)
- [ ] NODE_ENV=production
- [ ] PORT=4000
- [ ] MONGO_URI
- [ ] JWT_SECRET (32+ characters)
- [ ] JWT_REFRESH_SECRET (32+ characters)
- [ ] SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM
- [ ] CORS_ORIGIN=https://ehr-frontend-zeta.vercel.app
- [ ] R2 credentials (if using file uploads)

### Frontend (Vercel)
- [ ] VITE_API_URL=https://ehr-backend-uedr.onrender.com

---

## 🔒 Security Notes

1. **Never commit .env files** - They're in .gitignore
2. **Use strong JWT secrets** - Minimum 32 characters, random
3. **Gmail App Password** - Use 2FA + App Password, not regular password
4. **CORS configuration** - Only allow your frontend domain
5. **MongoDB access** - Consider restricting to specific IPs if possible

---

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Setup](https://www.mongodb.com/docs/atlas/)
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)

---

## ✨ Post-Deployment

After successful deployment:

1. **Change default admin password** immediately
2. **Test all features:**
   - User registration with OTP
   - Login/logout
   - Medical records creation
   - File uploads (if R2 configured)
   - Access requests
   - Admin user management
3. **Monitor logs** for any errors
4. **Set up monitoring** (optional): Use Render's logs or external services

---

**Need help?** Check the deployment logs on Render and Vercel for detailed error messages.
