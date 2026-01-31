# EHR System - Complete Setup Guide

## 🎯 System Architecture

**Local Development:**
- ✅ Full blockchain features with Ganache
- ✅ Complete testing environment
- ✅ Visual blockchain dashboard

**Production (Render + Vercel):**
- ✅ Backend without blockchain
- ✅ Frontend deployed to Vercel
- ✅ All features except blockchain audit trail

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- Ganache (GUI or CLI)

### 1. Install Ganache

**Option A: GUI (Recommended)**
```bash
Download from: https://trufflesuite.com/ganache/
```

**Option B: CLI**
```bash
npm install -g ganache
```

### 2. Start Ganache
```bash
# CLI
ganache --port 7545

# Or open Ganache GUI and create workspace
```

### 3. Deploy Smart Contract
```bash
cd e:\EHR\blockchain

# Compile contract
npm run compile

# Deploy to Ganache
npm run deploy:ganache

# Copy the contract address from output
```

### 4. Configure Environment

**Update `.env`:**
```bash
# Enable blockchain
BLOCKCHAIN_ENABLED=true

# Ganache connection
POLYGON_MUMBAI_RPC=http://127.0.0.1:7545
BLOCKCHAIN_CONTRACT_ADDRESS=<paste_contract_address>

# Ganache account (copy from Ganache GUI)
WALLET_PRIVATE_KEY=0x<private_key>
WALLET_ADDRESS=0x<address>

# Database
MONGO_URI=your_mongodb_uri

# JWT
JWT_SECRET=your_secret
JWT_REFRESH_SECRET=your_refresh_secret

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
MAIL_FROM=your_email@gmail.com

# Cloud Storage (R2/S3)
AWS_REGION=auto
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_ENDPOINT=your_endpoint
AWS_BUCKET_NAME=your_bucket
AWS_PUBLIC_URL=your_public_url

# OTP Logging
SHOW_OTP_IN_LOGS=true
```

### 5. Start Services

**Terminal 1 - Ganache:**
```bash
ganache --port 7545
# Or keep GUI open
```

**Terminal 2 - Backend:**
```bash
cd e:\EHR
npm install
npm run dev
```

**Terminal 3 - Frontend:**
```bash
cd e:\EHR\frontend
npm install
npm run dev
```

### 6. Access Application
- Frontend: http://localhost:5173
- Backend: http://localhost:4000

---

## 🌐 Production Deployment

### Backend (Render)

**1. Create Web Service on Render**
- Connect to GitHub repository: `ehr-backend`
- Root directory: leave empty
- Build command: `npm install`
- Start command: `npm start`

**2. Environment Variables (CRITICAL)**
```bash
# IMPORTANT: Disable blockchain
BLOCKCHAIN_ENABLED=false

# Production mode
NODE_ENV=production
PORT=4000

# Database
MONGO_URI=<your_mongodb_atlas_uri>

# JWT Secrets
JWT_SECRET=<strong_random_string>
JWT_REFRESH_SECRET=<different_strong_random_string>

# SMTP Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=<your_email>
SMTP_PASS=<your_gmail_app_password>
MAIL_FROM=<your_email>

# Cloud Storage
AWS_REGION=auto
AWS_ACCESS_KEY_ID=<r2_access_key>
AWS_SECRET_ACCESS_KEY=<r2_secret>
AWS_ENDPOINT=<r2_endpoint>
AWS_BUCKET_NAME=<bucket_name>
AWS_PUBLIC_URL=<public_url>

# Testing
SHOW_OTP_IN_LOGS=true
```

### Frontend (Vercel)

**1. Connect Repository**
- Connect `ehr_frontend` repository
- Framework: Vite
- Root directory: leave empty

**2. Build Settings**
- Build command: `npm run build`
- Output directory: `dist`
- Install command: `npm install`

**3. Environment Variables**
```bash
VITE_API_BASE_URL=https://your-backend.onrender.com
```

---

## 📋 Features Availability

| Feature | Local | Production |
|---------|-------|------------|
| User Authentication | ✅ | ✅ |
| Medical Records | ✅ | ✅ |
| File Upload/Download | ✅ | ✅ |
| Access Requests | ✅ | ✅ |
| QR Code Sharing | ✅ | ✅ |
| **Blockchain Audit** | ✅ | ❌ |
| Email Verification | ✅ | ✅ |
| Admin Panel | ✅ | ✅ |

---

## 🧪 Testing Checklist

### Local Testing (Before Deployment)

- [ ] User registration with OTP
- [ ] Login/logout flow
- [ ] Create medical record
- [ ] Upload files to record
- [ ] Download files from record
- [ ] Share record with doctor
- [ ] Request access to records
- [ ] View blockchain audit trail
- [ ] Verify blockchain transaction in Ganache

### Production Testing (After Deployment)

- [ ] User registration (check Render logs for OTP)
- [ ] Login functionality
- [ ] Create and view records
- [ ] File upload/download
- [ ] Share records
- [ ] Access requests
- [ ] Admin functions

---

## 🛠️ Common Issues & Solutions

### Local Development

**Ganache connection failed:**
- Ensure Ganache is running on port 7545
- Check `POLYGON_MUMBAI_RPC=http://127.0.0.1:7545`
- Restart backend after changes

**Blockchain audit not showing:**
- Verify `BLOCKCHAIN_ENABLED=true`
- Check contract is deployed
- Confirm `BLOCKCHAIN_CONTRACT_ADDRESS` is set

**OTP not visible:**
- Check `SHOW_OTP_IN_LOGS=true`
- Look in backend terminal for OTP output

### Production Deployment

**Backend fails to start:**
- Ensure `BLOCKCHAIN_ENABLED=false`
- Verify all required env variables are set
- Check Render logs for specific error

**File upload fails:**
- Verify R2/S3 credentials
- Check bucket CORS settings
- Ensure public URL is correct

**OTP emails not sending:**
- Set `SHOW_OTP_IN_LOGS=true`
- Check Render logs for OTP codes
- Verify SMTP credentials

---

## 📦 Repository Structure

```
ehr-backend/          # Backend repository
├── src/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── services/
├── blockchain/       # Smart contracts
│   ├── contracts/
│   └── scripts/
├── .env             # Local config
└── server.js

ehr_frontend/        # Frontend repository
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── .env.local       # Local config
```

---

## 🎓 For Research Paper / Documentation

**Key Points to Highlight:**

1. **Blockchain Integration:**
   - Smart contract for immutable audit trail
   - Local testing with Ganache
   - Optional deployment for production

2. **Security Features:**
   - JWT authentication
   - OTP email verification
   - Role-based access control
   - Encrypted file storage

3. **Scalability:**
   - Can enable blockchain later
   - Modular architecture
   - Cloud storage for files

4. **Deployment Strategy:**
   - Development: Full features locally
   - Production: Core features hosted
   - Blockchain: Demo-ready, production-optional

---

## 📞 Quick Commands Reference

```bash
# Local Development
ganache --port 7545                    # Start blockchain
cd e:\EHR && npm run dev              # Start backend
cd e:\EHR\frontend && npm run dev     # Start frontend

# Blockchain
cd e:\EHR\blockchain
npm run compile                        # Compile contract
npm run deploy:ganache                 # Deploy to Ganache
npm run deploy:mumbai                  # Deploy to Mumbai testnet

# Git
git add .
git commit -m "message"
git push origin main
```

---

**Status:** ✅ Ready for local development and production deployment
