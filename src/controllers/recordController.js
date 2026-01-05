import { validationResult } from 'express-validator';
import { MedicalRecord } from '../models/MedicalRecord.js';
import { User } from '../models/User.js';
import { validatePagination } from '../utils/validators.js';

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
    const { skip: rawSkip = 0, limit: rawLimit = 10 } = req.query;

    // Validate pagination
    const { skip, limit } = validatePagination(rawSkip, rawLimit);

    const patient = await User.findById(patientId);
    if (!patient) {
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

    const records = await MedicalRecord.find({ patientId })
      .populate('patientId', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await MedicalRecord.countDocuments({ patientId });

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
};
