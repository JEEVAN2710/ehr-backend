import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './src/models/User.js';

dotenv.config();

const verifyUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
        console.log('✓ Connected to MongoDB\n');

        const emails = ['patiljeevan2710@gmail.com', 'gamingjeevan2710@gmail.com'];

        for (const email of emails) {
            const user = await User.findOne({ email });

            if (!user) {
                console.log(`❌ ${email}: Account not found\n`);
                continue;
            }

            console.log(`📧 ${email}`);
            console.log(`   Role: ${user.role}`);
            console.log(`   Active: ${user.isActive ? '✅ YES' : '❌ NO'}`);
            console.log(`   Verified: ${user.isVerified ? '✅ YES' : '❌ NO'}`);

            // Auto-verify if not verified
            if (!user.isVerified || !user.isActive) {
                user.isVerified = true;
                user.isActive = true;
                await user.save();
                console.log(`   ✅ FIXED: Now verified and active`);
            }
            console.log('');
        }

        console.log('✅ All test accounts are now active and verified!\n');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

verifyUsers();
