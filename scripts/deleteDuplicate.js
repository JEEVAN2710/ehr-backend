import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { MedicalRecord } from '../src/models/MedicalRecord.js';

dotenv.config();

async function deleteDuplicateRecord() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✓ Connected to MongoDB');

        // Find all records with this file for this patient
        const records = await MedicalRecord.find({
            'patient.email': 'gamingjeevan2710@gmail.com',
            'files.filename': 'Rabila Srivastava Medical Records.pdf'
        }).sort({ createdAt: -1 });

        console.log(`\nFound ${records.length} records with this file:\n`);

        records.forEach((record, index) => {
            console.log(`${index + 1}. Record ID: ${record._id}`);
            console.log(`   Title: ${record.title}`);
            console.log(`   Created: ${record.createdAt}`);
            console.log(`   Files: ${record.files.length}\n`);
        });

        if (records.length > 1) {
            // Delete the most recent duplicate (first in sorted array)
            const duplicateToDelete = records[0];
            console.log(`\n🗑️  Deleting most recent duplicate: ${duplicateToDelete._id}`);

            await MedicalRecord.deleteOne({ _id: duplicateToDelete._id });

            console.log('✅ Duplicate record deleted successfully!');
            console.log(`\nRemaining record: ${records[1]._id}`);
        } else {
            console.log('ℹ️  No duplicates found (only 1 record exists)');
        }

        await mongoose.connection.close();
        console.log('\n✓ MongoDB connection closed');

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

deleteDuplicateRecord();
