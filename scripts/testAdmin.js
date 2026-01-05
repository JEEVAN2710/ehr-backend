import mongoose from 'mongoose';
import { User } from '../src/models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const testAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✓ Connected to MongoDB\n');

        const user = await User.findOne({ email: 'jeevanpatil.025@gmail.com' }).select('+password');

        if (!user) {
            console.log('❌ Admin user not found!');
            return;
        }

        console.log('Admin found:');
        console.log('  Email:', user.email);
        console.log('  Role:', user.role);
        console.log('  IsActive:', user.isActive);
        console.log('  IsVerified:', user.isVerified);
        console.log('  Password hash:', user.password ? 'exists' : 'missing');

        // Test password
        const testPassword = 'Secure@123';
        const isMatch = await user.matchPassword(testPassword);

        console.log('\nPassword Test:');
        console.log('  Testing password:', testPassword);
        console.log('  Result:', isMatch ? '✓ MATCH' : '✗ NO MATCH');

        if (isMatch) {
            console.log('\n🎉 Login should work!');
        } else {
            console.log('\n❌ LOGIN WILL FAIL - Password does not match');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
};

testAdmin();
