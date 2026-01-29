import dotenv from 'dotenv';
import app from './src/app.js';
import connectDB from './src/config/db.js';
import { verifySMTP } from './src/services/mailService.js';

dotenv.config();

const PORT = process.env.PORT || 4000;

// Startup sequence
async function startServer() {
  try {
    // 1. Connect to database
    await connectDB();

    // 2. Verify SMTP connection
    console.log('\n🔍 Verifying SMTP connection...');
    const smtpStatus = await verifySMTP();
    if (smtpStatus.configured && smtpStatus.ok) {
      console.log(`✅ Email service ready: ${smtpStatus.method}`);
    } else if (smtpStatus.configured && !smtpStatus.ok) {
      console.warn(`⚠️  Email configured but verification failed: ${smtpStatus.error}`);
    }

    // 3. Initialize blockchain (optional - only if enabled)
    if (process.env.BLOCKCHAIN_ENABLED === 'true') {
      try {
        console.log('\n🔗 Initializing blockchain...');
        const { initBlockchain } = await import('./src/services/blockchainService.js');
        await initBlockchain();
      } catch (error) {
        console.warn('⚠️  Blockchain initialization failed:', error.message);
        console.warn('   Continuing without blockchain functionality...');
      }
    } else {
      console.log('\nℹ️  Blockchain disabled (BLOCKCHAIN_ENABLED not set to true)');
    }

    // 4. Start server
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
