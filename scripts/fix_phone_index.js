import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User.js';

dotenv.config();

async function fixPhoneNumberIndex() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        console.log('\n🔧 Fixing phoneNumber index...');

        // Drop the existing phoneNumber index
        try {
            await User.collection.dropIndex('phoneNumber_1');
            console.log('✅ Dropped old phoneNumber index');
        } catch (error) {
            if (error.code === 27) {
                console.log('ℹ️  Index does not exist, skipping drop');
            } else {
                throw error;
            }
        }

        // Remove phoneNumber: null from existing documents
        const result = await User.updateMany(
            { phoneNumber: null },
            { $unset: { phoneNumber: "" } }
        );
        console.log(`✅ Removed null phoneNumbers from ${result.modifiedCount} documents`);

        // Recreate the index properly
        await User.collection.createIndex(
            { phoneNumber: 1 },
            {
                unique: true,
                sparse: true,
                background: true
            }
        );
        console.log('✅ Created new sparse unique index on phoneNumber');

        console.log('\n✅ Phone number index fixed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error fixing index:', error);
        process.exit(1);
    }
}

fixPhoneNumberIndex();
