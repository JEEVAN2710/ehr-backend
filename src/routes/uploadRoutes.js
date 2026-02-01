import express from 'express';
import { body } from 'express-validator';
import { getPresignedUploadUrl, getPresignedDownloadUrl, checkFileExistsController } from '../controllers/uploadController.js';
import authenticateToken from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/roles.js';

const router = express.Router();

router.use(authenticateToken);

router.post(
  '/presigned-upload',
  authorizeRoles('patient', 'doctor', 'labassistant'),
  [
    body('filename').trim().notEmpty().withMessage('Filename is required'),
    body('contentType').trim().notEmpty().withMessage('Content type is required'),
  ],
  getPresignedUploadUrl
);

router.post(
  '/presigned-download',
  authorizeRoles('patient', 'doctor', 'labassistant'),
  [body('fileKey').trim().notEmpty().withMessage('File key is required')],
  getPresignedDownloadUrl
);

// Check if file exists in R2
router.get(
  '/check-file/:fileKey',
  authorizeRoles('patient', 'doctor', 'labassistant'),
  checkFileExistsController
);

export default router;
