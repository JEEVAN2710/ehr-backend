import express from 'express';
import { body, param } from 'express-validator';
import {
    requestAccess,
    getPendingRequests,
    respondToRequest,
    revokeAccess,
    getGrantedAccess,
    getMyRequests,
} from '../controllers/accessRequestController.js';
import authenticateToken from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/roles.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Doctor requests access to patient's records
router.post(
    '/',
    authorizeRoles('doctor', 'labassistant'),
    [
        body('patientId').isMongoId().withMessage('Valid patient ID is required'),
        body('message').optional().isString().isLength({ max: 500 }).withMessage('Message must be less than 500 characters'),
    ],
    requestAccess
);

// Patient gets their pending requests
router.get(
    '/pending',
    authorizeRoles('patient'),
    getPendingRequests
);

// Patient approves or denies a request
router.put(
    '/:requestId/respond',
    authorizeRoles('patient'),
    [
        param('requestId').isMongoId().withMessage('Valid request ID is required'),
        body('action').isIn(['approve', 'deny']).withMessage('Action must be either approve or deny'),
    ],
    respondToRequest
);

// Patient revokes granted access
router.put(
    '/:requestId/revoke',
    authorizeRoles('patient'),
    [
        param('requestId').isMongoId().withMessage('Valid request ID is required'),
        body('timing').optional().isIn(['immediate', '4h', '8h']).withMessage('Timing must be immediate, 4h, or 8h'),
    ],
    revokeAccess
);

// Patient views who they granted access to
router.get(
    '/granted-access',
    authorizeRoles('patient'),
    getGrantedAccess
);

// Doctor/Lab assistant views their sent requests
router.get(
    '/my-requests',
    authorizeRoles('doctor', 'labassistant'),
    getMyRequests
);

export default router;
