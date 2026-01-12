import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const UserSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('UserDirect', UserSchema, 'users');

const fixPassword = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
        console.log('✓ Connected to MongoDB\n');

        const email = 'jeevanpatil.025@gmail.com';
        const plainPassword = 'Secure@123';  // Your original password

        // Hash the password ONCE
        const hashedPassword = await bcrypt.hash(plainPassword, 10);

        // Update directly without triggering pre-save hooks
        const result = await User.updateOne(
            { email },
            {
                $set: {
                    password: hashedPassword,
                    isActive: true,
                    isVerified: true
                }
            }
        );

        if (result.matchedCount === 0) {
            console.log('❌ User not found:', email);
            process.exit(1);
        }

        console.log('='.repeat(70));
        console.log('✅ PASSWORD RESET SUCCESSFUL');
        console.log('='.repeat(70));
        console.log(`\n📧 Email: ${email}`);
        console.log(`🔑 Password: ${plainPassword}`);
        console.log(`✅ Active & Verified`);
        console.log('\n💡 Login with these credentials now!');
        console.log('='.repeat(70) + '\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

fixPassword();
