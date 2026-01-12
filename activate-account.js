import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './src/models/User.js';

dotenv.config();

const activateAccount = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
        console.log('✓ Connected to MongoDB');

        // Get the email from command line or use default
        const email = process.argv[2] || 'patiljeevan2710@gmail.com';

        // Find and activate the user
        const user = await User.findOne({ email });

        if (!user) {
            console.log(`❌ User not found with email: ${email}`);
            process.exit(1);
        }

        if (user.isActive) {
            console.log(`✓ User ${email} is already active`);
            process.exit(0);
        }

        user.isActive = true;
        await user.save();

        console.log('\n' + '='.repeat(60));
        console.log('✅ ACCOUNT ACTIVATED SUCCESSFULLY');
        console.log('='.repeat(60));
        console.log(`\n📧 Email: ${user.email}`);
        console.log(`👤 Name: ${user.firstName} ${user.lastName}`);
        console.log(`🎭 Role: ${user.role}`);
        console.log(`✓ Status: Active`);
        console.log('\n💡 You can now login with this account!');
        console.log('='.repeat(60) + '\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error activating account:', error);
        process.exit(1);
    }
};

activateAccount();
