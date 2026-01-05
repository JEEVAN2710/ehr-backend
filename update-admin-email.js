import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './src/models/User.js';

dotenv.config();

const updateAdminEmail = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB\n');

        const oldEmail = 'jeevanpatil.025@gmail.com'; // With dot
        const newEmail = 'jeevanpatil025@gmail.com';  // Without dot (normalized)

        // Delete the old version with the dot
        const deletedUser = await User.findOneAndDelete({ email: oldEmail });
        if (deletedUser) {
            console.log('✓ Deleted old admin user with email:', oldEmail);
        }

        // Check if normalized version already exists
        let user = await User.findOne({ email: newEmail }).select('+password');

        if (!user) {
            console.log('✗ Normalized version not found, creating new one\n');

            // Create with normalized email
            user = new User({
                firstName: 'Jeevan',
                lastName: 'Patil',
                email: newEmail,
                password: 'Admin@2026',
                role: 'admin',
                phoneNumber: '0000000000',
                isActive: true,
                isVerified: true,
            });

            await user.save();
            console.log('✓ Created admin with normalized email:', newEmail);
        } else {
            console.log('✓ Normalized version already exists:', newEmail);
            console.log('  isActive:', user.isActive);
            console.log('  isVerified:', user.isVerified);
            console.log('  role:', user.role);
        }

        console.log('\n══════════════════════════════════════════');
        console.log('  ✅ ADMIN EMAIL UPDATED');
        console.log('══════════════════════════════════════════');
        console.log('\nLogin Credentials (use these):');
        console.log('Email:', newEmail);
        console.log('Password: Admin@2026');
        console.log('══════════════════════════════════════════\n');

        await mongoose.disconnect();
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        process.exit(1);
    }
};

updateAdminEmail();
