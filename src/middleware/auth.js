import { verifyAccessToken } from '../services/jwtService.js';
import { User } from '../models/User.js';

export const authenticateToken = async (req, res, next) => {
  try {
    console.log('[AUTH] Request path:', req.path);
    console.log('[AUTH] Request method:', req.method);

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    console.log('[AUTH] Token present:', !!token);

    if (!token) {
      console.log('[AUTH] ERROR: No token provided');
      return res.status(401).json({
        success: false,
        message: 'Access token is required',
      });
    }

    const decoded = verifyAccessToken(token);
    console.log('[AUTH] Token decoded:', !!decoded);

    if (!decoded) {
      console.log('[AUTH] ERROR: Token verification failed');
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired access token',
      });
    }

    console.log('[AUTH] User ID from token:', decoded.userId);
    const user = await User.findById(decoded.userId);
    console.log('[AUTH] User found:', !!user);
    console.log('[AUTH] User active:', user?.isActive);

    if (!user || !user.isActive) {
      console.log('[AUTH] ERROR: User not found or inactive');
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive',
      });
    }

    req.user = user;
    req.userId = decoded.userId;
    req.userRole = decoded.role;

    console.log('[AUTH] SUCCESS: User authenticated -', user.email);
    next();
  } catch (error) {
    console.error('[AUTH] EXCEPTION:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed',
      error: error.message,
    });
  }
};

export default authenticateToken;
