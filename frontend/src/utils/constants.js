// User roles
export const USER_ROLES = {
    PATIENT: 'patient',
    DOCTOR: 'doctor',
    LAB_ASSISTANT: 'labassistant',
    ADMIN: 'admin'
};

// Record types
export const RECORD_TYPES = {
    PRESCRIPTION: 'prescription',
    LAB_TEST: 'labtest',
    SCAN: 'scan',
    REPORT: 'report',
    OTHER: 'other'
};

// API endpoints (for reference when backend is ready)
export const API_ENDPOINTS = {
    // Auth
    REGISTER: '/api/auth/register',
    VERIFY_OTP: '/api/auth/verify-otp',
    RESEND_OTP: '/api/auth/resend-otp',
    LOGIN: '/api/auth/login',
    REFRESH_TOKEN: '/api/auth/refresh',
    GET_PROFILE: '/api/auth/profile',
    CHANGE_PASSWORD: '/api/auth/change-password',

    // User Management (Admin)
    GET_USERS: '/api/auth/users',
    UPDATE_USER_STATUS: '/api/auth/users/:userId/status',

    // Medical Records
    CREATE_RECORD: '/api/records/',
    GET_PATIENT_RECORDS: '/api/records/:patientId',
    GET_SINGLE_RECORD: '/api/records/view/:recordId',
    UPDATE_RECORD: '/api/records/:recordId',
    DELETE_RECORD: '/api/records/:recordId',
    ADD_FILE: '/api/records/:recordId/files',

    // Record Sharing
    SHARE_RECORD: '/api/records/:recordId/share',
    REVOKE_SHARING: '/api/records/:recordId/share/:userId',
    GET_SHARED_RECORDS: '/api/records/shared-with-me',

    // Health
    HEALTH_CHECK: '/api/health'
};

// Password requirements
export const PASSWORD_REQUIREMENTS = {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
    requireSpecialChar: true
};

// Pagination defaults
export const PAGINATION = {
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100
};

// OTP settings
export const OTP_SETTINGS = {
    LENGTH: 6,
    EXPIRY_MINUTES: 5,
    MAX_ATTEMPTS: 3
};
