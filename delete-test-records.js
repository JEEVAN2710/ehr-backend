import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { MedicalRecord } from './src/models/MedicalRecord.js';
import { User } from './src/models/User.js';

dotenv.config();

const deleteRecords = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
        console.log('✓ Connected to MongoDB\n');

        const patientEmail = 'gamingjeevan2710@gmail.com';
        const patient = await User.findOne({ email: patientEmail });

        if (!patient) {
            console.log('❌ Patient not found');
            process.exit(1);
        }

        const result = await MedicalRecord.deleteMany({ patientId: patient._id });

        console.log('='.repeat(70));
        console.log('✅ RECORDS DELETED');
        console.log('='.repeat(70));
        console.log(`\n📧 Patient: ${patient.firstName} ${patient.lastName}`);
        console.log(`🗑️  Deleted: ${result.deletedCount} record(s)`);
        console.log('\n💡 You can now create fresh test records!');
        console.log('='.repeat(70) + '\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

deleteRecords();
