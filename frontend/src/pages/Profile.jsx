import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import ShareAllModal from '../components/ShareAllModal';
import { Lock, AlertCircle, CheckCircle, Share2, Edit2, Phone, Calendar, Camera, Link } from 'lucide-react';
import { validatePassword, getPasswordStrength } from '../utils/utils';
import { formatDate, formatRole } from '../utils/utils';
import { USER_ROLES } from '../utils/constants';
import './Profile.css';

const Profile = () => {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [showShareAllModal, setShowShareAllModal] = useState(false);
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [profileData, setProfileData] = useState({
        phoneNumber: user?.phoneNumber || '',
        dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
        profilePhotoUrl: user?.profilePhotoUrl || ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [profileLoading, setProfileLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [profileSuccess, setProfileSuccess] = useState('');
    const [profileError, setProfileError] = useState('');

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

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
        setProfileError('');
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setProfileLoading(true);
        setProfileError('');
        setProfileSuccess('');

        try {
            const response = await api.updateProfile(profileData);
            updateUser(response.data.user);
            setProfileSuccess('Profile updated successfully!');
            setTimeout(() => {
                setShowEditProfile(false);
                setProfileSuccess('');
            }, 2000);
        } catch (err) {
            setProfileError(err.message || 'Failed to update profile');
        } finally {
            setProfileLoading(false);
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
                        <div className="profile-avatar-large" style={user?.profilePhotoUrl ? { padding: 0, overflow: 'hidden', border: 'none' } : {}}>
                            {user?.profilePhotoUrl ? (
                                <img 
                                    key={`avatar-${user.profilePhotoUrl}`}
                                    src={user.profilePhotoUrl} 
                                    alt="Profile" 
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
                                />
                            ) : null}
                            <span style={user?.profilePhotoUrl ? { display: 'none' } : {}}>
                                {user?.firstName?.[0]}{user?.lastName?.[0]}
                            </span>
                        </div>
                        <div className="profile-name">
                            <h2>{user?.firstName} {user?.lastName}</h2>
                            <p className="profile-role">{formatRole(user?.role)}</p>
                        </div>
                    </div>

                    {!showEditProfile ? (
                        <>
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
                                {user?.profilePhotoUrl && (
                                    <div className="info-row">
                                        <span className="info-label">Profile Photo</span>
                                        <span className="info-value" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Camera size={14} />
                                            <a href={user.profilePhotoUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'underline', wordBreak: 'break-all' }}>
                                                View Photo
                                            </a>
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div style={{ marginTop: 'var(--spacing-lg)', paddingTop: 'var(--spacing-lg)', borderTop: '1px solid var(--color-border)' }}>
                                <Button
                                    variant="secondary"
                                    icon={<Edit2 size={18} />}
                                    onClick={() => setShowEditProfile(true)}
                                >
                                    Edit Profile
                                </Button>
                            </div>
                        </>
                    ) : (
                        <form onSubmit={handleProfileSubmit} style={{ padding: 'var(--spacing-lg)' }}>
                            {profileError && (
                                <div className="error-alert">
                                    <AlertCircle size={20} />
                                    <span>{profileError}</span>
                                </div>
                            )}

                            {profileSuccess && (
                                <div className="success-alert">
                                    <CheckCircle size={20} />
                                    <span>{profileSuccess}</span>
                                </div>
                            )}

                            <Input
                                label="Phone Number"
                                type="tel"
                                name="phoneNumber"
                                value={profileData.phoneNumber}
                                onChange={handleProfileChange}
                                placeholder="+1234567890"
                                icon={<Phone size={18} />}
                                error={errors.phoneNumber}
                            />

                            <Input
                                label="Date of Birth"
                                type="date"
                                name="dateOfBirth"
                                value={profileData.dateOfBirth}
                                onChange={handleProfileChange}
                                icon={<Calendar size={18} />}
                                error={errors.dateOfBirth}
                            />

                            <div className="input-group" style={{ marginBottom: 'var(--spacing-lg)' }}>
                                <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
                                    Profile Photo
                                </label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    {profileData.profilePhotoUrl ? (
                                        <div style={{ position: 'relative' }}>
                                            <img 
                                                src={profileData.profilePhotoUrl} 
                                                alt="Preview" 
                                                style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-border)' }}
                                                onError={(e) => { e.target.style.display = 'none'; }}
                                            />
                                        </div>
                                    ) : (
                                        <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--color-background-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed var(--color-border)' }}>
                                            <Camera size={24} color="var(--color-text-tertiary)" />
                                        </div>
                                    )}
                                    
                                    <div style={{ flex: 1 }}>
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            id="photo-upload"
                                            style={{ display: 'none' }}
                                            onChange={async (e) => {
                                                const file = e.target.files[0];
                                                if (!file) return;
                                                
                                                if (file.size > 5 * 1024 * 1024) {
                                                    setProfileError('Photo must be less than 5MB');
                                                    return;
                                                }
                                                
                                                setProfileError('');
                                                setProfileLoading(true);
                                                try {
                                                    const publicUrl = await api.uploadProfilePhoto(file, user._id);
                                                    setProfileData(prev => ({ ...prev, profilePhotoUrl: publicUrl }));
                                                    
                                                    // Auto-submit profile update so avatar updates everywhere instantly
                                                    const response = await api.updateProfile({ ...profileData, profilePhotoUrl: publicUrl });
                                                    updateUser(response.data.user);
                                                    setProfileSuccess('Profile photo updated successfully!');
                                                    setTimeout(() => setProfileSuccess(''), 3000);
                                                } catch (err) {
                                                    setProfileError('Failed to upload photo: ' + err.message);
                                                } finally {
                                                    setProfileLoading(false);
                                                }
                                            }}
                                        />
                                        <Button 
                                            type="button" 
                                            variant="secondary" 
                                            onClick={() => document.getElementById('photo-upload').click()}
                                            disabled={profileLoading}
                                            icon={<Camera size={16} />}
                                            style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                                        >
                                            {profileLoading ? 'Uploading...' : (profileData.profilePhotoUrl ? 'Change Photo' : 'Upload Photo')}
                                        </Button>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-tertiary)', marginTop: '6px' }}>
                                            JPG, PNG or WebP. Max 5MB.
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="form-actions">
                                <Button
                                    type="submit"
                                    variant="primary"
                                    loading={profileLoading}
                                >
                                    {profileLoading ? 'Saving...' : 'Save Changes'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => {
                                        setShowEditProfile(false);
                                        setProfileData({
                                            phoneNumber: user?.phoneNumber || '',
                                            dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
                                            profilePhotoUrl: user?.profilePhotoUrl || ''
                                        });
                                        setErrors({});
                                        setProfileError('');
                                    }}
                                    disabled={profileLoading}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    )}
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
