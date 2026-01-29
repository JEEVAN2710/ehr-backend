import { getRecordAudits, verifyIntegrity, getAuditCount } from '../services/blockchainService.js';
import { MedicalRecord } from '../models/MedicalRecord.js';

/**
 * Get blockchain audit trail for a specific record
 */
export const getBlockchainAudit = async (req, res) => {
    try {
        const { recordId } = req.params;
        const userId = req.user._id;
        const userRole = req.user.role;

        // Check if record exists and user has access
        const record = await MedicalRecord.findById(recordId);
        if (!record) {
            return res.status(404).json({
                success: false,
                message: 'Medical record not found'
            });
        }

        // Check permissions
        const hasAccess =
            record.patientId.toString() === userId.toString() ||
            record.createdBy.toString() === userId.toString() ||
            record.sharedWith.some(id => id.toString() === userId.toString()) ||
            userRole === 'admin';

        if (!hasAccess) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to view this audit trail'
            });
        }

        // Get blockchain audit trail
        const result = await getRecordAudits(recordId);

        if (!result.success) {
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch blockchain audit trail',
                error: result.error
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Blockchain audit trail retrieved successfully',
            data: {
                recordId,
                audits: result.audits,
                totalAudits: result.audits.length
            }
        });
    } catch (error) {
        console.error('Error fetching blockchain audit:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch blockchain audit trail',
            error: error.message
        });
    }
};

/**
 * Verify record integrity against blockchain
 */
export const verifyRecordIntegrity = async (req, res) => {
    try {
        const { recordId } = req.params;
        const userId = req.user._id;
        const userRole = req.user.role;

        // Check if record exists and user has access
        const record = await MedicalRecord.findById(recordId);
        if (!record) {
            return res.status(404).json({
                success: false,
                message: 'Medical record not found'
            });
        }

        // Check permissions
        const hasAccess =
            record.patientId.toString() === userId.toString() ||
            record.createdBy.toString() === userId.toString() ||
            record.sharedWith.some(id => id.toString() === userId.toString()) ||
            userRole === 'admin';

        if (!hasAccess) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to verify this record'
            });
        }

        // Prepare current record data for verification
        const currentData = {
            title: record.title,
            description: record.description,
            recordType: record.recordType,
            patientId: record.patientId.toString()
        };

        // Verify against blockchain
        const result = await verifyIntegrity(recordId, currentData);

        if (!result.success) {
            return res.status(500).json({
                success: false,
                message: 'Failed to verify record integrity',
                error: result.error
            });
        }

        return res.status(200).json({
            success: true,
            message: result.isValid ? 'Record integrity verified' : 'Record integrity mismatch',
            data: {
                recordId,
                isValid: result.isValid,
                currentHash: result.currentHash,
                storedHash: result.storedHash,
                matches: result.matches
            }
        });
    } catch (error) {
        console.error('Error verifying record integrity:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to verify record integrity',
            error: error.message
        });
    }
};

/**
 * Get overall blockchain statistics
 */
export const getBlockchainStats = async (req, res) => {
    try {
        const result = await getAuditCount();

        if (!result.success) {
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch blockchain statistics',
                error: result.error
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Blockchain statistics retrieved successfully',
            data: {
                totalAudits: result.count,
                blockchainEnabled: process.env.BLOCKCHAIN_ENABLED === 'true',
                network: process.env.POLYGON_MUMBAI_RPC?.includes('localhost') ? 'Local Hardhat' : 'Polygon Mumbai',
                contractAddress: process.env.BLOCKCHAIN_CONTRACT_ADDRESS
            }
        });
    } catch (error) {
        console.error('Error fetching blockchain stats:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch blockchain statistics',
            error: error.message
        });
    }
};

export default {
    getBlockchainAudit,
    verifyRecordIntegrity,
    getBlockchainStats
};
