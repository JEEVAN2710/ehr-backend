import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import User from './src/models/User.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    await User.deleteMany({});
    console.log('Cleared existing users');

    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash('password123', salt);
    const adminPassword = await bcryptjs.hash('admin', salt); // Simple admin password

    const demoUsers = [
      {
        firstName: 'John',
        lastName: 'Patient',
        email: 'patient@ehr.com',
        password: hashedPassword,
        role: 'patient',
        phoneNumber: '9876543210',
        dateOfBirth: new Date('1990-01-15'),
        isActive: true, // Bypass OTP verification for demo
      },
      {
        firstName: 'Dr. Sarah',
        lastName: 'Doctor',
        email: 'doctor@ehr.com',
        password: hashedPassword,
        role: 'doctor',
        specialization: 'General Medicine',
        licenseNumber: 'DOC123456',
        phoneNumber: '9876543211',
        isActive: true, // Bypass OTP verification for demo
      },
      {
        firstName: 'Alex',
        lastName: 'Lab',
        email: 'lab@ehr.com',
        password: hashedPassword,
        role: 'labassistant',
        phoneNumber: '9876543212',
        isActive: true, // Bypass OTP verification for demo
      },
      {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@ehr.com',
        password: adminPassword, // Using simple 'admin' password
        role: 'admin',
        phoneNumber: '9876543213',
        isActive: true,
        isVerified: true, // Admin is pre-verified
      },
    ];

    const createdUsers = await User.insertMany(demoUsers);
    console.log('\n✓ Demo users created successfully!\n');

    createdUsers.forEach((user) => {
      console.log(`${user.role.toUpperCase()}:`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Password: ${user.role === 'admin' ? 'admin' : 'password123'}\n`);
    });

    await mongoose.disconnect();
    console.log('Database seeding completed!');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
