import express from 'express';
import { body, param } from 'express-validator';
import {
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
} from '../controllers/recordController.js';
import authenticateToken from '../middleware/auth.js';
import { optionalAuthenticateToken } from '../middleware/optionalAuth.js';
import { authorizeRoles } from '../middleware/roles.js';

const router = express.Router();

router.use(authenticateToken);

router.post(
  '/',
  authorizeRoles('patient', 'doctor', 'labassistant'),
  [
    body('patientId').isMongoId().withMessage('Valid patient ID is required'),
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('recordType')
      .optional()
      .isIn(['prescription', 'labtest', 'scan', 'report', 'other'])
      .withMessage('Invalid record type'),
  ],
  createRecord
);

// Get records created by current user (for doctor dashboard)
router.get(
  '/my-records',
  (req, res, next) => {
    console.log('[ROUTE DEBUG] /my-records route matched!');
    console.log('[ROUTE DEBUG] User:', req.user?.email, 'Role:', req.user?.role);
    // FIX: Set patientId param so controller logic works
    req.params.patientId = 'my-records';
    next();
  },
  authorizeRoles('doctor', 'labassistant'),
  getPatientRecords
);

// Check if patient can upload records (10-day window)
router.get(
  '/upload-eligibility',
  authorizeRoles('patient'),
  checkUploadEligibility
);

// Get share-all links accessed by doctor
router.get(
  '/shared-via-links',
  authorizeRoles('doctor', 'labassistant'),
  getSharedViaLinks
);

// Get patient records by patient ID (MUST be after specific routes)
router.get(
  '/:patientId',
  authorizeRoles('patient', 'doctor', 'labassistant'),
  [param('patientId').isMongoId().withMessage('Valid patient ID is required')],
  getPatientRecords
);

router.get(
  '/view/:recordId',
  authorizeRoles('patient', 'doctor', 'labassistant'),
  [param('recordId').isMongoId().withMessage('Valid record ID is required')],
  getRecordById
);

router.put(
  '/:recordId',
  authorizeRoles('patient', 'doctor', 'labassistant'),
  [
    param('recordId').isMongoId().withMessage('Valid record ID is required'),
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    body('description').optional().trim().notEmpty().withMessage('Description cannot be empty'),
    body('recordType')
      .optional()
      .isIn(['prescription', 'labtest', 'scan', 'report', 'other'])
      .withMessage('Invalid record type'),
  ],
  updateRecord
);

router.delete(
  '/:recordId',
  authorizeRoles('patient', 'doctor', 'labassistant', 'admin'),
  [param('recordId').isMongoId().withMessage('Valid record ID is required')],
  deleteRecord
);

router.post(
  '/:recordId/files',
  authorizeRoles('patient', 'doctor', 'labassistant'),
  [
    param('recordId').isMongoId().withMessage('Valid record ID is required'),
    body('fileKey').trim().notEmpty().withMessage('File key is required'),
    body('filename').trim().notEmpty().withMessage('Filename is required'),
    body('contentType').trim().notEmpty().withMessage('Content type is required'),
    body('size').isInt({ min: 1 }).withMessage('File size must be greater than 0'),
  ],
  addFileToRecord
);

// Share record with users
router.post(
  '/:recordId/share',
  authorizeRoles('patient', 'doctor', 'labassistant'),
  [
    param('recordId').isMongoId().withMessage('Valid record ID is required'),
    body('userIds')
      .isArray({ min: 1 })
      .withMessage('userIds must be an array with at least one user ID'),
    body('userIds.*').isMongoId().withMessage('Each user ID must be valid'),
  ],
  shareRecord
);

// Revoke record sharing
router.delete(
  '/:recordId/share/:userId',
  authorizeRoles('patient', 'doctor', 'labassistant'),
  [
    param('recordId').isMongoId().withMessage('Valid record ID is required'),
    param('userId').isMongoId().withMessage('Valid user ID is required'),
  ],
  revokeRecordSharing
);

// Get records shared with me
router.get(
  '/shared-with-me',
  authorizeRoles('patient', 'doctor', 'labassistant'),
  getSharedRecords
);

// Share all records - generate token (patient only)
router.post(
  '/share-all',
  authorizeRoles('patient'),
  [
    body('duration').optional().isIn(['4h', '24h', '7d']).withMessage('Invalid duration'),
  ],
  generateShareAllToken
);

// Public route - Get records by share token (optional auth for tracking)
const publicRouter = express.Router();
publicRouter.get(
  '/shared/all/:token',
  optionalAuthenticateToken,
  [param('token').notEmpty().withMessage('Token is required')],
  getRecordsByShareToken
);

export { publicRouter };
export default router;
