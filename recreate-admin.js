import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './src/models/User.js';

dotenv.config();

const resetToSimplePassword = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB\n');

        const email = 'jeevanpatil.025@gmail.com';

        // Delete and recreate
        await User.deleteOne({ email });
        console.log('Deleted old user\n');

        // Create with SIMPLE password that meets requirements
        const newAdmin = new User({
            firstName: 'Jeevan',
            lastName: 'Patil',
            email: email,
            password: 'Password@123', // Meets all requirements: 8+ chars, upper, lower, number, special
            role: 'admin',
            phoneNumber: '1234567890',
            isActive: true,
            isVerified: true,
        });

        await newAdmin.save();

        console.log('✅ Admin created successfully!\n');
        console.log('═══════════════════════════════════════');
        console.log('  YOUR NEW ADMIN LOGIN');
        console.log('═══════════════════════════════════════');
        console.log('Email: jeevanpatil.025@gmail.com');
        console.log('Password: Password@123');
        console.log('═══════════════════════════════════════\n');
        console.log('✅ Try logging in now with these credentials!');
        console.log('✅ After login, change your password in Profile settings.\n');

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

resetToSimplePassword();
