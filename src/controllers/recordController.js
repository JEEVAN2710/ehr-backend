import { validationResult } from 'express-validator';
import { MedicalRecord } from '../models/MedicalRecord.js';
import { logAudit } from '../services/blockchainService.js';
import { User } from '../models/User.js';
import { ShareToken } from '../models/ShareToken.js';
import { validatePagination } from '../utils/validators.js';
import crypto from 'crypto';

export const createRecord = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { patientId, title, description, recordType = 'other' } = req.body;
    const userId = req.user._id;

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
        message: 'Specified user is not a patient',
      });
    }

    const medicalRecord = new MedicalRecord({
      patientId,
      createdBy: userId,
      role: req.user.role,
      title,
      description,
      recordType,
    });

    await medicalRecord.save();
    await medicalRecord.populate('patientId', 'firstName lastName email');
    await medicalRecord.populate('createdBy', 'firstName lastName email role');

    // Log to blockchain (async, non-blocking)
    logAudit(
      medicalRecord._id,
      'CREATE',
      userId,
      {
        title: medicalRecord.title,
        description: medicalRecord.description,
        recordType: medicalRecord.recordType,
        patientId: medicalRecord.patientId._id.toString()
      },
      {
        createdBy: req.user.email,
        role: req.user.role
      }
    ).catch(err => console.error('Blockchain audit error:', err));

    return res.status(201).json({
      success: true,
      message: 'Medical record created successfully',
      data: medicalRecord,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create medical record',
      error: error.message,
    });
  }
};

export const getPatientRecords = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { skip: rawSkip = 0, limit: rawLimit = 10, createdBy } = req.query;

    console.log('[CONTROLLER] getPatientRecords called');
    console.log('[CONTROLLER] patientId param:', patientId);
    console.log('[CONTROLLER] User:', req.user?.email, 'ID:', req.user?._id);

    // Validate pagination
    const { skip, limit } = validatePagination(rawSkip, rawLimit);

    // Build query based on filters
    let query = {};

    // Special route /my-records - get records created by current user
    if (patientId === 'my-records') {
      console.log('[CONTROLLER] MY-RECORDS route detected!');
      query.createdBy = req.user._id;
      console.log('[CONTROLLER] Query:', JSON.stringify(query));
    } else if (createdBy) {
      // If createdBy is specified, filter by creator (for doctor's dashboard)
      query.createdBy = createdBy;
    } else {
      // Otherwise, filter by patient (normal flow)
      const patient = await User.findById(patientId);
      if (!patient) {
        console.log('[CONTROLLER] Patient not found for ID:', patientId);
        return res.status(404).json({
          success: false,
          message: 'Patient not found',
        });
      }

      if (req.user.role === 'patient' && req.user._id.toString() !== patientId) {
        return res.status(403).json({
          success: false,
          message: 'Patients can only view their own records',
        });
      }

      query.patientId = patientId;
    }

    const records = await MedicalRecord.find(query)
      .populate('patientId', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await MedicalRecord.countDocuments(query);

    return res.status(200).json({
      success: true,
      message: 'Records retrieved successfully',
      data: {
        records,
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
      message: 'Failed to retrieve records',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

export const getRecordById = async (req, res) => {
  try {
    const { recordId } = req.params;

    const record = await MedicalRecord.findById(recordId)
      .populate('patientId', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email role');

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found',
      });
    }

    if (req.user.role === 'patient' && req.user._id.toString() !== record.patientId._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Patients can only view their own records',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Record retrieved successfully',
      data: record,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve record',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

export const updateRecord = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { recordId } = req.params;
    const { title, description, recordType } = req.body;

    const record = await MedicalRecord.findById(recordId);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found',
      });
    }

    if (record.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the creator can update this record',
      });
    }

    if (title) record.title = title;
    if (description) record.description = description;
    if (recordType) record.recordType = recordType;

    record.updatedAt = Date.now();

    await record.save();
    await record.populate('patientId', 'firstName lastName email');
    await record.populate('createdBy', 'firstName lastName email role');

    return res.status(200).json({
      success: true,
      message: 'Record updated successfully',
      data: record,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update record',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

export const deleteRecord = async (req, res) => {
  try {
    const { recordId } = req.params;

    const record = await MedicalRecord.findById(recordId);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found',
      });
    }

    if (record.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only the creator or admin can delete this record',
      });
    }

    await MedicalRecord.findByIdAndDelete(recordId);

    return res.status(200).json({
      success: true,
      message: 'Record deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete record',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

export const addFileToRecord = async (req, res) => {
  try {
    const { recordId } = req.params;
    const { fileKey, filename, contentType, size } = req.body;

    if (!fileKey || !filename || !contentType || !size) {
      return res.status(400).json({
        success: false,
        message: 'File details are required (fileKey, filename, contentType, size)',
      });
    }

    const record = await MedicalRecord.findById(recordId);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found',
      });
    }

    if (record.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the creator can add files to this record',
      });
    }

    record.files.push({
      key: fileKey,
      filename,
      contentType,
      size,
    });

    await record.save();
    await record.populate('patientId', 'firstName lastName email');
    await record.populate('createdBy', 'firstName lastName email role');

    return res.status(200).json({
      success: true,
      message: 'File added to record successfully',
      data: record,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to add file to record',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

/**
 * Share record with specific users
 */
export const shareRecord = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { recordId } = req.params;
    const { userIds } = req.body; // Array of user IDs to share with

    const record = await MedicalRecord.findById(recordId);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found',
      });
    }

    // Only patient or creator can share
    if (
      record.patientId.toString() !== req.user._id.toString() &&
      record.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Only the patient or record creator can share this record',
      });
    }

    // Verify all users exist
    for (const userId of userIds) {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: `User with ID ${userId} not found`,
        });
      }
    }

    // Add users to sharedWith array (avoid duplicates)
    const existingShared = record.sharedWith.map(id => id.toString());
    const newShares = userIds.filter(id => !existingShared.includes(id));

    if (newShares.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'All specified users already have access to this record',
      });
    }

    record.sharedWith.push(...newShares);
    record.isShared = true;
    await record.save();

    await record.populate('sharedWith', 'firstName lastName email role');

    return res.status(200).json({
      success: true,
      message: 'Record shared successfully',
      data: {
        recordId: record._id,
        sharedWith: record.sharedWith,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to share record',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

/**
 * Revoke record sharing from a specific user
 */
export const revokeRecordSharing = async (req, res) => {
  try {
    const { recordId, userId } = req.params;

    const record = await MedicalRecord.findById(recordId);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found',
      });
    }

    // Only patient or creator can revoke sharing
    if (
      record.patientId.toString() !== req.user._id.toString() &&
      record.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Only the patient or record creator can revoke sharing',
      });
    }

    // Remove user from sharedWith array
    const initialLength = record.sharedWith.length;
    record.sharedWith = record.sharedWith.filter(id => id.toString() !== userId);

    if (record.sharedWith.length === initialLength) {
      return res.status(400).json({
        success: false,
        message: 'User does not have access to this record',
      });
    }

    // Update isShared flag
    if (record.sharedWith.length === 0) {
      record.isShared = false;
    }

    await record.save();

    return res.status(200).json({
      success: true,
      message: 'Sharing revoked successfully',
      data: {
        recordId: record._id,
        remainingShares: record.sharedWith.length,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to revoke sharing',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

/**
 * Get records shared with current user
 */
export const getSharedRecords = async (req, res) => {
  try {
    const { skip: rawSkip = 0, limit: rawLimit = 10 } = req.query;
    const { skip, limit } = validatePagination(rawSkip, rawLimit);

    const records = await MedicalRecord.find({
      sharedWith: req.user._id,
      isShared: true,
    })
      .populate('patientId', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await MedicalRecord.countDocuments({
      sharedWith: req.user._id,
      isShared: true,
    });

    return res.status(200).json({
      success: true,
      message: 'Shared records retrieved successfully',
      data: {
        records,
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
      message: 'Failed to retrieve shared records',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

/**
 * Generate a share token for all patient records
 */
export const generateShareAllToken = async (req, res) => {
  try {
    const { duration = '24h' } = req.body;
    const patientId = req.user._id;

    // Only patients can share their own records
    if (req.user.role !== 'patient') {
      return res.status(403).json({
        success: false,
        message: 'Only patients can share their records',
      });
    }

    // Calculate expiration time
    let expirationMs;
    switch (duration) {
      case '4h':
        expirationMs = 4 * 60 * 60 * 1000;
        break;
      case '24h':
        expirationMs = 24 * 60 * 60 * 1000;
        break;
      case '7d':
        expirationMs = 7 * 24 * 60 * 60 * 1000;
        break;
      default:
        expirationMs = 24 * 60 * 60 * 1000;
    }

    const expiresAt = new Date(Date.now() + expirationMs);

    // Generate secure random token
    const tokenString = crypto.randomBytes(32).toString('base64url');

    // Create share token
    const shareToken = new ShareToken({
      token: tokenString,
      patientId,
      type: 'all',
      expiresAt,
    });

    await shareToken.save();

    return res.status(201).json({
      success: true,
      message: 'Share token generated successfully',
      data: {
        token: tokenString,
        expiresAt,
        shareLink: `${req.protocol}://${req.get('host')}/shared/all/${tokenString}`,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to generate share token',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

/**
 * Get records by share token (public endpoint)
 */
export const getRecordsByShareToken = async (req, res) => {
  try {
    const { token } = req.params;

    // Find and validate token
    const shareToken = await ShareToken.findOne({ token }).populate('patientId', 'firstName lastName email');

    if (!shareToken) {
      return res.status(404).json({
        success: false,
        message: 'Invalid share link',
      });
    }

    // Check if token is expired
    if (!shareToken.isValid()) {
      return res.status(401).json({
        success: false,
        message: 'Share link has expired',
        expiresAt: shareToken.expiresAt,
      });
    }

    // Record access
    await shareToken.recordAccess();

    // Track doctor access if authenticated
    if (req.user && (req.user.role === 'doctor' || req.user.role === 'labassistant')) {
      // Check if doctor hasn't accessed this link before
      const alreadyAccessed = shareToken.accessedBy.some(
        access => access.userId.toString() === req.user._id.toString()
      );

      if (!alreadyAccessed) {
        shareToken.accessedBy.push({
          userId: req.user._id,
          accessedAt: new Date(),
        });
        await shareToken.save();
      }
    }

    // Get all records for the patient
    const records = await MedicalRecord.find({ patientId: shareToken.patientId._id })
      .populate('createdBy', 'firstName lastName email role')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: 'Records retrieved successfully',
      data: {
        patient: {
          id: shareToken.patientId._id,
          firstName: shareToken.patientId.firstName,
          lastName: shareToken.patientId.lastName,
          email: shareToken.patientId.email,
        },
        patientId: shareToken.patientId._id, // For easy access
        records,
        expiresAt: shareToken.expiresAt,
        accessCount: shareToken.accessCount,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve records',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

/**
 * Get share-all links accessed by current doctor
 */
export const getSharedViaLinks = async (req, res) => {
  try {
    const doctorId = req.user._id;

    // Find all share tokens where this doctor appears in accessedBy
    const shareTokens = await ShareToken.find({
      'accessedBy.userId': doctorId,
      expiresAt: { $gt: new Date() }, // Only non-expired tokens
    })
      .populate('patientId', 'firstName lastName email')
      .sort({ 'accessedBy.accessedAt': -1 });

    // Format the response
    const sharedRecords = shareTokens.map(token => {
      const access = token.accessedBy.find(a => a.userId.toString() === doctorId.toString());
      return {
        id: token._id,
        type: 'share-all',
        patient: {
          id: token.patientId._id,
          firstName: token.patientId.firstName,
          lastName: token.patientId.lastName,
          email: token.patientId.email,
        },
        sharedAt: access.accessedAt,
        expiresAt: token.expiresAt,
        token: token.token,
        accessCount: token.accessCount,
      };
    });

    return res.status(200).json({
      success: true,
      data: sharedRecords,
    });
  } catch (error) {
    console.error('Error fetching shared-via-links:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch shared records',
      error: error.message,
    });
  }
};

/**
 * Check if patient can still upload records (10-day window)
 */
export const checkUploadEligibility = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Only patients have self-upload capability
    if (user.role !== 'patient') {
      return res.status(200).json({
        success: true,
        canUpload: false,
        message: 'Only patients can self-upload records',
      });
    }

    const canUpload = user.isSelfUploadActive;
    const now = new Date();
    const expiresAt = user.selfUploadExpiresAt;

    // Calculate days remaining
    const msRemaining = expiresAt - now;
    const daysRemaining = canUpload
      ? Math.ceil(msRemaining / (24 * 60 * 60 * 1000))
      : 0;

    return res.status(200).json({
      success: true,
      canUpload,
      expiresAt,
      daysRemaining,
      registrationDate: user.registrationDate,
      message: canUpload
        ? `You can upload your old medical records! ${daysRemaining} day(s) remaining.`
        : 'Self-upload period has expired. Contact your doctor to add new records.',
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to check upload eligibility',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

export default {
  createRecord,
  getPatientRecords,
  getRecordById,
  updateRecord,
  deleteRecord,
  addFileToRecord,
  shareRecord,
  revokeRecordSharing,
  getSharedRecords,
  generateShareAllToken,
  getRecordsByShareToken,
  getSharedViaLinks,
  checkUploadEligibility,
};
