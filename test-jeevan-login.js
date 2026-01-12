import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from './src/models/User.js';

dotenv.config();

const testLogin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
        console.log('✓ Connected to MongoDB\n');

        const email = 'jeevanpatil.025@gmail.com';
        const password = 'Secure@123';

        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            console.log('❌ User not found with email:', email);
            console.log('\n💡 Account does not exist. You may need to sign up first.\n');
            process.exit(1);
        }

        console.log('📋 User Details:');
        console.log(`   Email: ${user.email}`);
        console.log(`   Name: ${user.firstName} ${user.lastName}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Active: ${user.isActive}`);
        console.log(`   Verified: ${user.isVerified}`);

        // Test password comparison
        console.log('\n🔐 Testing Password:');
        const isMatch = await bcrypt.compare(password, user.password);
        console.log(`   Password matches: ${isMatch ? '✅ YES' : '❌ NO'}`);

        // Check login conditions
        console.log('\n✅ Login Checks:');
        console.log(`   User exists: ✅`);
        console.log(`   Password matches: ${isMatch ? '✅' : '❌'}`);
        console.log(`   Is active: ${user.isActive ? '✅' : '❌'}`);
        console.log(`   Is verified: ${user.isVerified ? '✅' : '❌'}`);

        if (!user.isActive || !user.isVerified || !isMatch) {
            console.log('\n❌ LOGIN WILL FAIL:');
            if (!user.isActive) console.log('   - Account is inactive');
            if (!user.isVerified) console.log('   - Account is not verified');
            if (!isMatch) console.log('   - Password does not match');

            // Fix the issues
            console.log('\n🔧 Fixing issues...');
            user.isActive = true;
            user.isVerified = true;
            if (!isMatch) {
                user.password = await bcrypt.hash(password, 10);
                console.log('   ✅ Reset password to:', password);
            }
            await user.save();
            console.log('   ✅ Account activated and verified');
        } else {
            console.log('\n✅ All checks passed - login should work!');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

testLogin();
