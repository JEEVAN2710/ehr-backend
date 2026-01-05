import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import User from './src/models/User.js';

dotenv.config();

const setAdminPassword = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB\n');

        const email = 'jeevanpatil.025@gmail.com';
        const password = 'Admin@2026';

        // Find user WITH password field (select: false means we need to explicitly include it)
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            console.log('❌ User not found!');
            await mongoose.disconnect();
            return;
        }

        console.log('✅ Found user:', user.email);
        console.log('   Current password exists:', !!user.password);

        // Manually hash password (to avoid pre-save hook double-hashing)
        console.log('\n🔐 Setting password (pre-hashed to avoid double hashing)...');
        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(password, salt);

        // Use updateOne to bypass the pre-save hook
        await User.updateOne(
            { email },
            {
                $set: {
                    password: hashedPassword,
                    isActive: true,
                    isVerified: true
                }
            }
        );

        console.log('✅ Password updated successfully!');

        // Verify it worked
        const updatedUser = await User.findOne({ email }).select('+password');
        const isMatch = await bcryptjs.compare(password, updatedUser.password);

        console.log('\n✅ Verification:');
        console.log('   Password exists in DB:', !!updatedUser.password);
        console.log('   Password matches:', isMatch);

        if (isMatch) {
            console.log('\n═══════════════════════════════════════');
            console.log('  ✅ SUCCESS! You can now login with:');
            console.log('═══════════════════════════════════════');
            console.log('Email:', email);
            console.log('Password:', password);
            console.log('═══════════════════════════════════════\n');
        } else {
            console.log('\n❌ Password still not matching. There may be another issue.');
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

setAdminPassword();
