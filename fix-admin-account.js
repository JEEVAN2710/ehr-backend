import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './src/models/User.js';
import { sendMail } from './src/services/mailService.js';

dotenv.config();

const fixAdminAccount = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB\n');

        const adminEmail = 'jeevanpatil.025@gmail.com';
        const temporaryPassword = 'Admin@2026';

        // Delete existing admin if exists
        const deletedUser = await User.findOneAndDelete({ email: adminEmail });
        if (deletedUser) {
            console.log('✓ Deleted existing admin user\n');
        }

        // Create fresh admin user
        console.log('Creating fresh admin user...\n');

        const adminUser = new User({
            firstName: 'Jeevan',
            lastName: 'Patil',
            email: adminEmail,
            password: temporaryPassword, // Pre-save hook will hash this
            role: 'admin',
            phoneNumber: '0000000000',
            isActive: true,
            isVerified: true,
        });

        await adminUser.save();
        console.log('✅ Admin user created successfully!\n');

        // Verify password was saved
        const verifyUser = await User.findOne({ email: adminEmail }).select('+password');
        console.log('Password saved:', !!verifyUser.password);
        console.log('Password hash length:', verifyUser.password?.length || 0);

        // Send email with credentials
        console.log('\nSending email with credentials...');

        try {
            await sendMail({
                to: adminEmail,
                subject: 'Your EHR Admin Account - Temporary Password',
                html: `
          <h2>Welcome to EHR System!</h2>
          <p>Your admin account has been created successfully.</p>
          
          <h3>Login Credentials:</h3>
          <p><strong>Email:</strong> ${adminEmail}</p>
          <p><strong>Temporary Password:</strong> ${temporaryPassword}</p>
          
          <h3>Important:</h3>
          <ul>
            <li>Please log in and change your password immediately</li>
            <li>Go to Profile → Change Password after logging in</li>
            <li>This is a temporary password for initial access only</li>
          </ul>
          
          <p><strong>Login URL:</strong> http://localhost:5173</p>
          
          <p>For security reasons, please change your password after your first login.</p>
        `,
                text: `
Welcome to EHR System!

Your admin account has been created successfully.

Login Credentials:
Email: ${adminEmail}
Temporary Password: ${temporaryPassword}

Important:
- Please log in and change your password immediately  
- Go to Profile → Change Password after logging in
- This is a temporary password for initial access only

Login URL: http://localhost:5173

For security reasons, please change your password after your first login.
        `
            });
            console.log('✓ Email sent successfully to ' + adminEmail);
        } catch (emailError) {
            console.log('\n⚠️  Email could not be sent.');
        }

        console.log('\n══════════════════════════════════════════');
        console.log('  ✅ ADMIN ACCOUNT READY');
        console.log('══════════════════════════════════════════');
        console.log('\nLogin Credentials:');
        console.log('Email:', adminEmail);
        console.log('Password:', temporaryPassword);
        console.log('══════════════════════════════════════════\n');

        await mongoose.disconnect();
    } catch (error) {
        console.error('\n❌ Error:', error);
        console.error('\nDetails:', error.message);
        process.exit(1);
    }
};

fixAdminAccount();
