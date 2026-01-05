import dotenv from 'dotenv';
import app from './src/app.js';
import connectDB from './src/config/db.js';
import { verifySmtpConnection } from './src/services/emailService.js';

dotenv.config();

const PORT = process.env.PORT || 4000;

// Startup sequence
async function startServer() {
  try {
    // 1. Connect to database
    await connectDB();

    // 2. Verify SMTP connection
    console.log('\n🔍 Verifying SMTP connection...');
    await verifySmtpConnection();
    console.log('');

    // 3. Start server
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✓ Server is running on http://localhost:${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
  }
}

startServer();
