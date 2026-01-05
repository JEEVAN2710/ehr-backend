import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import User from './src/models/User.js';

dotenv.config();

const addAdminUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: 'admin@ehr.com' });

        if (existingAdmin) {
            console.log('\n⚠️  Admin user already exists!');
            console.log('Email: admin@ehr.com');
            console.log('\nUpdating password to "admin"...');

            const salt = await bcryptjs.genSalt(10);
            const adminPassword = await bcryptjs.hash('admin', salt);

            existingAdmin.password = adminPassword;
            existingAdmin.isActive = true;
            existingAdmin.isVerified = true;
            existingAdmin.role = 'admin';
            await existingAdmin.save();

            console.log('\n✓ Admin password updated successfully!');
            console.log('\nAdmin Login:');
            console.log('  Email: admin@ehr.com');
            console.log('  Password: admin\n');
        } else {
            console.log('\nCreating new admin user...');

            const salt = await bcryptjs.genSalt(10);
            const adminPassword = await bcryptjs.hash('admin', salt);

            const adminUser = new User({
                firstName: 'Admin',
                lastName: 'User',
                email: 'admin@ehr.com',
                password: adminPassword,
                role: 'admin',
                phoneNumber: '9999999999',
                isActive: true,
                isVerified: true,
            });

            await adminUser.save();

            console.log('\n✓ Admin user created successfully!');
            console.log('\nAdmin Login:');
            console.log('  Email: admin@ehr.com');
            console.log('  Password: admin\n');
        }

        await mongoose.disconnect();
        console.log('✓ All existing users preserved!');
    } catch (error) {
        console.error('Error adding admin user:', error);
        process.exit(1);
    }
};

addAdminUser();
