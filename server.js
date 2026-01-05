import dotenv from 'dotenv';
import connectDB from './src/config/db.js';
import app from './src/app.js';
import { verifySMTP, isSmtpConfigured } from './src/services/mailService.js';

dotenv.config();

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`✓ Server is running on http://localhost:${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    if (isSmtpConfigured()) {
      const result = await verifySMTP();
      if (result.ok) {
        console.log('✓ SMTP ready');
      } else {
        console.error('✗ SMTP verify failed:', result.error);
      }
    } else {
      console.log('ℹ SMTP not configured; emails will be logged');
    }
  } catch (error) {
    console.error('✗ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
