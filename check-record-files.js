import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { MedicalRecord } from './src/models/MedicalRecord.js';

dotenv.config();

const checkRecordFiles = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
        console.log('✓ Connected to MongoDB\n');

        const records = await MedicalRecord.find({})
            .sort({ createdAt: -1 })
            .limit(5);

        console.log(`Found ${records.length} recent records:\n`);
        console.log('='.repeat(80));

        records.forEach((record, i) => {
            console.log(`\n📄 Record ${i + 1}:`);
            console.log(`   ID: ${record._id}`);
            console.log(`   Title: ${record.title}`);
            console.log(`   Files Array: ${record.files ? 'EXISTS' : 'NULL'}`);
            console.log(`   Number of Files: ${record.files?.length || 0}`);

            if (record.files && record.files.length > 0) {
                console.log(`   Files:`);
                record.files.forEach((file, j) => {
                    console.log(`      ${j + 1}. ${file.filename || 'NO FILENAME'}`);
                    console.log(`         Key: ${file.key || 'NO KEY'}`);
                    console.log(`         Size: ${file.size || 'NO SIZE'} bytes`);
                    console.log(`         Type: ${file.contentType || 'NO TYPE'}`);
                });
            } else {
                console.log(`   ⚠️  NO FILES ATTACHED`);
            }
        });

        console.log('\n' + '='.repeat(80));

        const recordsWithFiles = records.filter(r => r.files && r.files.length > 0);
        console.log(`\nSummary: ${recordsWithFiles.length}/${records.length} records have files attached`);

        if (recordsWithFiles.length === 0) {
            console.log('\n⚠️  ISSUE: No records have files attached!');
            console.log('   Files may not have been saved to database during creation.\n');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

checkRecordFiles();
