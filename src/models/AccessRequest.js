import mongoose from 'mongoose';

const accessRequestSchema = new mongoose.Schema({
    requesterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Requester ID is required'],
        index: true,
    },
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Patient ID is required'],
        index: true,
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'denied'],
        default: 'pending',
        index: true,
    },
    message: {
        type: String,
        maxlength: 500,
        default: '',
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true,
    },
    respondedAt: {
        type: Date,
        default: null,
    },
    expiresAt: {
        type: Date,
        default: function () {
            return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
        },
        index: true,
    },
});

// Compound indexes for efficient queries
accessRequestSchema.index({ patientId: 1, status: 1 });
accessRequestSchema.index({ requesterId: 1, status: 1 });
accessRequestSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

// Prevent duplicate pending requests
accessRequestSchema.index(
    { requesterId: 1, patientId: 1, status: 1 },
    {
        unique: true,
        partialFilterExpression: { status: 'pending' }
    }
);

export const AccessRequest = mongoose.model('AccessRequest', accessRequestSchema);

export default AccessRequest;
