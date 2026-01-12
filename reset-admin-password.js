import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from './src/models/User.js';

dotenv.config();

const resetAdminPassword = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
        console.log('✓ Connected to MongoDB\n');

        const admin = await User.findOne({ role: 'admin' });

        if (!admin) {
            console.log('❌ No admin account found\n');
            process.exit(1);
        }

        // Set a known test password
        const newPassword = 'admin123';
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        admin.password = hashedPassword;
        admin.isActive = true;
        admin.isVerified = true;
        await admin.save();

        console.log('='.repeat(70));
        console.log('✅ ADMIN PASSWORD RESET SUCCESSFUL');
        console.log('='.repeat(70));
        console.log(`\n📧 Email: ${admin.email}`);
        console.log(`👤 Name: ${admin.firstName} ${admin.lastName}`);
        console.log(`🔑 New Password: ${newPassword}`);
        console.log(`✅ Active: YES`);
        console.log(`✅ Verified: YES`);
        console.log('\n💡 You can now login with these credentials!');
        console.log('='.repeat(70) + '\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

resetAdminPassword();
