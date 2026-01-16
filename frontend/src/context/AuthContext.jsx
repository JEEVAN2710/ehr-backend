import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { tokenManager } from '../services/api';
import { storage } from '../utils/utils';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is already logged in
        const initAuth = async () => {
            const token = tokenManager.getAccessToken();
            const savedUser = storage.get('currentUser');

            if (token && savedUser) {
                setUser(savedUser);
            }

            setLoading(false);
        };

        initAuth();
    }, []);

    const login = async (identifier, password, isPhone = false) => {
        const response = await api.login(identifier, password, isPhone);
        const userData = response.data.user;
        setUser(userData);
        storage.set('currentUser', userData);
        return response;
    };

    const register = async (userData) => {
        // Store registration data temporarily for OTP verification
        storage.set('pendingRegistration', userData);
        return await api.register(userData);
    };

    const verifyOtp = async (email, otp) => {
        const response = await api.verifyOtp(email, otp);

        // Use the actual user data from backend response
        const userData = response.data.user;

        console.log('✅ OTP Verified! User data:', userData);

        setUser(userData);
        storage.set('currentUser', userData);
        storage.remove('pendingRegistration');

        return response;
    };

    const logout = () => {
        setUser(null);
        tokenManager.clearTokens();
        storage.remove('currentUser');
    };

    const updateUser = (updates) => {
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
        storage.set('currentUser', updatedUser);
    };

    const value = {
        user,
        loading,
        login,
        register,
        verifyOtp,
        logout,
        updateUser,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
