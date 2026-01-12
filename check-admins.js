import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './src/models/User.js';

dotenv.config();

const checkAdmins = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
        console.log('✓ Connected to MongoDB\n');

        const admins = await User.find({ role: 'admin' });

        if (admins.length === 0) {
            console.log('❌ No admin accounts found\n');
            process.exit(1);
        }

        console.log(`Found ${admins.length} admin account(s):\n`);
        console.log('='.repeat(70));

        for (const admin of admins) {
            console.log(`\n📧 Email: ${admin.email}`);
            console.log(`   Name: ${admin.firstName} ${admin.lastName}`);
            console.log(`   Active: ${admin.isActive ? '✅ YES' : '❌ NO'}`);
            console.log(`   Verified: ${admin.isVerified ? '✅ YES' : '❌ NO'}`);
            console.log(`   Created: ${admin.createdAt}`);

            // Auto-verify and activate if needed
            if (!admin.isVerified || !admin.isActive) {
                admin.isVerified = true;
                admin.isActive = true;
                await admin.save();
                console.log(`   ✅ FIXED: Now active and verified`);
            }
        }

        console.log('\n' + '='.repeat(70));
        console.log('✅ All admin accounts are now active and verified!\n');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

checkAdmins();
