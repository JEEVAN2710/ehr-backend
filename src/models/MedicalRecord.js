import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
  },
  filename: {
    type: String,
    required: true,
  },
  contentType: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

const medicalRecordSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Patient ID is required'],
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Created by user ID is required'],
  },
  role: {
    type: String,
    enum: ['patient', 'doctor', 'labassistant'],
    required: [true, 'Role is required'],
  },
  title: {
    type: String,
    required: [true, 'Record title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Record description is required'],
  },
  recordType: {
    type: String,
    enum: ['prescription', 'labtest', 'scan', 'report', 'other'],
    default: 'other',
  },
  files: {
    type: [fileSchema],
    default: [],
  },
  isShared: {
    type: Boolean,
    default: false,
  },
  sharedWith: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'User',
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

medicalRecordSchema.index({ patientId: 1, createdAt: -1 });

export const MedicalRecord = mongoose.model('MedicalRecord', medicalRecordSchema);

export default MedicalRecord;
