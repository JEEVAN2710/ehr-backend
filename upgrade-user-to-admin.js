import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './src/models/User.js';

dotenv.config();

const upgradeToAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB\n');

        // Change this email to the user you want to upgrade
        const email = 'jeevanpatil025@gmail.com';

        const user = await User.findOne({ email });

        if (!user) {
            console.log(`❌ User not found: ${email}`);
            console.log('\nMake sure the user is registered first.');
            await mongoose.disconnect();
            return;
        }

        console.log(`Found user: ${user.firstName} ${user.lastName}`);
        console.log(`Current role: ${user.role}`);

        // Upgrade to admin
        user.role = 'admin';
        user.isActive = true;
        user.isVerified = true;
        await user.save();

        console.log('\n✅ User upgraded to admin successfully!\n');
        console.log('═══════════════════════════════════════');
        console.log(`  ${user.firstName} ${user.lastName} is now an ADMIN`);
        console.log('═══════════════════════════════════════');
        console.log(`Email: ${user.email}`);
        console.log(`Role: ${user.role}`);
        console.log('═══════════════════════════════════════\n');

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

upgradeToAdmin();
