import { validationResult } from 'express-validator';
import { generatePresignedUploadUrl, generatePresignedDownloadUrl } from '../services/s3Service.js';
import { MedicalRecord } from '../models/MedicalRecord.js';
import { AuditLog } from '../models/AuditLog.js';

export const getPresignedUploadUrl = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(err => err.msg);
      return res.status(400).json({
        success: false,
        message: `Validation failed: ${errorMessages.join(', ')}`,
        errors: errors.array(),
      });
    }

    const { filename, contentType } = req.body;
    const patientId = req.body.patientId || req.user._id;

    if (!filename || !contentType) {
      return res.status(400).json({
        success: false,
        message: 'Filename and contentType are required',
      });
    }

    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/jpg',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];

    if (!allowedTypes.includes(contentType)) {
      return res.status(400).json({
        success: false,
        message: `File type '${contentType}' is not supported. Please upload PDF, images (JPG/PNG), or Word/Excel documents.`,
        hint: 'Make sure you are uploading medical records like prescriptions, lab reports, or scan images.',
      });
    }

    const { uploadUrl, key } = await generatePresignedUploadUrl(patientId, filename, contentType);

    return res.status(200).json({
      success: true,
      message: 'Presigned upload URL generated successfully',
      data: {
        uploadUrl,
        key,
        expiresIn: 3600,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to generate presigned URL',
      error: error.message,
    });
  }
};

export const getPresignedDownloadUrl = async (req, res) => {
  try {
    const { fileKey, recordId } = req.body;

    if (!fileKey) {
      return res.status(400).json({
        success: false,
        message: 'File key is required',
      });
    }

    // If recordId provided, verify user has permission to access this record
    if (recordId) {
      const record = await MedicalRecord.findById(recordId);

      if (!record) {
        // Log unauthorized access attempt
        await AuditLog.create({
          action: 'file_download',
          userId: req.user._id,
          userRole: req.user.role,
          fileKey,
          metadata: { recordId, reason: 'Record not found' },
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.get('user-agent'),
          status: 'failure',
          errorMessage: 'Medical record not found',
        });

        return res.status(404).json({
          success: false,
          message: 'Medical record not found',
        });
      }

      // Check if user has permission to access this record
      const hasPermission =
        record.patientId.toString() === req.user._id.toString() || // Patient themselves
        record.createdBy.toString() === req.user._id.toString() || // Creator
        record.sharedWith.some(id => id.toString() === req.user._id.toString()) || // Shared with user
        req.user.role === 'admin'; // Admin has full access

      if (!hasPermission) {
        // Log unauthorized access attempt
        await AuditLog.create({
          action: 'file_download',
          userId: req.user._id,
          userRole: req.user.role,
          targetId: recordId,
          targetModel: 'MedicalRecord',
          fileKey,
          metadata: { recordId },
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.get('user-agent'),
          status: 'unauthorized',
          errorMessage: 'User does not have permission to access this file',
        });

        return res.status(403).json({
          success: false,
          message: 'You do not have permission to access this file',
        });
      }
    }

    // Generate download URL
    const downloadUrl = await generatePresignedDownloadUrl(fileKey);

    // Log successful file access
    await AuditLog.create({
      action: 'file_download',
      userId: req.user._id,
      userRole: req.user.role,
      targetId: recordId || null,
      targetModel: recordId ? 'MedicalRecord' : null,
      fileKey,
      metadata: { recordId },
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
      status: 'success',
    });

    return res.status(200).json({
      success: true,
      message: 'Presigned download URL generated successfully',
      data: {
        downloadUrl,
        expiresIn: 3600, // 1 hour
      },
    });
  } catch (error) {
    // Log error
    await AuditLog.create({
      action: 'file_download',
      userId: req.user._id,
      userRole: req.user.role,
      fileKey: req.body.fileKey,
      metadata: { recordId: req.body.recordId },
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
      status: 'failure',
      errorMessage: error.message,
    });

    return res.status(500).json({
      success: false,
      message: 'Failed to generate download URL',
      error: error.message,
    });
  }
};

export default {
  getPresignedUploadUrl,
  getPresignedDownloadUrl,
};
