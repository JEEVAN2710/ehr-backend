import { format, formatDistanceToNow } from 'date-fns';
import { PASSWORD_REQUIREMENTS } from './constants';

// Date formatting
export const formatDate = (date) => {
    if (!date) return '';
    return format(new Date(date), 'MMM dd, yyyy');
};

export const formatDateTime = (date) => {
    if (!date) return '';
    return format(new Date(date), 'MMM dd, yyyy HH:mm');
};

export const formatRelativeTime = (date) => {
    if (!date) return '';
    return formatDistanceToNow(new Date(date), { addSuffix: true });
};

// Password strength validation
export const validatePassword = (password) => {
    const errors = [];

    if (password.length < PASSWORD_REQUIREMENTS.minLength) {
        errors.push(`At least ${PASSWORD_REQUIREMENTS.minLength} characters`);
    }

    if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
        errors.push('One uppercase letter');
    }

    if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
        errors.push('One lowercase letter');
    }

    if (PASSWORD_REQUIREMENTS.requireNumber && !/\d/.test(password)) {
        errors.push('One number');
    }

    if (PASSWORD_REQUIREMENTS.requireSpecialChar && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push('One special character');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

export const getPasswordStrength = (password) => {
    let strength = 0;

    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;

    if (strength <= 2) return { level: 'weak', color: '#ef4444' };
    if (strength <= 4) return { level: 'medium', color: '#f59e0b' };
    return { level: 'strong', color: '#10b981' };
};

// Email validation
export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Phone number validation
export const validatePhone = (phone) => {
    const phoneRegex = /^\+?[\d\s-()]+$/;
    return phoneRegex.test(phone);
};

// Local storage helpers
export const storage = {
    get: (key) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return null;
        }
    },

    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error('Error writing to localStorage:', error);
        }
    },

    remove: (key) => {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('Error removing from localStorage:', error);
        }
    },

    clear: () => {
        try {
            localStorage.clear();
        } catch (error) {
            console.error('Error clearing localStorage:', error);
        }
    }
};

// Generate random ID (for dummy data)
export const generateId = () => {
    return Math.random().toString(36).substr(2, 9);
};

// Truncate text
export const truncateText = (text, maxLength = 100) => {
    if (!text || text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
};

// Capitalize first letter
export const capitalize = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
};

// Format role name
export const formatRole = (role) => {
    if (!role) return '';
    if (role === 'labassistant') return 'Lab Assistant';
    return capitalize(role);
};
