import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './src/models/User.js';

dotenv.config();

const restoreOriginalEmail = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB\n');

        const originalEmail = 'jeevanpatil.025@gmail.com'; // With dot (original)
        const normalizedEmail = 'jeevanpatil025@gmail.com';  // Without dot

        // Delete the normalized version
        const deletedNormalized = await User.findOneAndDelete({ email: normalizedEmail });
        if (deletedNormalized) {
            console.log('✓ Deleted normalized version:', normalizedEmail);
        }

        // Check if original version exists
        let user = await User.findOne({ email: originalEmail }).select('+password');

        if (!user) {
            console.log('✓ Creating admin with original email\n');

            user = new User({
                firstName: 'Jeevan',
                lastName: 'Patil',
                email: originalEmail,
                password: 'Admin@2026',
                role: 'admin',
                phoneNumber: '0000000000',
                isActive: true,
                isVerified: true,
            });

            await user.save();
            console.log('✓ Created admin with email:', originalEmail);
        } else {
            console.log('✓ Original version already exists:', originalEmail);
        }

        console.log('\n══════════════════════════════════════════');
        console.log('  ✅ ADMIN RESTORED WITH ORIGINAL EMAIL');
        console.log('══════════════════════════════════════════');
        console.log('\nLogin Credentials:');
        console.log('Email:', originalEmail);
        console.log('Password: Admin@2026');
        console.log('══════════════════════════════════════════\n');

        await mongoose.disconnect();
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        process.exit(1);
    }
};

restoreOriginalEmail();
