import express from 'express';
import { getBlockchainAudit, verifyRecordIntegrity, getBlockchainStats } from '../controllers/blockchainController.js';
import authenticateToken from '../middleware/auth.js';

const router = express.Router();

// All blockchain routes require authentication
router.use(authenticateToken);

// Get blockchain audit trail for a record
router.get('/audit/:recordId', getBlockchainAudit);

// Verify record integrity against blockchain
router.get('/verify/:recordId', verifyRecordIntegrity);

// Get blockchain statistics
router.get('/stats', getBlockchainStats);

export default router;
