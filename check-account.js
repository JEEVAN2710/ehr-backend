import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './src/models/User.js';

dotenv.config();

const checkAccount = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
        console.log('✓ Connected to MongoDB');

        const email = process.argv[2] || 'patiljeevan2710@gmail.com';
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            console.log(`❌ No account found for: ${email}`);
            console.log('\n💡 You need to sign up first!');
            process.exit(1);
        }

        console.log('\n' + '='.repeat(60));
        console.log('📋 ACCOUNT STATUS');
        console.log('='.repeat(60));
        console.log(`\n📧 Email: ${user.email}`);
        console.log(`👤 Name: ${user.firstName} ${user.lastName}`);
        console.log(`🎭 Role: ${user.role}`);
        console.log(`✅ Active: ${user.isActive ? 'YES' : 'NO'}`);
        console.log(`✓ Verified: ${user.isVerified ? 'YES' : 'NO'}`);
        console.log(`🔑 Has Password: ${user.password ? 'YES' : 'NO'}`);
        console.log(`📅 Created: ${user.createdAt}`);
        console.log('='.repeat(60));

        if (!user.isActive) {
            console.log('\n⚠️  Account is INACTIVE - needs activation');
        }
        if (!user.isVerified) {
            console.log('\n⚠️  Account is NOT VERIFIED - needs email verification');
        }
        console.log('');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

checkAccount();
