import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
  },
  code: {
    type: String,
    required: [true, 'OTP code is required'],
    length: 6,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 5 * 60 * 1000), // 5 minutes from now
  },
  verified: {
    type: Boolean,
    default: false,
  },
  attempts: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// TTL index - MongoDB will automatically delete documents after they expire
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Index for faster lookups
otpSchema.index({ email: 1, verified: 1 });

export const OTP = mongoose.model('OTP', otpSchema);

export default OTP;
