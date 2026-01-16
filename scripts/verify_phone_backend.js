
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../src/models/User.js';
import { verifyPatientEmail } from '../src/controllers/authController.js';

dotenv.config();

async function run() {
    console.log('🚀 Starting Backend Verification...');

    try {
        // 1. Connect to DB
        if (!process.env.MONGO_URI) throw new Error('MONGO_URI not found in .env');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // 2. Create Test Patient
        const timestamp = Date.now();
        const phone = `+1${timestamp.toString().slice(-10)}`;
        const email = `test_pat_${timestamp}@example.com`;

        console.log(`Creating patient with Phone: ${phone}, Email: ${email}`);

        const patient = new User({
            firstName: 'Test',
            lastName: 'PhoneUser',
            email: email,
            password: 'Password123!', // Direct save bypasses hashing? No, pre-save hook handles it.
            role: 'patient',
            phoneNumber: phone,
            dateOfBirth: new Date('1990-01-01'),
            isVerified: true,
            isActive: true
        });

        await patient.save();
        console.log('✅ User created successfully');

        // 3. Test Verify Patient by Phone
        console.log('Testing verifyPatientEmail with phoneNumber...');

        const mockReq = {
            query: {
                phoneNumber: phone
            }
        };

        const mockRes = {
            status: function (code) {
                this.statusCode = code;
                return this;
            },
            json: function (data) {
                this.data = data;
                return this;
            }
        };

        await verifyPatientEmail(mockReq, mockRes);

        if (mockRes.statusCode === 200 && mockRes.data.success) {
            console.log('✅ SUCCESS: Patient found by phone number!');
            console.log('Returned Data:', mockRes.data.data.user.email);
        } else {
            console.error('❌ FAILURE: Patient not found or error occurred');
            console.error('Status:', mockRes.statusCode);
            console.error('Response:', mockRes.data);
            process.exit(1);
        }

        // Cleanup
        await User.deleteOne({ _id: patient._id });
        console.log('🧹 Cleanup complete');

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

run();
