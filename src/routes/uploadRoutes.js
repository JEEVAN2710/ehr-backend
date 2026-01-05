import express from 'express';
import { body } from 'express-validator';
import { getPresignedUploadUrl, getPresignedDownloadUrl } from '../controllers/uploadController.js';
import authenticateToken from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/roles.js';

const router = express.Router();

router.use(authenticateToken);

router.post(
  '/presign',
  authorizeRoles('patient', 'doctor', 'labassistant'),
  [
    body('filename').trim().notEmpty().withMessage('Filename is required'),
    body('contentType').trim().notEmpty().withMessage('Content type is required'),
    body('patientId').optional().isMongoId().withMessage('Valid patient ID format required'),
  ],
  getPresignedUploadUrl
);

router.post(
  '/download',
  authorizeRoles('patient', 'doctor', 'labassistant'),
  [body('fileKey').trim().notEmpty().withMessage('File key is required')],
  getPresignedDownloadUrl
);

export default router;
