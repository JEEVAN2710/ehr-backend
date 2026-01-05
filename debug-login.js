import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import User from './src/models/User.js';

dotenv.config();

const debugLogin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const email = 'jeevanpatil.025@gmail.com';
        const password = 'Admin@2026';

        console.log('\n🔍 Debugging Login for:', email);
        console.log('═══════════════════════════════════════\n');

        // Find user (explicitly select password since it has select: false in schema)
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            console.log('❌ User NOT found in database');
            await mongoose.disconnect();
            return;
        }

        console.log('✅ User found:');
        console.log('   _id:', user._id);
        console.log('   email:', user.email);
        console.log('   role:', user.role);
        console.log('   isActive:', user.isActive);
        console.log('   isVerified:', user.isVerified);
        console.log('   Password hash exists:', !!user.password);
        console.log('   Password hash length:', user.password ? user.password.length : 0);

        // Test password
        console.log('\n🔐 Testing password comparison...');

        if (!user.password) {
            console.log('❌ Password hash is missing!');
        } else {
            try {
                const isMatch = await bcryptjs.compare(password, user.password);
                console.log('   Password match result:', isMatch);

                if (isMatch) {
                    console.log('✅ Password is CORRECT!');
                } else {
                    console.log('❌ Password does NOT match!');

                    // Try to fix it
                    console.log('\n🔧 Setting password again...');
                    const salt = await bcryptjs.genSalt(10);
                    const hashedPassword = await bcryptjs.hash(password, salt);
                    user.password = hashedPassword;
                    await user.save();
                    console.log('✅ Password re-saved');

                    // Test again
                    const isMatchNow = await bcryptjs.compare(password, user.password);
                    console.log('   New test result:', isMatchNow);
                }
            } catch (err) {
                console.log('❌ Error comparing password:', err.message);
            }
        }

        console.log('\n═══════════════════════════════════════');
        console.log('Login with:');
        console.log('Email:', email);
        console.log('Password:', password);
        console.log('═══════════════════════════════════════\n');

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
};

debugLogin();
