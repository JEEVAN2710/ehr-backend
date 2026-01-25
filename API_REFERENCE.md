# EHR Backend - Complete API Reference

> **Base URL**: `https://ehr-backend-uedr.onrender.com/api`

This comprehensive API reference includes all endpoints, request/response formats, authentication requirements, and input types. Perfect for building custom frontends with animations or integrating with mobile apps.

---

## 📑 Table of Contents

1. [Authentication](#authentication)
2. [Medical Records](#medical-records)
3. [Access Requests](#access-requests)
4. [File Upload/Download](#file-uploaddownload)
5. [Public Routes](#public-routes)
6. [Error Handling](#error-handling)
7. [Rate Limiting](#rate-limiting)

---

## 🔐 Authentication

All authenticated endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### 1. Register New User

**Endpoint**: `POST /auth/register`  
**Auth Required**: No  
**Rate Limit**: 50 requests per hour

**Request Body**:
```json
{
  "firstName": "string (required, non-empty)",
  "lastName": "string (required, non-empty)",
  "email": "string (required, valid email)",
  "password": "string (required, min 8 chars, must contain: lowercase, uppercase, number, special char)",
  "role": "string (optional, one of: patient|doctor|labassistant, default: patient)",
  "phoneNumber": "string (required, valid mobile number)",
  "dateOfBirth": "string (required, ISO8601 date format, e.g., '1990-01-15')"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Registration successful. Please verify OTP sent to your email",
  "userId": "507f1f77bcf86cd799439011"
}
```

**Error Response** (400):
```json
{
  "success": false,
  "message": "User with this email already exists"
}
```

---

### 2. Verify OTP

**Endpoint**: `POST /auth/verify-otp`  
**Auth Required**: No  
**Rate Limit**: 5 requests per 15 minutes

**Request Body**:
```json
{
  "email": "string (required, valid email)",
  "otp": "string (required, exactly 6 digits)"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Email verified successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "patient",
    "phoneNumber": "+1234567890",
    "isVerified": true,
    "isActive": true
  }
}
```

**Error Response** (400):
```json
{
  "success": false,
  "message": "Invalid or expired OTP"
}
```

---

### 3. Resend OTP

**Endpoint**: `POST /auth/resend-otp`  
**Auth Required**: No  
**Rate Limit**: 5 requests per 15 minutes

**Request Body**:
```json
{
  "email": "string (required, valid email)"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "OTP resent successfully"
}
```

---

### 4. Login

**Endpoint**: `POST /auth/login`  
**Auth Required**: No  
**Rate Limit**: 50 requests per 15 minutes

**Request Body** (Email or Phone):
```json
{
  "email": "string (required if phoneNumber not provided)",
  "phoneNumber": "string (required if email not provided)",
  "password": "string (required)"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "patient",
    "phoneNumber": "+1234567890",
    "isVerified": true,
    "isActive": true
  }
}
```

**Error Response** (401):
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

---

### 5. Refresh Token

**Endpoint**: `POST /auth/refresh`  
**Auth Required**: No

**Request Body**:
```json
{
  "refreshToken": "string (required)"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "token": "new_access_token",
  "refreshToken": "new_refresh_token"
}
```

---

### 6. Get User Profile

**Endpoint**: `GET /auth/profile`  
**Auth Required**: Yes

**Success Response** (200):
```json
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "patient",
    "phoneNumber": "+1234567890",
    "dateOfBirth": "1990-01-15T00:00:00.000Z",
    "isVerified": true,
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 7. Update User Profile

**Endpoint**: `PUT /auth/profile`  
**Auth Required**: Yes

**Request Body**:
```json
{
  "phoneNumber": "string (optional, valid mobile)",
  "dateOfBirth": "string (optional, ISO8601 date)"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": { /* updated user object */ }
}
```

---

### 8. Change Password

**Endpoint**: `PUT /auth/change-password`  
**Auth Required**: Yes

**Request Body**:
```json
{
  "currentPassword": "string (required)",
  "newPassword": "string (required, min 8 chars, must contain: lowercase, uppercase, number, special char)"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

### 9. Forgot Password

**Endpoint**: `POST /auth/forgot-password`  
**Auth Required**: No  
**Rate Limit**: 5 requests per 15 minutes

**Request Body**:
```json
{
  "email": "string (required, valid email)"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Temporary password sent to your email"
}
```

---

### 10. Verify Patient Email (Doctor/Lab Use)

**Endpoint**: `GET /auth/verify-patient`  
**Auth Required**: Yes (Doctor or Lab Assistant only)  
**Query Parameters**: `?email=patient@example.com`

**Success Response** (200):
```json
{
  "success": true,
  "exists": true,
  "patient": {
    "id": "507f1f77bcf86cd799439011",
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane@example.com"
  }
}
```

---

### 11. Get All Users (Admin)

**Endpoint**: `GET /auth/users`  
**Auth Required**: Yes (Admin only)

**Success Response** (200):
```json
{
  "success": true,
  "users": [
    {
      "id": "507f1f77bcf86cd799439011",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "role": "patient",
      "phoneNumber": "+1234567890",
      "isVerified": true,
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### 12. Update User Status (Admin)

**Endpoint**: `PUT /auth/users/:userId/status`  
**Auth Required**: Yes (Admin only)  
**URL Parameters**: `userId` (MongoDB ObjectId)

**Request Body**:
```json
{
  "isActive": "boolean (required)"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "User status updated successfully"
}
```

---

### 13. Update User Details (Admin)

**Endpoint**: `PUT /auth/users/:userId`  
**Auth Required**: Yes (Admin only)  
**URL Parameters**: `userId` (MongoDB ObjectId)

**Request Body**:
```json
{
  "email": "string (optional, valid email)",
  "role": "string (optional, one of: patient|doctor|labassistant|admin)",
  "phoneNumber": "string (optional, valid mobile)"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "User updated successfully",
  "user": { /* updated user object */ }
}
```

---

## 📋 Medical Records

### 14. Create Medical Record

**Endpoint**: `POST /records`  
**Auth Required**: Yes (Patient, Doctor, or Lab Assistant)

**Request Body**:
```json
{
  "patientId": "string (required, MongoDB ObjectId)",
  "title": "string (required, non-empty)",
  "description": "string (required, non-empty)",
  "recordType": "string (optional, one of: prescription|labtest|scan|report|other)"
}
```

**Success Response** (201):
```json
{
  "success": true,
  "message": "Record created successfully",
  "record": {
    "_id": "507f1f77bcf86cd799439011",
    "patientId": "507f1f77bcf86cd799439012",
    "createdBy": "507f1f77bcf86cd799439013",
    "role": "doctor",
    "title": "Blood Test Results",
    "description": "Annual checkup blood work",
    "recordType": "labtest",
    "files": [],
    "isShared": false,
    "sharedWith": [],
    "createdAt": "2024-01-20T10:00:00.000Z",
    "updatedAt": "2024-01-20T10:00:00.000Z"
  }
}
```

---

### 15. Get Patient Records

**Endpoint**: `GET /records/:patientId`  
**Auth Required**: Yes (Patient, Doctor, or Lab Assistant)  
**URL Parameters**: `patientId` (MongoDB ObjectId)

**Success Response** (200):
```json
{
  "success": true,
  "records": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "patientId": {
        "_id": "507f1f77bcf86cd799439012",
        "firstName": "John",
        "lastName": "Doe"
      },
      "createdBy": {
        "_id": "507f1f77bcf86cd799439013",
        "firstName": "Dr. Jane",
        "lastName": "Smith"
      },
      "role": "doctor",
      "title": "Blood Test Results",
      "description": "Annual checkup blood work",
      "recordType": "labtest",
      "files": [
        {
          "key": "uploads/patient123/file.pdf",
          "filename": "blood_test.pdf",
          "contentType": "application/pdf",
          "size": 125000,
          "uploadedAt": "2024-01-20T10:00:00.000Z",
          "url": "https://presigned-url.com/..."
        }
      ],
      "isShared": true,
      "sharedWith": ["507f1f77bcf86cd799439014"],
      "createdAt": "2024-01-20T10:00:00.000Z"
    }
  ]
}
```

---

### 16. Get My Records (Doctor/Lab)

**Endpoint**: `GET /records/my-records`  
**Auth Required**: Yes (Doctor or Lab Assistant only)

**Success Response** (200):
```json
{
  "success": true,
  "records": [
    /* Array of records created by the authenticated doctor/lab assistant */
  ]
}
```

---

### 17. Get Shared Via Links (Doctor/Lab)

**Endpoint**: `GET /records/shared-via-links`  
**Auth Required**: Yes (Doctor or Lab Assistant only)

**Success Response** (200):
```json
{
  "success": true,
  "sharedLinks": [
    {
      "patientId": "507f1f77bcf86cd799439012",
      "patientName": "John Doe",
      "accessedAt": "2024-01-20T10:00:00.000Z",
      "recordCount": 5
    }
  ]
}
```

---

### 18. Get Single Record

**Endpoint**: `GET /records/view/:recordId`  
**Auth Required**: Yes (Patient, Doctor, or Lab Assistant)  
**URL Parameters**: `recordId` (MongoDB ObjectId)

**Success Response** (200):
```json
{
  "success": true,
  "record": {
    /* Single record object with all details */
  }
}
```

---

### 19. Update Record

**Endpoint**: `PUT /records/:recordId`  
**Auth Required**: Yes (Patient, Doctor, or Lab Assistant)  
**URL Parameters**: `recordId` (MongoDB ObjectId)

**Request Body**:
```json
{
  "title": "string (optional, non-empty)",
  "description": "string (optional, non-empty)",
  "recordType": "string (optional, one of: prescription|labtest|scan|report|other)"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Record updated successfully",
  "record": { /* updated record object */ }
}
```

---

### 20. Delete Record

**Endpoint**: `DELETE /records/:recordId`  
**Auth Required**: Yes (Patient, Doctor, Lab Assistant, or Admin)  
**URL Parameters**: `recordId` (MongoDB ObjectId)

**Success Response** (200):
```json
{
  "success": true,
  "message": "Record deleted successfully"
}
```

---

### 21. Add File to Record

**Endpoint**: `POST /records/:recordId/files`  
**Auth Required**: Yes (Patient, Doctor, or Lab Assistant)  
**URL Parameters**: `recordId` (MongoDB ObjectId)

**Request Body**:
```json
{
  "fileKey": "string (required, S3/R2 key)",
  "filename": "string (required, original filename)",
  "contentType": "string (required, MIME type)",
  "size": "number (required, file size in bytes, min 1)"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "File added to record successfully",
  "record": { /* updated record with new file */ }
}
```

---

### 22. Share Record with Users

**Endpoint**: `POST /records/:recordId/share`  
**Auth Required**: Yes (Patient, Doctor, or Lab Assistant)  
**URL Parameters**: `recordId` (MongoDB ObjectId)

**Request Body**:
```json
{
  "userIds": ["string (MongoDB ObjectId, min 1 user required)"]
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Record shared successfully"
}
```

---

### 23. Revoke Record Sharing

**Endpoint**: `DELETE /records/:recordId/share/:userId`  
**Auth Required**: Yes (Patient, Doctor, or Lab Assistant)  
**URL Parameters**: 
- `recordId` (MongoDB ObjectId)
- `userId` (MongoDB ObjectId)

**Success Response** (200):
```json
{
  "success": true,
  "message": "Record sharing revoked successfully"
}
```

---

### 24. Get Records Shared With Me

**Endpoint**: `GET /records/shared-with-me`  
**Auth Required**: Yes (Patient, Doctor, or Lab Assistant)

**Success Response** (200):
```json
{
  "success": true,
  "records": [
    /* Array of records shared with the authenticated user */
  ]
}
```

---

### 25. Generate Share All Token

**Endpoint**: `POST /records/share-all`  
**Auth Required**: Yes (Patient only)

**Request Body**:
```json
{
  "duration": "string (optional, one of: 4h|24h|7d, default: 24h)"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Share token generated successfully",
  "token": "a7f3b2c1d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0",
  "expiresAt": "2024-01-21T10:00:00.000Z",
  "shareUrl": "https://ehr-frontend-zeta.vercel.app/shared/all/a7f3b2c1d4e5f6g7h8i9j0k1l2m3n4o5"
}
```

---

## 🔓 Public Routes

### 26. Get Records by Share Token

**Endpoint**: `GET /records/shared/all/:token`  
**Auth Required**: No (Optional for tracking)  
**URL Parameters**: `token` (string)

**Success Response** (200):
```json
{
  "success": true,
  "patient": {
    "firstName": "John",
    "lastName": "Doe"
  },
  "records": [
    /* Array of all patient records accessible via this token */
  ],
  "expiresAt": "2024-01-21T10:00:00.000Z"
}
```

**Error Response** (404):
```json
{
  "success": false,
  "message": "Invalid or expired share token"
}
```

---

## 🔑 Access Requests

### 27. Request Access to Patient Records

**Endpoint**: `POST /access-requests`  
**Auth Required**: Yes (Doctor or Lab Assistant only)

**Request Body**:
```json
{
  "patientId": "string (required, MongoDB ObjectId)",
  "message": "string (optional, max 500 characters)"
}
```

**Success Response** (201):
```json
{
  "success": true,
  "message": "Access request sent successfully",
  "accessRequest": {
    "_id": "507f1f77bcf86cd799439011",
    "requesterId": "507f1f77bcf86cd799439012",
    "patientId": "507f1f77bcf86cd799439013",
    "status": "pending",
    "message": "Need access for treatment",
    "createdAt": "2024-01-20T10:00:00.000Z"
  }
}
```

**Error Response** (400):
```json
{
  "success": false,
  "message": "You already have a pending request for this patient"
}
```

---

### 28. Get Pending Requests (Patient)

**Endpoint**: `GET /access-requests/pending`  
**Auth Required**: Yes (Patient only)

**Success Response** (200):
```json
{
  "success": true,
  "requests": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "requesterId": {
        "_id": "507f1f77bcf86cd799439012",
        "firstName": "Dr. Jane",
        "lastName": "Smith",
        "email": "drsmith@example.com"
      },
      "status": "pending",
      "message": "Need access for treatment",
      "createdAt": "2024-01-20T10:00:00.000Z"
    }
  ]
}
```

---

### 29. Respond to Access Request (Patient)

**Endpoint**: `PUT /access-requests/:requestId/respond`  
**Auth Required**: Yes (Patient only)  
**URL Parameters**: `requestId` (MongoDB ObjectId)

**Request Body**:
```json
{
  "action": "string (required, one of: approve|deny)"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Access request approved successfully"
}
```

---

### 30. Revoke Access (Patient)

**Endpoint**: `PUT /access-requests/:requestId/revoke`  
**Auth Required**: Yes (Patient only)  
**URL Parameters**: `requestId` (MongoDB ObjectId)

**Request Body**:
```json
{
  "timing": "string (optional, one of: immediate|4h|8h)"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Access revoked successfully"
}
```

---

### 31. Get Granted Access (Patient)

**Endpoint**: `GET /access-requests/granted-access`  
**Auth Required**: Yes (Patient only)

**Success Response** (200):
```json
{
  "success": true,
  "grantedAccess": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "requesterId": {
        "_id": "507f1f77bcf86cd799439012",
        "firstName": "Dr. Jane",
        "lastName": "Smith",
        "email": "drsmith@example.com"
      },
      "status": "approved",
      "createdAt": "2024-01-20T10:00:00.000Z",
      "respondedAt": "2024-01-20T11:00:00.000Z"
    }
  ]
}
```

---

### 32. Get My Requests (Doctor/Lab)

**Endpoint**: `GET /access-requests/my-requests`  
**Auth Required**: Yes (Doctor or Lab Assistant only)

**Success Response** (200):
```json
{
  "success": true,
  "requests": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "patientId": {
        "_id": "507f1f77bcf86cd799439013",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com"
      },
      "status": "pending",
      "message": "Need access for treatment",
      "createdAt": "2024-01-20T10:00:00.000Z"
    }
  ]
}
```

---

### 33. Cancel Access Request (Doctor/Lab)

**Endpoint**: `DELETE /access-requests/:requestId`  
**Auth Required**: Yes (Doctor or Lab Assistant only)  
**URL Parameters**: `requestId` (MongoDB ObjectId)

**Success Response** (200):
```json
{
  "success": true,
  "message": "Access request cancelled successfully"
}
```

---

## 📁 File Upload/Download

### 34. Get Presigned Upload URL

**Endpoint**: `POST /upload/presigned-upload`  
**Auth Required**: Yes (Patient, Doctor, or Lab Assistant)

**Request Body**:
```json
{
  "filename": "string (required, original filename)",
  "contentType": "string (required, MIME type, e.g., 'application/pdf', 'image/jpeg')",
  "patientId": "string (optional, MongoDB ObjectId, used for organizing files)"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "uploadUrl": "https://presigned-s3-url.com/...",
  "fileKey": "uploads/patient123/uuid_filename.pdf",
  "expiresIn": 3600
}
```

**Usage**:
1. Get presigned URL from this endpoint
2. Upload file directly to the `uploadUrl` using PUT request with the file as body
3. Use the returned `fileKey` when adding file to a record

---

### 35. Get Presigned Download URL

**Endpoint**: `POST /upload/presigned-download`  
**Auth Required**: Yes (Patient, Doctor, or Lab Assistant)

**Request Body**:
```json
{
  "fileKey": "string (required, S3/R2 key from record)"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "downloadUrl": "https://presigned-s3-url.com/...",
  "expiresIn": 3600
}
```

---

## 🏥 Utility Endpoints

### 36. Health Check

**Endpoint**: `GET /health`  
**Auth Required**: No

**Success Response** (200):
```json
{
  "success": true,
  "message": "Server is healthy",
  "timestamp": "2024-01-20T10:00:00.000Z"
}
```

---

### 37. API Version

**Endpoint**: `GET /version`  
**Auth Required**: No

**Success Response** (200):
```json
{
  "success": true,
  "version": "1.0.1",
  "commit": "fa80a2c",
  "features": ["my-records-route", "share-all-fix"],
  "timestamp": "2024-01-20T10:00:00.000Z"
}
```

---

## ⚠️ Error Handling

### Error Response Format

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error description here"
}
```

### Common HTTP Status Codes

| Code | Meaning | Common Causes |
|------|---------|---------------|
| 400 | Bad Request | Invalid input, validation errors |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate resource (e.g., email exists) |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server-side error |

### Validation Errors

When validation fails, you'll receive a detailed error:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Valid email is required"
    },
    {
      "field": "password",
      "message": "Password must contain at least one uppercase letter"
    }
  ]
}
```

---

## ⏱️ Rate Limiting

Rate limits are applied per IP address:

| Endpoint Pattern | Window | Max Requests |
|-----------------|--------|--------------|
| `/auth/login` | 15 minutes | 50 |
| `/auth/register` | 1 hour | 50 |
| `/auth/verify-otp`, `/auth/resend-otp` | 15 minutes | 5 |
| `/auth/forgot-password` | 15 minutes | 5 |
| All other `/api/*` | 15 minutes | 100 |

When rate limit is exceeded:

```json
{
  "success": false,
  "message": "Too many requests from this IP, please try again later"
}
```

---

## 🔒 Role-Based Access Control

### Role Permissions Matrix

| Endpoint | Patient | Doctor | Lab Assistant | Admin |
|----------|---------|--------|---------------|-------|
| Create own records | ✅ | ✅ | ✅ | ✅ |
| Create records for others | ❌ | ✅ | ✅ | ❌ |
| View own records | ✅ | ✅ | ✅ | ✅ |
| View shared records | ✅ | ✅ | ✅ | ✅ |
| Share records | ✅ | ✅ | ✅ | ❌ |
| Generate share tokens | ✅ | ❌ | ❌ | ❌ |
| Request access | ❌ | ✅ | ✅ | ❌ |
| Approve/Deny requests | ✅ | ❌ | ❌ | ❌ |
| Manage users | ❌ | ❌ | ❌ | ✅ |

---

## 📝 Common Input Types

### MongoDB ObjectId
- Format: 24-character hexadecimal string
- Example: `"507f1f77bcf86cd799439011"`

### ISO8601 Date
- Format: `YYYY-MM-DDTHH:mm:ss.sssZ`
- Example: `"2024-01-20T10:30:00.000Z"`
- For dateOfBirth: `"1990-01-15"` (date only)

### Phone Number
- Must be a valid mobile number
- Example: `"+1234567890"`, `"+919876543210"`

### Email
- Must be a valid email format
- Automatically normalized to lowercase

### Password Requirements
- Minimum 8 characters
- At least one lowercase letter
- At least one uppercase letter
- At least one number
- At least one special character (!@#$%^&*(),.?":{}|<>)

---

## 🚀 Quick Start Example

### Register and Login Flow

```javascript
// 1. Register
const registerResponse = await fetch('https://ehr-backend-uedr.onrender.com/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    password: 'SecurePass123!',
    role: 'patient',
    phoneNumber: '+1234567890',
    dateOfBirth: '1990-01-15'
  })
});

// 2. Verify OTP (check email for OTP)
const verifyResponse = await fetch('https://ehr-backend-uedr.onrender.com/api/auth/verify-otp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'john@example.com',
    otp: '123456'
  })
});

const { token, user } = await verifyResponse.json();

// 3. Use token for authenticated requests
const profileResponse = await fetch('https://ehr-backend-uedr.onrender.com/api/auth/profile', {
  headers: { 
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

---

## 📦 File Upload Flow Example

```javascript
// 1. Get presigned upload URL
const presignedResponse = await fetch('https://ehr-backend-uedr.onrender.com/api/upload/presigned-upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    filename: 'medical-report.pdf',
    contentType: 'application/pdf',
    patientId: 'your-patient-id'
  })
});

const { uploadUrl, fileKey } = await presignedResponse.json();

// 2. Upload file directly to S3/R2
await fetch(uploadUrl, {
  method: 'PUT',
  body: fileBlob,
  headers: {
    'Content-Type': 'application/pdf'
  }
});

// 3. Add file to record
await fetch(`https://ehr-backend-uedr.onrender.com/api/records/${recordId}/files`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    fileKey: fileKey,
    filename: 'medical-report.pdf',
    contentType: 'application/pdf',
    size: fileBlob.size
  })
});
```

---

## 📞 Support

For issues or questions:
- Check the [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed technical documentation
- Review [android_dev.md](./android_dev.md) for Android integration details
- Refer to [README.md](./README.md) for project overview

---

**Last Updated**: January 2026  
**API Version**: 1.0.1  
**Base URL**: `https://ehr-backend-uedr.onrender.com/api`
