import mongoose from 'mongoose';

const shareTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    type: {
        type: String,
        enum: ['all', 'single'],
        default: 'all',
    },
    recordIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MedicalRecord',
    }],
    expiresAt: {
        type: Date,
        required: true,
        index: true,
    },
    accessCount: {
        type: Number,
        default: 0,
    },
    lastAccessedAt: {
        type: Date,
    },
    accessedBy: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        accessedAt: {
            type: Date,
            default: Date.now,
        },
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// TTL index to automatically delete expired tokens
shareTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Method to check if token is valid
shareTokenSchema.methods.isValid = function () {
    return this.expiresAt > new Date();
};

// Method to increment access count
shareTokenSchema.methods.recordAccess = async function () {
    this.accessCount += 1;
    this.lastAccessedAt = new Date();
    await this.save();
};

export const ShareToken = mongoose.model('ShareToken', shareTokenSchema);

export default ShareToken;
