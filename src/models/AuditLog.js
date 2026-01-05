import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
    action: {
        type: String,
        enum: ['file_upload', 'file_download', 'file_delete', 'record_create', 'record_view', 'record_update', 'record_delete', 'record_share', 'record_unshare', 'login', 'logout', 'password_change', 'access_request', 'access_grant', 'access_deny'],
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    userRole: {
        type: String,
        enum: ['patient', 'doctor', 'labassistant', 'admin'],
        required: true,
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'targetModel',
    },
    targetModel: {
        type: String,
        enum: ['User', 'MedicalRecord'],
    },
    fileKey: {
        type: String,
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
    },
    ipAddress: {
        type: String,
    },
    userAgent: {
        type: String,
    },
    status: {
        type: String,
        enum: ['success', 'failure', 'unauthorized'],
        default: 'success',
    },
    errorMessage: {
        type: String,
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true,
    },
});

// Indexes for efficient querying
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ targetId: 1, timestamp: -1 });

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;
