import mongoose from 'mongoose';
import { User } from '../src/models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const recreateAdmin = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✓ Connected to MongoDB');

        // Delete existing admin if exists
        const deleted = await User.deleteOne({ email: 'jeevanpatil.025@gmail.com' });
        if (deleted.deletedCount > 0) {
            console.log('⚠️  Existing admin user deleted');
        }

        // Create fresh admin user
        const adminUser = new User({
            firstName: 'Admin',
            lastName: 'User',
            email: 'jeevanpatil.025@gmail.com',
            password: 'Secure@123', // Will be hashed by pre-save hook
            role: 'admin',
            isVerified: true,
            isActive: true,
            phoneNumber: '+1234567890',
        });

        await adminUser.save();
        console.log('\n✓ Admin user created successfully!');

        // Verify the user was created correctly
        const verifyUser = await User.findOne({ email: 'jeevanpatil.025@gmail.com' });
        console.log('\nVerification:');
        console.log('📧 Email:', verifyUser.email);
        console.log('🔑 Password (hashed):', verifyUser.password.substring(0, 20) + '...');
        console.log('👤 Role:', verifyUser.role);
        console.log('✅ IsVerified:', verifyUser.isVerified);
        console.log('✅ IsActive:', verifyUser.isActive);

        // Test password matching
        const isMatch = await verifyUser.matchPassword('Secure@123');
        console.log('\n🔐 Password match test:', isMatch ? '✓ SUCCESS' : '✗ FAILED');

        if (isMatch) {
            console.log('\n🎉 Admin account is ready!');
            console.log('You can now login with:');
            console.log('  Email: jeevanpatil.025@gmail.com');
            console.log('  Password: Secure@123');
        } else {
            console.log('\n❌ WARNING: Password verification failed!');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('\n✓ Disconnected from MongoDB');
        process.exit();
    }
};

recreateAdmin();
