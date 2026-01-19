import { validationResult } from 'express-validator';
import { AccessRequest } from '../models/AccessRequest.js';
import { User } from '../models/User.js';
import { MedicalRecord } from '../models/MedicalRecord.js';
import { validatePagination } from '../utils/validators.js';

/**
 * Create access request (Doctor requests access to patient's records)
 */
export const requestAccess = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array(),
            });
        }

        const { patientId, message = '' } = req.body;
        const requesterId = req.user._id;

        // Verify patient exists and has patient role
        const patient = await User.findById(patientId);
        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient not found',
            });
        }

        if (patient.role !== 'patient') {
            return res.status(400).json({
                success: false,
                message: 'Can only request access to patient accounts',
            });
        }

        // Cannot request access to yourself
        if (requesterId.toString() === patientId) {
            return res.status(400).json({
                success: false,
                message: 'Cannot request access to your own records',
            });
        }

        // Check if there's already a pending request
        const existingRequest = await AccessRequest.findOne({
            requesterId,
            patientId,
            status: 'pending',
        });

        if (existingRequest) {
            return res.status(409).json({
                success: false,
                message: 'You already have a pending request for this patient',
                data: { existingRequest },
            });
        }

        // Create new access request
        const accessRequest = new AccessRequest({
            requesterId,
            patientId,
            message,
        });

        await accessRequest.save();
        await accessRequest.populate('requesterId', 'firstName lastName email role specialization');
        await accessRequest.populate('patientId', 'firstName lastName email');

        return res.status(201).json({
            success: true,
            message: 'Access request sent successfully',
            data: { accessRequest },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to create access request',
            error: error.message,
        });
    }
};

/**
 * Get pending requests for logged-in patient
 */
export const getPendingRequests = async (req, res) => {
    try {
        const { skip: rawSkip = 0, limit: rawLimit = 10 } = req.query;
        const { skip, limit } = validatePagination(rawSkip, rawLimit);

        const patientId = req.user._id;

        const requests = await AccessRequest.find({
            patientId,
            status: 'pending',
            expiresAt: { $gt: new Date() }, // Not expired
        })
            .populate('requesterId', 'firstName lastName email role specialization')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await AccessRequest.countDocuments({
            patientId,
            status: 'pending',
            expiresAt: { $gt: new Date() },
        });

        return res.status(200).json({
            success: true,
            message: 'Pending requests retrieved successfully',
            data: {
                requests,
                pagination: {
                    total,
                    skip,
                    limit,
                    hasMore: skip + limit < total,
                },
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve pending requests',
            error: error.message,
        });
    }
};

/**
 * Respond to access request (Patient approves or denies)
 */
export const respondToRequest = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array(),
            });
        }

        const { requestId } = req.params;
        const { action } = req.body; // 'approve' or 'deny'
        const patientId = req.user._id;

        // Find the request
        const accessRequest = await AccessRequest.findById(requestId);

        if (!accessRequest) {
            return res.status(404).json({
                success: false,
                message: 'Access request not found',
            });
        }

        // Verify the logged-in user is the patient
        if (accessRequest.patientId.toString() !== patientId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only respond to your own access requests',
            });
        }

        // Check if already responded
        if (accessRequest.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: `This request has already been ${accessRequest.status}`,
            });
        }

        // Check if expired
        if (accessRequest.expiresAt < new Date()) {
            return res.status(400).json({
                success: false,
                message: 'This request has expired',
            });
        }

        // Update request status
        accessRequest.status = action === 'approve' ? 'approved' : 'denied';
        accessRequest.respondedAt = new Date();
        await accessRequest.save();

        // If approved, grant access to all patient's records
        if (action === 'approve') {
            const requesterId = accessRequest.requesterId;

            // Add requester to sharedWith array for all patient's records
            await MedicalRecord.updateMany(
                {
                    patientId,
                    sharedWith: { $ne: requesterId } // Not already shared
                },
                {
                    $addToSet: { sharedWith: requesterId },
                    $set: { isShared: true }
                }
            );

            // Also handle future records - we could add a patient-level sharing preference
            // For now, the sharing will be handled at record creation time
        }

        await accessRequest.populate('requesterId', 'firstName lastName email role specialization');

        return res.status(200).json({
            success: true,
            message: `Access request ${action === 'approve' ? 'approved' : 'denied'} successfully`,
            data: { accessRequest },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to respond to access request',
            error: error.message,
        });
    }
};

/**
 * Revoke access (Patient revokes granted access)
 */
export const revokeAccess = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array(),
            });
        }

        const { requestId } = req.params;
        const { timing = 'immediate' } = req.body; // immediate, 4h, 8h
        const patientId = req.user._id;

        // Find the request
        const accessRequest = await AccessRequest.findById(requestId);

        if (!accessRequest) {
            return res.status(404).json({
                success: false,
                message: 'Access request not found',
            });
        }

        // Verify the logged-in user is the patient
        if (accessRequest.patientId.toString() !== patientId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only revoke your own granted access',
            });
        }

        // Check if already revoked
        if (accessRequest.status === 'revoked') {
            return res.status(400).json({
                success: false,
                message: 'This access has already been revoked',
            });
        }

        // Check if it was approved (can only revoke approved access)
        if (accessRequest.status !== 'approved') {
            return res.status(400).json({
                success: false,
                message: 'Can only revoke approved access',
            });
        }

        let revokeAt;
        if (timing === 'immediate') {
            revokeAt = new Date();
        } else if (timing === '4h') {
            revokeAt = new Date(Date.now() + 4 * 60 * 60 * 1000);
        } else if (timing === '8h') {
            revokeAt = new Date(Date.now() + 8 * 60 * 60 * 1000);
        } else {
            revokeAt = new Date();
        }

        // Update request status
        accessRequest.status = 'revoked';
        accessRequest.revokedAt = revokeAt;
        await accessRequest.save();

        // If immediate, remove from sharedWith arrays
        if (timing === 'immediate') {
            const requesterId = accessRequest.requesterId;
            await MedicalRecord.updateMany(
                {
                    patientId,
                    sharedWith: requesterId
                },
                {
                    $pull: { sharedWith: requesterId }
                }
            );

            // Update isShared flag if no longer shared with anyone
            await MedicalRecord.updateMany(
                {
                    patientId,
                    sharedWith: { $size: 0 }
                },
                {
                    $set: { isShared: false }
                }
            );
        }

        await accessRequest.populate('requesterId', 'firstName lastName email role');

        return res.status(200).json({
            success: true,
            message: timing === 'immediate'
                ? 'Access revoked immediately'
                : `Access will be revoked at ${revokeAt.toLocaleString()}`,
            data: {
                accessRequest,
                revokeAt
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to revoke access',
            error: error.message,
        });
    }
};

/**
 * Get granted access (Patient views who they gave access to)
 */
export const getGrantedAccess = async (req, res) => {
    try {
        const { skip: rawSkip = 0, limit: rawLimit = 10, status } = req.query;
        const { skip, limit } = validatePagination(rawSkip, rawLimit);

        const patientId = req.user._id;

        // Build filter - get requests where this patient responded
        const filter = { patientId };
        if (status && ['approved', 'denied'].includes(status)) {
            filter.status = status;
        } else {
            // Default to approved only
            filter.status = 'approved';
        }

        const requests = await AccessRequest.find(filter)
            .populate('requesterId', 'firstName lastName email role specialization')
            .sort({ respondedAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await AccessRequest.countDocuments(filter);

        return res.status(200).json({
            success: true,
            message: 'Granted access retrieved successfully',
            data: {
                requests,
                pagination: {
                    total,
                    skip,
                    limit,
                    hasMore: skip + limit < total,
                },
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve granted access',
            error: error.message,
        });
    }
};

/**
 * Cancel access request (Doctor cancels their pending request)
 */
export const cancelRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const requesterId = req.user._id;

        // Find the request
        const accessRequest = await AccessRequest.findById(requestId);

        if (!accessRequest) {
            return res.status(404).json({
                success: false,
                message: 'Access request not found',
            });
        }

        // Verify the logged-in user is the requester
        if (accessRequest.requesterId.toString() !== requesterId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only cancel your own requests',
            });
        }

        // Check if already responded
        if (accessRequest.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: `Cannot cancel a request that has been ${accessRequest.status}`,
            });
        }

        // Delete the request
        await AccessRequest.findByIdAndDelete(requestId);

        return res.status(200).json({
            success: true,
            message: 'Access request cancelled successfully',
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to cancel access request',
            error: error.message,
        });
    }
};

/**
 * Get my sent requests (Doctor views their requests)
 */
export const getMyRequests = async (req, res) => {
    try {
        const { skip: rawSkip = 0, limit: rawLimit = 10, status } = req.query;
        const { skip, limit } = validatePagination(rawSkip, rawLimit);

        const requesterId = req.user._id;

        // Build filter
        const filter = { requesterId };
        if (status && ['pending', 'approved', 'denied'].includes(status)) {
            filter.status = status;
        }

        const requests = await AccessRequest.find(filter)
            .populate('patientId', 'firstName lastName email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await AccessRequest.countDocuments(filter);

        return res.status(200).json({
            success: true,
            message: 'Your requests retrieved successfully',
            data: {
                requests,
                pagination: {
                    total,
                    skip,
                    limit,
                    hasMore: skip + limit < total,
                },
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve your requests',
            error: error.message,
        });
    }
};

export default {
    requestAccess,
    getPendingRequests,
    respondToRequest,
    revokeAccess,
    getGrantedAccess,
    getMyRequests,
    cancelRequest,
};
