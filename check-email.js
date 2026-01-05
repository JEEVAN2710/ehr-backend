import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './src/models/User.js';

dotenv.config();

const checkEmail = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB\n');

        const adminEmail1 = 'jeevanpatil.025@gmail.com'; // With dot
        const adminEmail2 = 'jeevanpatil025@gmail.com';  // Without dot (normalized)

        console.log('Searching for:', adminEmail1);
        const user1 = await User.findOne({ email: adminEmail1 });
        console.log('Found:', user1 ? user1.email : 'NOT FOUND');

        console.log('\nSearching for:', adminEmail2);
        const user2 = await User.findOne({ email: adminEmail2 });
        console.log('Found:', user2 ? user2.email : 'NOT FOUND');

        console.log('\n--- All admin users ---');
        const admins = await User.find({ role: 'admin' });
        admins.forEach(admin => {
            console.log('Email in DB:', admin.email);
        });

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error.message);
    }
};

checkEmail();
