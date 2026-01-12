import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from './src/models/User.js';

dotenv.config();

const createTestAccounts = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✓ Connected to MongoDB');

        // Delete existing test accounts if they exist
        await User.deleteMany({
            email: { $in: ['gamingjeevan2710@gmail.com', 'patiljeevan2710@gmail.com'] }
        });
        console.log('✓ Cleared existing test accounts');

        // Create patient account
        const patientPassword = await bcrypt.hash('patient123', 10);
        const patient = new User({
            firstName: 'Jeevan',
            lastName: 'Patient',
            email: 'gamingjeevan2710@gmail.com',
            password: patientPassword,
            role: 'patient',
            isVerified: true, // Skip email verification for testing
            isActive: true,
            phoneNumber: '+919876543210',
            dateOfBirth: new Date('1995-01-01'),
        });
        await patient.save();
        console.log('✓ Created patient account: gamingjeevan2710@gmail.com');

        // Create doctor account  
        const doctorPassword = await bcrypt.hash('doctor123', 10);
        const doctor = new User({
            firstName: 'Dr. Jeevan',
            lastName: 'Patil',
            email: 'patiljeevan2710@gmail.com',
            password: doctorPassword,
            role: 'doctor',
            isVerified: true, // Skip email verification for testing
            isActive: true,
            phoneNumber: '+919876543211',
            dateOfBirth: new Date('1990-01-01'),
        });
        await doctor.save();
        console.log('✓ Created doctor account: patiljeevan2710@gmail.com');

        console.log('\n' + '='.repeat(60));
        console.log('✅ TEST ACCOUNTS CREATED SUCCESSFULLY');
        console.log('='.repeat(60));
        console.log('\n📧 Patient Account:');
        console.log('   Email: gamingjeevan2710@gmail.com');
        console.log('   Password: patient123');
        console.log('\n👨‍⚕️ Doctor Account:');
        console.log('   Email: patiljeevan2710@gmail.com');
        console.log('   Password: doctor123');
        console.log('\n💡 Both accounts are verified and ready to use!');
        console.log('='.repeat(60) + '\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating test accounts:', error);
        process.exit(1);
    }
};

createTestAccounts();
