import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import User from './src/models/User.js';

dotenv.config();

const verifyAccount = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB\n');

        const adminEmail = 'jeevanpatil.025@gmail.com';
        const testPassword = 'Admin@2026';

        // Find the user
        const user = await User.findOne({ email: adminEmail });

        if (!user) {
            console.log('❌ User NOT found in database!');
            await mongoose.disconnect();
            return;
        }

        console.log('✅ User found in database:');
        console.log('   Email:', user.email);
        console.log('   Role:', user.role);
        console.log('   Active:', user.isActive);
        console.log('   Verified:', user.isVerified);
        console.log('   Created:', user.createdAt);

        // Test password
        console.log('\n🔐 Testing password...');
        const isPasswordValid = await bcryptjs.compare(testPassword, user.password);

        if (isPasswordValid) {
            console.log('✅ Password is CORRECT!');
            console.log('\nThe account should work. Try logging in again.');
        } else {
            console.log('❌ Password does NOT match!');
            console.log('\nResetting password to Admin@2026...');

            const salt = await bcryptjs.genSalt(10);
            const hashedPassword = await bcryptjs.hash(testPassword, salt);
            user.password = hashedPassword;
            await user.save();

            console.log('✅ Password reset successfully!');
            console.log('\nPlease try logging in again with:');
            console.log('   Email: ' + adminEmail);
            console.log('   Password: Admin@2026');
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

verifyAccount();
