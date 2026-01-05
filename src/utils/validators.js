/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} - { valid: boolean, message: string }
 */
export const validatePasswordStrength = (password) => {
    if (!password || password.length < 8) {
        return {
            valid: false,
            message: 'Password must be at least 8 characters long',
        };
    }

    if (!/[a-z]/.test(password)) {
        return {
            valid: false,
            message: 'Password must contain at least one lowercase letter',
        };
    }

    if (!/[A-Z]/.test(password)) {
        return {
            valid: false,
            message: 'Password must contain at least one uppercase letter',
        };
    }

    if (!/[0-9]/.test(password)) {
        return {
            valid: false,
            message: 'Password must contain at least one number',
        };
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        return {
            valid: false,
            message: 'Password must contain at least one special character (!@#$%^&*(),.?":{}|<>)',
        };
    }

    return {
        valid: true,
        message: 'Password is strong',
    };
};

/**
 * Validate and sanitize pagination parameters
 * @param {number} skip - Number of records to skip
 * @param {number} limit - Number of records to return
 * @returns {object} - { skip: number, limit: number }
 */
export const validatePagination = (skip = 0, limit = 10) => {
    const parsedSkip = Math.max(0, parseInt(skip) || 0);
    const parsedLimit = Math.min(100, Math.max(1, parseInt(limit) || 10)); // Max 100 records per request

    return {
        skip: parsedSkip,
        limit: parsedLimit,
    };
};

/**
 * Sanitize MongoDB query to prevent NoSQL injection
 * @param {any} value - Value to sanitize
 * @returns {any} - Sanitized value
 */
export const sanitizeMongoQuery = (value) => {
    if (typeof value === 'object' && value !== null) {
        // Remove any MongoDB operators from objects
        const sanitized = {};
        for (const key in value) {
            if (!key.startsWith('$')) {
                sanitized[key] = sanitizeMongoQuery(value[key]);
            }
        }
        return sanitized;
    }
    return value;
};

/**
 * Validate MongoDB ObjectId format
 * @param {string} id - ID to validate
 * @returns {boolean} - True if valid ObjectId format
 */
export const isValidObjectId = (id) => {
    if (!id) return false;
    return /^[0-9a-fA-F]{24}$/.test(id);
};

export default {
    validatePasswordStrength,
    validatePagination,
    sanitizeMongoQuery,
    isValidObjectId,
};
