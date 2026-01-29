# Render Deployment Configuration

## Environment Variables Required

### Essential Variables
```
NODE_ENV=production
PORT=4000  # Or whatever Render assigns
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_jwt_refresh_secret
```

### Email Configuration (SMTP)
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
MAIL_FROM=your_email@gmail.com
```

### Cloud Storage (AWS S3 Compatible / R2)
```
AWS_REGION=auto
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_ENDPOINT=your_r2_endpoint
AWS_BUCKET_NAME=your_bucket_name
AWS_PUBLIC_URL=your_public_url
```

### Blockchain (Optional - Recommended: DISABLE for production)
```
BLOCKCHAIN_ENABLED=false
```

**Important:** Leave blockchain DISABLED unless you have:
- Ethers package installed (adds ~50MB to deployment)
- A blockchain node to connect to
- Contract address and wallet configured

### OTP Logging for Testing
```
SHOW_OTP_IN_LOGS=true
```
Set this to see OTP codes in Render logs when email service is blocked.

## Build Command
```
npm install
```

## Start Command
```
npm start
```

## Node Version
Ensure Render uses Node.js v18+ (configured in Render dashboard)

## Deployment Checklist

- [ ] All environment variables set in Render
- [ ] BLOCKCHAIN_ENABLED=false (unless using blockchain)
- [ ] SHOW_OTP_IN_LOGS=true for testing
- [ ] MongoDB connection string is correct
- [ ] AWS/R2 credentials are valid
- [ ] SMTP credentials are configured
- [ ] JWT secrets are strong and unique

## Troubleshooting

### OTP Emails Not Sending
- Check SHOW_OTP_IN_LOGS=true in environment variables
- View Render logs to see OTP codes

### Database Connection Issues
- Verify MONGO_URI format
- Ensure MongoDB allows connections from Render's IP

### Build Failures
- Check Node.js version compatibility
- Review build logs for missing dependencies

### Blockchain Errors (ERR_MODULE_NOT_FOUND for 'ethers')
- Set BLOCKCHAIN_ENABLED=false
- App will run without blockchain functionality
