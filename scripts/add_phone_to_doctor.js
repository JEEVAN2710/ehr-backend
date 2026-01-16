import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './src/models/User.js';

dotenv.config();

async function addPhoneToDoctor() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected successfully\n');

        // Find doctor account
        const doctor = await User.findOne({ email: 'doctor@test.com' });

        if (!doctor) {
            console.log('❌ Doctor account not found with email: doctor@test.com');
            process.exit(1);
        }

        console.log('📋 Doctor account found:');
        console.log(`   Name: ${doctor.firstName} ${doctor.lastName}`);
        console.log(`   Email: ${doctor.email}`);
        console.log(`   Current Phone: ${doctor.phoneNumber || 'Not set'}\n`);

        // Update phone number
        const phoneNumber = '+1234567890'; // Test phone number
        doctor.phoneNumber = phoneNumber;
        await doctor.save();

        console.log(`✅ Phone number updated to: ${phoneNumber}\n`);
        console.log('🎉 You can now login using:');
        console.log(`   Phone: ${phoneNumber}`);
        console.log(`   Password: (your doctor account password)\n`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

addPhoneToDoctor();
