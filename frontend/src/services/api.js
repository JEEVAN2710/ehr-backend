import { storage, generateId } from '../utils/utils';
import { USER_ROLES, RECORD_TYPES } from '../utils/constants';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';


// Dummy users data
const DUMMY_USERS = [
    {
        _id: 'user_1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'patient@test.com',
        role: USER_ROLES.PATIENT,
        phoneNumber: '+1234567890',
        dateOfBirth: '1990-01-15',
        isActive: true,
        isVerified: true,
        createdAt: '2024-01-01T10:00:00Z'
    },
    {
        _id: 'user_2',
        firstName: 'Dr. Sarah',
        lastName: 'Smith',
        email: 'doctor@test.com',
        role: USER_ROLES.DOCTOR,
        phoneNumber: '+1234567891',
        dateOfBirth: '1985-05-20',
        isActive: true,
        isVerified: true,
        createdAt: '2024-01-01T10:00:00Z'
    },
    {
        _id: 'user_3',
        firstName: 'Mike',
        lastName: 'Johnson',
        email: 'lab@test.com',
        role: USER_ROLES.LAB_ASSISTANT,
        phoneNumber: '+1234567892',
        dateOfBirth: '1992-08-10',
        isActive: true,
        isVerified: true,
        createdAt: '2024-01-01T10:00:00Z'
    },
    {
        _id: 'user_4',
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@test.com',
        role: USER_ROLES.ADMIN,
        phoneNumber: '+1234567893',
        dateOfBirth: '1980-03-25',
        isActive: true,
        isVerified: true,
        createdAt: '2024-01-01T10:00:00Z'
    },
    {
        _id: 'user_5',
        firstName: 'Jane',
        lastName: 'Wilson',
        email: 'patient2@test.com',
        role: USER_ROLES.PATIENT,
        phoneNumber: '+1234567894',
        dateOfBirth: '1995-12-05',
        isActive: true,
        isVerified: true,
        createdAt: '2024-01-02T10:00:00Z'
    }
];

// Dummy medical records
const DUMMY_RECORDS = [
    {
        _id: 'record_1',
        patientId: 'user_1',
        createdBy: 'user_2',
        title: 'Annual Physical Examination',
        description: 'Complete physical examination with blood work. All vitals normal. Blood pressure: 120/80. Heart rate: 72 bpm.',
        recordType: RECORD_TYPES.REPORT,
        files: [],
        sharedWith: ['user_2'],
        createdAt: '2024-12-01T10:00:00Z',
        updatedAt: '2024-12-01T10:00:00Z'
    },
    {
        _id: 'record_2',
        patientId: 'user_1',
        createdBy: 'user_2',
        title: 'Blood Test Results',
        description: 'Complete blood count and metabolic panel. Hemoglobin: 14.5 g/dL, WBC: 7,200/μL, Glucose: 95 mg/dL.',
        recordType: RECORD_TYPES.LAB_TEST,
        files: [],
        sharedWith: ['user_2', 'user_3'],
        createdAt: '2024-12-03T14:30:00Z',
        updatedAt: '2024-12-03T14:30:00Z'
    },
    {
        _id: 'record_3',
        patientId: 'user_1',
        createdBy: 'user_2',
        title: 'Antibiotic Prescription',
        description: 'Amoxicillin 500mg, 3 times daily for 7 days. For bacterial infection treatment.',
        recordType: RECORD_TYPES.PRESCRIPTION,
        files: [],
        sharedWith: ['user_2'],
        createdAt: '2024-12-05T09:15:00Z',
        updatedAt: '2024-12-05T09:15:00Z'
    },
    {
        _id: 'record_4',
        patientId: 'user_5',
        createdBy: 'user_2',
        title: 'X-Ray Chest',
        description: 'Chest X-ray shows clear lungs, no abnormalities detected.',
        recordType: RECORD_TYPES.SCAN,
        files: [],
        sharedWith: ['user_2'],
        createdAt: '2024-12-06T11:00:00Z',
        updatedAt: '2024-12-06T11:00:00Z'
    },
    {
        _id: 'record_5',
        patientId: 'user_1',
        createdBy: 'user_3',
        title: 'Lipid Profile Test',
        description: 'Total Cholesterol: 180 mg/dL, HDL: 55 mg/dL, LDL: 100 mg/dL, Triglycerides: 125 mg/dL.',
        recordType: RECORD_TYPES.LAB_TEST,
        files: [],
        sharedWith: ['user_2', 'user_3'],
        createdAt: '2024-12-08T16:45:00Z',
        updatedAt: '2024-12-08T16:45:00Z'
    }
];

// Simulate API delay
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Token management
export const tokenManager = {
    getAccessToken: () => storage.get('accessToken'),
    getRefreshToken: () => storage.get('refreshToken'),
    setTokens: (accessToken, refreshToken) => {
        storage.set('accessToken', accessToken);
        storage.set('refreshToken', refreshToken);
    },
    clearTokens: () => {
        storage.remove('accessToken');
        storage.remove('refreshToken');
    }
};

// API Service with dummy data
const api = {
    // ============== AUTH APIs ==============

    // Register (Step 1)
    register: async (userData) => {
        const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
    },

    // Verify OTP (Step 2)
    verifyOtp: async (email, otp) => {
        const response = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        tokenManager.setTokens(data.data.accessToken, data.data.refreshToken);
        return data;
    },

    // Resend OTP
    resendOtp: async (email) => {
        const response = await fetch(`${API_BASE_URL}/api/auth/resend-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
    },

    // Forgot Password
    forgotPassword: async (email) => {
        const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
    },

    // Login
    login: async (identifier, password, isPhone = false) => {
        const body = { password };
        if (isPhone) {
            body.phoneNumber = identifier;
        } else {
            body.email = identifier;
        }

        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        tokenManager.setTokens(data.data.accessToken, data.data.refreshToken);
        return data;
    },

    // Get Profile
    getProfile: async () => {
        await delay();

        /* REAL API CALL:
        const token = tokenManager.getAccessToken();
        const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
        */

        // Dummy - return first patient for demo
        const currentUser = storage.get('currentUser') || DUMMY_USERS[0];

        return {
            success: true,
            data: { user: currentUser }
        };
    },

    // Update Profile
    updateProfile: async (profileData) => {
        const token = tokenManager.getAccessToken();
        const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(profileData)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
    },

    // Change Password
    changePassword: async (currentPassword, newPassword) => {
        const token = tokenManager.getAccessToken();
        const response = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ currentPassword, newPassword })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
    },

    // ============== USER MANAGEMENT (Admin) ==============

    // Get all users
    getUsers: async (params = {}) => {
        await delay();

        /* REAL API CALL:
        const token = tokenManager.getAccessToken();
        const queryParams = new URLSearchParams(params);
        const response = await fetch(`${API_BASE_URL}/api/auth/users?${queryParams}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
        */

        let filteredUsers = [...DUMMY_USERS];

        // Filter by role
        if (params.role) {
            filteredUsers = filteredUsers.filter(u => u.role === params.role);
        }

        // Filter by active status
        if (params.isActive !== undefined) {
            filteredUsers = filteredUsers.filter(u => u.isActive === params.isActive);
        }

        const skip = parseInt(params.skip) || 0;
        const limit = parseInt(params.limit) || 20;
        const paginatedUsers = filteredUsers.slice(skip, skip + limit);

        return {
            success: true,
            data: {
                users: paginatedUsers,
                pagination: {
                    total: filteredUsers.length,
                    skip,
                    limit,
                    hasMore: skip + limit < filteredUsers.length
                }
            }
        };
    },

    // Update user status
    updateUserStatus: async (userId, isActive) => {
        await delay();

        /* REAL API CALL:
        const token = tokenManager.getAccessToken();
        const response = await fetch(`${API_BASE_URL}/api/auth/users/${userId}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ isActive })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
        */

        const user = DUMMY_USERS.find(u => u._id === userId);
        if (user) {
            user.isActive = isActive;
        }

        return {
            success: true,
            message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
            data: { user }
        };
    },

    // ============== MEDICAL RECORDS ==============

    // Create record
    createRecord: async (recordData) => {
        const token = tokenManager.getAccessToken();
        const response = await fetch(`${API_BASE_URL}/api/records/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(recordData)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
    },

    // Get patient records
    getPatientRecords: async (patientId, params = {}) => {
        const token = tokenManager.getAccessToken();
        const queryParams = new URLSearchParams(params);
        const response = await fetch(`${API_BASE_URL}/api/records/${patientId}?${queryParams}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
    },

    // Get single record
    getRecord: async (recordId) => {
        const token = tokenManager.getAccessToken();
        const response = await fetch(`${API_BASE_URL}/api/records/view/${recordId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
    },

    // Update record
    updateRecord: async (recordId, updates) => {
        await delay();

        /* REAL API CALL:
        const token = tokenManager.getAccessToken();
        const response = await fetch(`${API_BASE_URL}/api/records/${recordId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(updates)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
        */

        const record = DUMMY_RECORDS.find(r => r._id === recordId);
        if (!record) {
            throw new Error('Record not found');
        }

        Object.assign(record, updates, { updatedAt: new Date().toISOString() });

        return {
            success: true,
            message: 'Record updated successfully',
            data: { record }
        };
    },

    // Delete record
    deleteRecord: async (recordId) => {
        await delay();

        /* REAL API CALL:
        const token = tokenManager.getAccessToken();
        const response = await fetch(`${API_BASE_URL}/api/records/${recordId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
        */

        const index = DUMMY_RECORDS.findIndex(r => r._id === recordId);
        if (index !== -1) {
            DUMMY_RECORDS.splice(index, 1);
        }

        return {
            success: true,
            message: 'Record deleted successfully'
        };
    },

    // Share record
    shareRecord: async (recordId, userIds) => {
        await delay();

        /* REAL API CALL:
        const token = tokenManager.getAccessToken();
        const response = await fetch(`${API_BASE_URL}/api/records/${recordId}/share`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ userIds })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
        */

        const record = DUMMY_RECORDS.find(r => r._id === recordId);
        if (!record) {
            throw new Error('Record not found');
        }

        record.sharedWith = [...new Set([...record.sharedWith, ...userIds])];

        return {
            success: true,
            message: 'Record shared successfully',
            data: { record }
        };
    },

    // Revoke sharing
    revokeSharing: async (recordId, userId) => {
        await delay();

        /* REAL API CALL:
        const token = tokenManager.getAccessToken();
        const response = await fetch(`${API_BASE_URL}/api/records/${recordId}/share/${userId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
        */

        const record = DUMMY_RECORDS.find(r => r._id === recordId);
        if (!record) {
            throw new Error('Record not found');
        }

        record.sharedWith = record.sharedWith.filter(id => id !== userId);

        return {
            success: true,
            message: 'Sharing revoked successfully'
        };
    },

    // Get shared records
    getSharedRecords: async (params = {}) => {
        await delay();

        /* REAL API CALL:
        const token = tokenManager.getAccessToken();
        const queryParams = new URLSearchParams(params);
        const response = await fetch(`${API_BASE_URL}/api/records/shared-with-me?${queryParams}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
        */

        const currentUser = storage.get('currentUser') || DUMMY_USERS[0];
        const sharedRecords = DUMMY_RECORDS.filter(r =>
            r.sharedWith.includes(currentUser._id) && r.patientId !== currentUser._id
        );

        const skip = parseInt(params.skip) || 0;
        const limit = parseInt(params.limit) || 10;
        const paginatedRecords = sharedRecords.slice(skip, skip + limit);

        const populatedRecords = paginatedRecords.map(record => ({
            ...record,
            patient: DUMMY_USERS.find(u => u._id === record.patientId),
            creator: DUMMY_USERS.find(u => u._id === record.createdBy)
        }));

        return {
            success: true,
            data: {
                records: populatedRecords,
                pagination: {
                    total: sharedRecords.length,
                    skip,
                    limit,
                    hasMore: skip + limit < sharedRecords.length
                }
            }
        };
    },

    // ============== USER MANAGEMENT (ADMIN) ==============

    // Get all users (Admin only)
    getAllUsers: async () => {
        const token = tokenManager.getAccessToken();
        const response = await fetch(`${API_BASE_URL}/api/auth/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
    },

    // Get records by creator (for doctor dashboard)
    getRecordsByCreator: async (creatorId) => {
        const token = tokenManager.getAccessToken();
        const response = await fetch(`${API_BASE_URL}/api/records/my-records`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
    },

    // Get share-all links accessed by doctor (for Shared with Me)
    getSharedViaLinks: async () => {
        const token = tokenManager.getAccessToken();
        const response = await fetch(`${API_BASE_URL}/api/records/shared-via-links`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
    },

    // ============== ACCESS REQUESTS ==============

    // Request access to patient's records (Doctor)
    requestAccess: async (patientEmail, message = '') => {
        const token = tokenManager.getAccessToken();
        // Use verify-patient endpoint (doctors/lab assistants can verify patient emails)
        const findResponse = await fetch(`${API_BASE_URL}/api/auth/verify-patient?email=${patientEmail}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const findData = await findResponse.json();
        if (!findResponse.ok || !findData.data.user) {
            throw new Error(findData.message || 'Patient not found');
        }

        const patientId = findData.data.user._id;
        const response = await fetch(`${API_BASE_URL}/api/access-requests/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ patientId, message })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
    },

    // Get pending access requests (Patient)
    getPendingRequests: async (params = {}) => {
        const token = tokenManager.getAccessToken();
        const queryParams = new URLSearchParams(params);
        const response = await fetch(`${API_BASE_URL}/api/access-requests/pending?${queryParams}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
    },

    // Get granted access (Patient views who they gave access to)
    getGrantedAccess: async (params = {}) => {
        const token = tokenManager.getAccessToken();
        const queryParams = new URLSearchParams(params);
        const response = await fetch(`${API_BASE_URL}/api/access-requests/granted-access?${queryParams}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
    },

    // Respond to access request (Patient approves/denies)
    respondToRequest: async (requestId, action) => {
        const token = tokenManager.getAccessToken();
        const response = await fetch(`${API_BASE_URL}/api/access-requests/${requestId}/respond`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ action })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
    },

    // Revoke access (Patient revokes granted access)
    revokeAccess: async (requestId, timing = 'immediate') => {
        const token = tokenManager.getAccessToken();
        const response = await fetch(`${API_BASE_URL}/api/access-requests/${requestId}/revoke`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ timing })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
    },

    // Get my sent requests (Doctor)
    getMyRequests: async (params = {}) => {
        const token = tokenManager.getAccessToken();
        const queryParams = new URLSearchParams(params);
        const response = await fetch(`${API_BASE_URL}/api/access-requests/my-requests?${queryParams}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
    },

    // ============== FILE UPLOAD/DOWNLOAD ==============

    // Get presigned upload URL
    getPresignedUploadUrl: async (filename, contentType, patientId) => {
        const token = tokenManager.getAccessToken();
        const response = await fetch(`${API_BASE_URL}/api/upload/presigned-upload`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ filename, contentType, patientId })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
    },

    // Upload file to R2 using presigned URL
    uploadFileToR2: async (presignedUrl, file) => {
        const response = await fetch(presignedUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': file.type
            },
            body: file
        });
        if (!response.ok) throw new Error('Failed to upload file to storage');
        return { success: true };
    },

    // Get presigned download URL
    getPresignedDownloadUrl: async (fileKey, recordId) => {
        const token = tokenManager.getAccessToken();
        const response = await fetch(`${API_BASE_URL}/api/upload/presigned-download`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ fileKey, recordId })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
    },

    // Add file to medical record
    addFileToRecord: async (recordId, fileData) => {
        const token = tokenManager.getAccessToken();
        const response = await fetch(`${API_BASE_URL}/api/records/${recordId}/files`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(fileData)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
    },

    // Generate share-all token
    generateShareAllToken: async (duration = '24h') => {
        const token = tokenManager.getAccessToken();
        const response = await fetch(`${API_BASE_URL}/api/records/share-all`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ duration })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
    },

    // Get records by share token (public - no auth required)
    getRecordsByShareToken: async (token) => {
        const response = await fetch(`${API_BASE_URL}/api/records/shared/${token}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
    },

    // ============== ADMIN ==============

    // Get all users (Admin only)
    getUsers: async (params = {}) => {
        const token = tokenManager.getAccessToken();

        // Special case: If searching for a patient by email OR phone (for CreateRecord)
        // use the verify-patient endpoint instead (accessible by doctors/lab assistants)
        if (params.role === 'patient' && (params.email || params.phoneNumber)) {
            const queryParams = new URLSearchParams();
            if (params.email) queryParams.append('email', params.email);
            if (params.phoneNumber) queryParams.append('phoneNumber', params.phoneNumber);

            const response = await fetch(`${API_BASE_URL}/api/auth/verify-patient?${queryParams.toString()}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);

            // Return in same format as users endpoint
            return {
                success: true,
                data: {
                    users: data.data.user ? [data.data.user] : [],
                    pagination: { total: data.data.user ? 1 : 0 }
                }
            };
        }

        // Admin-only: Get all users
        const queryParams = new URLSearchParams(params);
        const response = await fetch(`${API_BASE_URL}/api/auth/users?${queryParams}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
    },

    // Update user status (Admin only)
    updateUserStatus: async (userId, isActive) => {
        const token = tokenManager.getAccessToken();
        const response = await fetch(`${API_BASE_URL}/api/auth/users/${userId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ isActive })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
    },

    // Update user details (Admin only)
    updateUser: async (userId, userData) => {
        const token = tokenManager.getAccessToken();
        const response = await fetch(`${API_BASE_URL}/api/auth/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(userData)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
    },

    // Create record (Doctor/Lab Assistant)
    createRecord: async (recordData) => {
        const token = tokenManager.getAccessToken();
        const response = await fetch(`${API_BASE_URL}/api/records`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(recordData)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
    }
};

export default api;
