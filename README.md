# EHR Backend (Node.js/Express)

## Overview
Secure REST API for Electronic Health Records (EHR) with OTP email verification, JWT authentication, role-based access control, medical records management, and record sharing functionality.

## 🔐 Security Features
- ✅ **OTP Email Verification** - 2-step registration with 6-digit codes (5-minute expiration)
- ✅ **Strong Password Requirements** - Min 8 chars with uppercase, lowercase, number, special character
- ✅ **JWT Authentication** - Access tokens (15 min) + Refresh tokens (7 days)
- ✅ **Rate Limiting** - Login, registration, and OTP endpoints protected
- ✅ **Role-Based Access Control** - Patient, Doctor, Lab Assistant, Admin roles
- ✅ **Input Validation** - All request bodies validated with express-validator
- ✅ **Pagination Limits** - Max 100 records per request
- ✅ **MongoDB Injection Prevention** - Query parameter sanitization
- ✅ **Security Headers** - Helmet.js, CORS configuration
- ✅ **Password Hashing** - bcrypt with salt rounds

## Tech Stack
- **Runtime:** Node.js with Express
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT (`jsonwebtoken`)
- **Email:** SMTP via `nodemailer`
- **Security:** `helmet`, `express-rate-limit`, `cors`, `express-validator`
- **File Storage (Optional):** AWS S3 client utilities (routes not mounted by default)

## Project Structure
```
├── server.js                      # App entry point
├── src/
│   ├── app.js                     # Express app configuration
│   ├── controllers/
│   │   ├── authController.js      # Auth logic (register, login, OTP, profile, user mgmt)
│   │   ├── recordController.js    # Medical records CRUD + sharing
│   │   └── uploadController.js    # S3 presigned URLs
│   ├── models/
│   │   ├── User.js                # User schema with password hashing
│   │   ├── MedicalRecord.js       # Medical record schema
│   │   └── OTP.js                 # OTP schema with TTL indexing
│   ├── routes/
│   │   ├── authRoutes.js          # Auth endpoints
│   │   ├── recordRoutes.js        # Record endpoints
│   │   └── uploadRoutes.js        # S3 upload routes (not mounted)
│   ├── services/
│   │   ├── jwtService.js          # Token generation/verification
│   │   ├── mailService.js         # Email sending
│   │   ├── otpService.js          # OTP generation/verification
│   │   └── s3Service.js           # AWS S3 utilities
│   ├── middleware/
│   │   ├── auth.js                # JWT authentication
│   │   └── roles.js               # Role-based authorization
│   ├── config/
│   │   ├── db.js                  # MongoDB connection
│   │   └── aws.js                 # AWS S3 configuration
│   └── utils/
│       └── validators.js          # Password strength, pagination validators
└── seed.js                        # Demo user seeder
```

## Setup

### Prerequisites
- Node.js 18+ (or 22+)
- MongoDB URI (local or cloud)
- Gmail account with App Password (for OTP emails)

### Environment Variables
Create `.env` file in project root:

```env
# Server Configuration
PORT=4000
NODE_ENV=development

# Database
MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true&w=majority

# JWT Secrets (use strong random strings)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars

# SMTP Configuration (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your.email@gmail.com
SMTP_PASS=your-gmail-app-password
MAIL_FROM=your.email@gmail.com

# CORS (optional, defaults to *)
CORS_ORIGIN=http://localhost:3000

# Optional: AWS S3 (for file uploads - not mounted by default)
S3_BUCKET=your-bucket-name
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=ap-south-1
```

**Gmail Setup:**
1. Enable 2-Step Verification on your Google account
2. Generate App Password: Google Account → Security → 2-Step Verification → App passwords
3. Use the 16-character app password (no spaces) for `SMTP_PASS`

## Install & Run

```bash
# Install dependencies
npm install

# Run in development mode with auto-reload
npm run dev

# Run in production mode
npm start

# Create demo users (including admin)
node seed.js
```

## 🔐 Default Admin Credentials

After running `node seed.js`, you can log in with these accounts:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@ehr.com | **admin** |
| Doctor | doctor@ehr.com | password123 |
| Lab Assistant | lab@ehr.com | password123 |
| Patient | patient@ehr.com | password123 |

> ⚠️ **Security:** Change the default admin password immediately after first login. These credentials are for development/testing only.


## 📡 API Endpoints (19 Total)

**Base URL:** `http://localhost:4000`

### ✅ TESTED & WORKING - Authentication (7 endpoints)

#### 1. Register (Step 1) - ✅ WORKING
```http
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "SecurePass@123",
  "role": "patient",
  "phoneNumber": "+1234567890",
  "dateOfBirth": "1990-01-15"
}
```
**Response:** Registration initiated, OTP sent to email  
**Password Requirements:** Min 8 chars, uppercase, lowercase, number, special char

#### 2. Verify OTP (Step 2) - ✅ WORKING
```http
POST /api/auth/verify-otp
Content-Type: application/json

{
  "email": "john@example.com",
  "otp": "123456"
}
```
**Response:** Account activated, returns `accessToken` and `refreshToken`  
**Note:** OTP expires in 5 minutes, max 3 attempts

#### 3. Resend OTP - ✅ WORKING
```http
POST /api/auth/resend-otp
Content-Type: application/json

{
  "email": "john@example.com"
}
```
**Response:** New OTP sent to email  
**Use Case:** If OTP expired or lost

#### 4. Login - ✅ WORKING
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass@123"
}
```
**Response:** Returns `accessToken` and `refreshToken`  
**Note:** Account must be verified before login

#### 5. Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGci..."
}
```
**Response:** New `accessToken` and `refreshToken`

#### 6. Get Profile (Protected) - ✅ WORKING
```http
GET /api/auth/profile
Authorization: Bearer <accessToken>
```
**Response:** Current user profile data

#### 7. Change Password (Protected) - ✅ WORKING
```http
PUT /api/auth/change-password
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "currentPassword": "SecurePass@123",
  "newPassword": "NewSecurePass@456"
}
```
**Response:** Password changed successfully

---

### 👥 User Management - Admin Only (2 endpoints)

#### 8. Get All Users (Admin) - ✅ WORKING
```http
GET /api/auth/users?skip=0&limit=20&role=patient&isActive=true
Authorization: Bearer <adminAccessToken>
```
**Query Params:**
- `skip` - Pagination offset (default: 0)
- `limit` - Records per page (default: 20, max: 100)
- `role` - Filter by role: patient, doctor, labassistant, admin
- `isActive` - Filter by status: true/false

**Response:** Paginated list of all users

#### 9. Update User Status (Admin)
```http
PUT /api/auth/users/:userId/status
Authorization: Bearer <adminAccessToken>
Content-Type: application/json

{
  "isActive": false
}
```
**Response:** User activated/deactivated  
**Note:** Admin cannot change their own status

---

### 📋 Medical Records (6 endpoints)

#### 10. Create Record (Protected) - ✅ WORKING
```http
POST /api/records/
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "patientId": "6754abc123def456789012",
  "title": "Annual Physical Examination",
  "description": "Complete physical examination with blood work",
  "recordType": "report"
}
```
**Record Types:** prescription, labtest, scan, report, other  
**Roles Allowed:** patient, doctor, labassistant  
**Note:** patientId must be a user with role='patient'

#### 11. Get Patient Records (Protected) - ✅ WORKING
```http
GET /api/records/:patientId?skip=0&limit=10
Authorization: Bearer <accessToken>
```
**Query Params:**
- `skip` - Pagination offset (default: 0)
- `limit` - Records per page (default: 10, max: 100)

**Access Control:** Patients can only view their own records

#### 12. Get Single Record (Protected) - ✅ WORKING
```http
GET /api/records/view/:recordId
Authorization: Bearer <accessToken>
```

#### 13. Update Record (Protected)
```http
PUT /api/records/:recordId
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "title": "Updated Title",
  "description": "Updated description",
  "recordType": "scan"
}
```
**Access Control:** Only record creator can update

#### 14. Delete Record (Protected)
```http
DELETE /api/records/:recordId
Authorization: Bearer <accessToken>
```
**Access Control:** Creator or admin can delete

#### 15. Add File to Record (Protected)
```http
POST /api/records/:recordId/files
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "fileKey": "patients/6754abc/report.pdf",
  "filename": "Annual_Report.pdf",
  "contentType": "application/pdf",
  "size": 245678
}
```
**Note:** Use after uploading file to S3

---

### 🔗 Record Sharing (3 endpoints)

#### 16. Share Record (Protected)
```http
POST /api/records/:recordId/share
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "userIds": [
    "6754xyz123abc456789012",
    "6754aaa456def789123456"
  ]
}
```
**Access Control:** Only patient (owner) or record creator can share

#### 17. Revoke Record Sharing (Protected)
```http
DELETE /api/records/:recordId/share/:userId
Authorization: Bearer <accessToken>
```
**Access Control:** Only patient or record creator can revoke

#### 18. Get Shared Records (Protected)
```http
GET /api/records/shared-with-me?skip=0&limit=10
Authorization: Bearer <accessToken>
```
**Response:** Records shared with current user

---

### ❤️ Health & Utility (1 endpoint)

#### 19. Health Check - ✅ WORKING
```http
GET /api/health
```
**Response:** Server status and timestamp  
**No authentication required**

---

## 🎯 Frontend Integration Guide

### Authentication Flow
```javascript
// 1. Register
const register = await fetch('http://localhost:4000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    password: 'SecurePass@123',
    role: 'patient'
  })
});
// User receives OTP via email

// 2. Verify OTP
const verify = await fetch('http://localhost:4000/api/auth/verify-otp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'john@example.com',
    otp: '123456' // From email
  })
});
const { data } = await verify.json();
// Save data.accessToken and data.refreshToken

// 3. Use access token for protected endpoints
const profile = await fetch('http://localhost:4000/api/auth/profile', {
  headers: { 
    'Authorization': `Bearer ${data.accessToken}` 
  }
});
```

### Error Handling
All endpoints return consistent error format:
```json
{
  "success": false,
  "message": "Error description",
  "errors": [/* Validation errors */]
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

### Token Management
- **Access Token:** Valid for 15 minutes - use for API calls
- **Refresh Token:** Valid for 7 days - use to get new access token
- Store tokens securely (localStorage/sessionStorage/cookies)
- Implement auto-refresh when access token expires

### Pagination
All paginated endpoints support:
- `skip` - Number of records to skip (default: 0)
- `limit` - Number of records to return (default: 10, max: 100)

Response format:
```json
{
  "success": true,
  "data": {
    "records": [...],
    "pagination": {
      "total": 45,
      "skip": 0,
      "limit": 10,
      "hasMore": true
    }
  }
}
```

## 📝 Response Format

All API responses follow this consistent format:

**Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* Response data */ }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description",
  "errors": [/* Validation errors if applicable */]
}
```

## 🧪 Testing

### Postman/Thunder Client
1. Set environment variable `baseUrl = http://localhost:4000`
2. Create requests for each endpoint
3. Use `{{accessToken}}` variable for Authorization header
4. Auto-save tokens with test script:
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("accessToken", response.data.accessToken);
    pm.environment.set("refreshToken", response.data.refreshToken);
}
```

### Quick Test Checklist
- [ ] Register user with strong password
- [ ] Verify OTP from email
- [ ] Login with verified account
- [ ] Get user profile
- [ ] Create medical record
- [ ] List patient records
- [ ] Share record with another user
- [ ] View shared records
- [ ] Test admin endpoints (after running seed.js)

## 📚 Documentation

Comprehensive API documentation available in:
- **API_DOCUMENTATION.md** - Complete endpoint reference with examples
- **walkthrough.md** - Implementation details and testing guide

## ⚠️ Important Notes

1. **OTP Emails:** Check your email inbox (or spam folder). If SMTP not configured, OTPs are logged to server console.

2. **Registration Flow:** New 2-step process:
   - Step 1: `POST /api/auth/register` → Sends OTP
   - Step 2: `POST /api/auth/verify-otp` → Activates account

3. **Password Requirements:** Minimum 8 characters with:
   - At least one uppercase letter
   - At least one lowercase letter
   - At least one number
   - At least one special character

4. **Patient Verification:** Only users with `role='patient'` can be used as `patientId` in medical records.

5. **Rate Limiting:**
   - Login: 5 attempts per 15 minutes
   - Registration: 3 attempts per hour
   - OTP: 5 requests per 15 minutes

6. **S3 Upload Routes:** Available but not mounted. To enable:
   ```javascript
   // In src/app.js
   import uploadRoutes from './routes/uploadRoutes.js';
   app.use('/api/upload', uploadRoutes);
   ```

7. **Admin User:** Run `node seed.js` to create admin account for testing user management features.

8. **Production Deployment:**
   - Set `NODE_ENV=production` (hides stack traces)
   - Use strong JWT secrets (32+ characters)
   - Configure `CORS_ORIGIN` with specific allowed origins
   - Set up SMTP with production email service

## 🔒 Security Best Practices

✅ All passwords are hashed with bcrypt  
✅ JWT tokens have expiration times  
✅ Rate limiting prevents brute force attacks  
✅ Input validation on all endpoints  
✅ MongoDB injection prevention  
✅ CORS configured  
✅ Security headers via Helmet.js  
✅ Email verification required for registration  
✅ Role-based access control enforced  

## 🚀 Next Steps for Frontend Development

1. **User Registration/Login Flow**
   - Build OTP input component (6 digits)
   - Handle OTP expiration (5 minutes)
   - Implement resend OTP functionality
   - Show password strength indicator

2. **Dashboard Pages**
   - Patient dashboard: View medical records
   - Doctor dashboard: Create/view records for patients
   - Admin dashboard: User management

3. **Medical Records Interface**
   - List view with pagination
   - Detail view for single record
   - Create/edit record forms
   - File upload integration (if S3 enabled)

4. **Record Sharing**
   - Share record modal with user selection
   - View shared records list
   - Manage sharing permissions

5. **Profile Management**
   - View/edit profile
   - Change password with strength validation
   - Account settings

---

**Need Help?** Check the comprehensive API documentation in `API_DOCUMENTATION.md` or view the walkthrough in `walkthrough.md`.

**All endpoints listed as ✅ WORKING have been tested and verified!**
