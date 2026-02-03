import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { MedicalRecord } from '../src/models/MedicalRecord.js';

dotenv.config();

async function deleteRecord() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✓ Connected to MongoDB');

        const recordId = '6981829b06047fb2d624046d';

        const record = await MedicalRecord.findById(recordId);

        if (!record) {
            console.log('❌ Record not found');
            process.exit(1);
        }

        console.log('\n📄 Record found:');
        console.log(`   Title: ${record.title}`);
        console.log(`   Patient: ${record.patient.email}`);
        console.log(`   Created: ${record.createdAt}`);
        console.log(`   Files: ${record.files.length}`);

        await MedicalRecord.deleteOne({ _id: recordId });

        console.log('\n✅ Record deleted successfully!');

        await mongoose.connection.close();

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

deleteRecord();
