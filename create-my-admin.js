import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import User from './src/models/User.js';
import { sendMail } from './src/services/mailService.js';

dotenv.config();

const createAdminWithEmail = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB\n');

        const adminEmail = 'jeevanpatil.025@gmail.com';
        const temporaryPassword = 'Admin@2026'; // Temporary password

        // Check if user already exists (must select password since it's not selected by default)
        let adminUser = await User.findOne({ email: adminEmail }).select('+password');

        if (adminUser) {
            console.log('⚠️  User already exists. Updating to admin role...\n');

            adminUser.role = 'admin';
            adminUser.password = temporaryPassword; // Set plain password, pre-save hook will hash it
            adminUser.isActive = true;
            adminUser.isVerified = true;
            await adminUser.save();

            console.log('✓ User updated to admin successfully!');
        } else {
            console.log('Creating new admin user...\n');

            adminUser = new User({
                firstName: 'Jeevan',
                lastName: 'Patil',
                email: adminEmail,
                password: temporaryPassword, // Set plain password, pre-save hook will hash it
                role: 'admin',
                phoneNumber: '0000000000',
                isActive: true,
                isVerified: true,
            });

            await adminUser.save();
            console.log('✓ Admin user created successfully!');
        }

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
          
          <p>If you did not request this account, please contact the system administrator.</p>
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
            console.log('\n══════════════════════════════════════════');
            console.log('  ✅ ADMIN ACCOUNT READY');
            console.log('══════════════════════════════════════════');
            console.log('\nCredentials have been sent to your email.');
            console.log('Check your inbox at: ' + adminEmail);
            console.log('\n⚠️  Please change your password after first login!');
            console.log('══════════════════════════════════════════\n');
        } catch (emailError) {
            console.log('\n⚠️  Email could not be sent. Here are your credentials:');
            console.log('\n══════════════════════════════════════════');
            console.log('  ADMIN LOGIN CREDENTIALS');
            console.log('══════════════════════════════════════════');
            console.log('Email: ' + adminEmail);
            console.log('Password: ' + temporaryPassword);
            console.log('══════════════════════════════════════════');
            console.log('\n⚠️  Please change this password after first login!\n');
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error('\n❌ Error creating admin user:', error);
        console.error('\nDetails:', error.message);
        process.exit(1);
    }
};

createAdminWithEmail();
