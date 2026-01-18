import { verifyAccessToken } from '../services/jwtService.js';
import { User } from '../models/User.js';

/**
 * Optional authentication middleware
 * Authenticates the user if a token is provided, but allows request to proceed without auth
 */
export const optionalAuthenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        // If no token provided, proceed without authentication
        if (!token) {
            return next();
        }

        try {
            const decoded = verifyAccessToken(token);

            if (decoded) {
                const user = await User.findById(decoded.userId);
                if (user && user.isActive) {
                    req.user = user;
                    req.userId = decoded.userId;
                    req.userRole = decoded.role;
                }
            }
        } catch (error) {
            // Token invalid, but we allow request to proceed
            console.log('[OPTIONAL AUTH] Token invalid, proceeding without auth');
        }

        next();
    } catch (error) {
        // Any error, just proceed without auth
        next();
    }
};
