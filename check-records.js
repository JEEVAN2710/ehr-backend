import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { MedicalRecord } from './src/models/MedicalRecord.js';
import { User } from './src/models/User.js';

dotenv.config();

const checkRecords = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
        console.log('✓ Connected to MongoDB\n');

        const patientEmail = 'gamingjeevan2710@gmail.com';
        const patient = await User.findOne({ email: patientEmail });

        if (!patient) {
            console.log('❌ Patient not found');
            process.exit(1);
        }

        console.log(`📋 Checking records for: ${patient.firstName} ${patient.lastName}`);
        console.log(`📧 Email: ${patientEmail}`);
        console.log(`🆔 Patient ID: ${patient._id}\n`);

        const records = await MedicalRecord.find({ patientId: patient._id })
            .populate('createdBy', 'firstName lastName email role')
            .sort({ createdAt: -1 });

        console.log('='.repeat(70));
        console.log(`Found ${records.length} record(s)\n`);

        if (records.length === 0) {
            console.log('⚠️  No records found for this patient');
            console.log('💡 The record might not have been created successfully\n');
        } else {
            records.forEach((record, index) => {
                console.log(`📄 Record ${index + 1}:`);
                console.log(`   ID: ${record._id}`);
                console.log(`   Title: ${record.title}`);
                console.log(`   Type: ${record.recordType}`);
                console.log(`   Created by: ${record.createdBy?.firstName} ${record.createdBy?.lastName} (${record.createdBy?.role})`);
                console.log(`   Files: ${record.files.length} file(s)`);
                if (record.files.length > 0) {
                    record.files.forEach((file, i) => {
                        console.log(`      ${i + 1}. ${file.filename} (${(file.size / 1024).toFixed(2)} KB)`);
                    });
                }
                console.log(`   Created: ${record.createdAt}`);
                console.log('');
            });
        }

        console.log('='.repeat(70));
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

checkRecords();
