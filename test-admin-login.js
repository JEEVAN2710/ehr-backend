import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from './src/models/User.js';

dotenv.config();

const testLogin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
        console.log('✓ Connected to MongoDB\n');

        const email = 'admin@ehr.com';
        const password = 'admin123';

        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            console.log('❌ User not found\n');
            process.exit(1);
        }

        console.log('📋 User Details:');
        console.log(`   Email: ${user.email}`);
        console.log(`   Name: ${user.firstName} ${user.lastName}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Active: ${user.isActive}`);
        console.log(`   Verified: ${user.isVerified}`);
        console.log(`   Has Password: ${!!user.password}`);

        // Test password comparison
        console.log('\n🔐 Testing Password:');
        const isMatch = await bcrypt.compare(password, user.password);
        console.log(`   Password '${password}' matches: ${isMatch ? '✅ YES' : '❌ NO'}`);

        // Check login conditions
        console.log('\n✅ Login Checks:');
        console.log(`   User exists: ✅`);
        console.log(`   Password matches: ${isMatch ? '✅' : '❌'}`);
        console.log(`   Is active: ${user.isActive ? '✅' : '❌'}`);
        console.log(`   Is verified: ${user.isVerified ? '✅' : '❌'}`);

        if (!user.isActive) {
            console.log('\n⚠️  ISSUE: Account is not active');
        }
        if (!user.isVerified) {
            console.log('\n⚠️  ISSUE: Account is not verified');
        }
        if (!isMatch) {
            console.log('\n⚠️  ISSUE: Password does not match');
        }

        if (user.isActive && user.isVerified && isMatch) {
            console.log('\n✅ All checks passed - login should work!');
        } else {
            console.log('\n❌ Login would fail - see issues above');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

testLogin();
