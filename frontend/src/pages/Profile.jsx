import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import ShareAllModal from '../components/ShareAllModal';
import { Lock, AlertCircle, CheckCircle, Share2 } from 'lucide-react';
import { validatePassword, getPasswordStrength } from '../utils/utils';
import { formatDate, formatRole } from '../utils/utils';
import { USER_ROLES } from '../utils/constants';
import './Profile.css';

const Profile = () => {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [showShareAllModal, setShowShareAllModal] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
        setError('');
    };

    const validatePasswordForm = () => {
        const newErrors = {};

        if (!passwordData.currentPassword) {
            newErrors.currentPassword = 'Current password is required';
        }

        const passwordValidation = validatePassword(passwordData.newPassword);
        if (!passwordValidation.isValid) {
            newErrors.newPassword = 'Password must meet requirements';
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();

        if (!validatePasswordForm()) return;

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await api.changePassword(passwordData.currentPassword, passwordData.newPassword);
            setSuccess('Password changed successfully!');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setTimeout(() => {
                setShowChangePassword(false);
                setSuccess('');
            }, 2000);
        } catch (err) {
            setError(err.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    const passwordStrength = passwordData.newPassword ? getPasswordStrength(passwordData.newPassword) : null;
    const passwordValidation = validatePassword(passwordData.newPassword);

    return (
        <div className="profile-container">
            <div className="profile-header">
                <h1 className="profile-title">My Profile</h1>
                <p className="profile-subtitle">View and manage your account information</p>
            </div>

            <div className="profile-content">
                <Card glass className="profile-card">
                    <div className="profile-avatar-section">
                        <div className="profile-avatar-large">
                            {user?.firstName?.[0]}{user?.lastName?.[0]}
                        </div>
                        <div className="profile-name">
                            <h2>{user?.firstName} {user?.lastName}</h2>
                            <p className="profile-role">{formatRole(user?.role)}</p>
                        </div>
                    </div>

                    <div className="profile-info">
                        <div className="info-row">
                            <span className="info-label">Email</span>
                            <span className="info-value">{user?.email}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Phone</span>
                            <span className="info-value">{user?.phoneNumber || 'Not provided'}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Date of Birth</span>
                            <span className="info-value">{user?.dateOfBirth ? formatDate(user.dateOfBirth) : 'Not provided'}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Account Created</span>
                            <span className="info-value">{formatDate(user?.createdAt)}</span>
                        </div>
                    </div>
                </Card>

                {user?.role === USER_ROLES.PATIENT && (
                    <Card glass className="share-card">
                        <div className="card-header">
                            <h3>Share Medical Records</h3>
                        </div>
                        <div className="share-section">
                            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-lg)' }}>
                                Share all your medical records with doctors or lab assistants using QR code
                            </p>
                            <Button
                                variant="primary"
                                icon={<Share2 size={18} />}
                                onClick={() => setShowShareAllModal(true)}
                            >
                                Share All Records
                            </Button>
                        </div>
                    </Card>
                )}

                <Card glass className="password-card">
                    <div className="card-header">
                        <h3>Security</h3>
                    </div>

                    {!showChangePassword ? (
                        <div className="password-section">
                            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-lg)' }}>
                                Keep your account secure by using a strong password
                            </p>
                            <Button
                                variant="secondary"
                                icon={<Lock size={18} />}
                                onClick={() => setShowChangePassword(true)}
                            >
                                Change Password
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handlePasswordSubmit} className="password-form">
                            {error && (
                                <div className="error-alert">
                                    <AlertCircle size={20} />
                                    <span>{error}</span>
                                </div>
                            )}

                            {success && (
                                <div className="success-alert">
                                    <CheckCircle size={20} />
                                    <span>{success}</span>
                                </div>
                            )}

                            <Input
                                label="Current Password"
                                type="password"
                                name="currentPassword"
                                value={passwordData.currentPassword}
                                onChange={handlePasswordChange}
                                placeholder="Enter current password"
                                icon={<Lock size={18} />}
                                error={errors.currentPassword}
                                required
                            />

                            <Input
                                label="New Password"
                                type="password"
                                name="newPassword"
                                value={passwordData.newPassword}
                                onChange={handlePasswordChange}
                                placeholder="Enter new password"
                                icon={<Lock size={18} />}
                                error={errors.newPassword}
                                required
                            />

                            {passwordData.newPassword && (
                                <div className="password-strength">
                                    <div className="strength-bar">
                                        <div
                                            className="strength-fill"
                                            style={{
                                                width: passwordValidation.isValid ? '100%' : '33%',
                                                backgroundColor: passwordStrength?.color || '#6b7280'
                                            }}
                                        />
                                    </div>
                                    <div className="password-requirements">
                                        {passwordValidation.errors.map((error, i) => (
                                            <div key={i} className="requirement-item">
                                                <span className="requirement-icon">✗</span>
                                                {error}
                                            </div>
                                        ))}
                                        {passwordValidation.isValid && (
                                            <div className="requirement-item requirement-met">
                                                <CheckCircle size={14} />
                                                All requirements met!
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <Input
                                label="Confirm New Password"
                                type="password"
                                name="confirmPassword"
                                value={passwordData.confirmPassword}
                                onChange={handlePasswordChange}
                                placeholder="Confirm new password"
                                icon={<Lock size={18} />}
                                error={errors.confirmPassword}
                                required
                            />

                            <div className="form-actions">
                                <Button
                                    type="submit"
                                    variant="primary"
                                    loading={loading}
                                >
                                    {loading ? 'Changing...' : 'Change Password'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => {
                                        setShowChangePassword(false);
                                        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                                        setErrors({});
                                        setError('');
                                    }}
                                    disabled={loading}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    )}
                </Card>
            </div>

            <ShareAllModal
                isOpen={showShareAllModal}
                onClose={() => setShowShareAllModal(false)}
                patientId={user?._id}
            />
        </div>
    );
};

export default Profile;
