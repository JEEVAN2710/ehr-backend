import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import Button from './Button';
import { USER_ROLES } from '../utils/constants';
import './EditUserModal.css';

const EditUserModal = ({ isOpen, onClose, user, onSave }) => {
    const [formData, setFormData] = useState({
        email: '',
        role: '',
        phoneNumber: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                email: user.email || '',
                role: user.role || '',
                phoneNumber: user.phoneNumber || ''
            });
        }
    }, [user]);

    const validateForm = () => {
        const newErrors = {};

        // Email validation
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }

        // Role validation
        if (!formData.role) {
            newErrors.role = 'Role is required';
        }

        // Phone validation (if provided)
        if (formData.phoneNumber && !/^\d{10}$/.test(formData.phoneNumber.replace(/\D/g, ''))) {
            newErrors.phoneNumber = 'Please enter a valid 10-digit phone number';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            await onSave(user._id, formData);
            onClose();
        } catch (error) {
            setErrors({ submit: error.message || 'Failed to update user' });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    if (!user) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit User">
            <form onSubmit={handleSubmit} className="edit-user-form">
                <div className="form-group">
                    <label htmlFor="email">Email Address *</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={errors.email ? 'error' : ''}
                        placeholder="user@example.com"
                    />
                    {errors.email && <span className="error-message">{errors.email}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="role">Role *</label>
                    <select
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className={errors.role ? 'error' : ''}
                    >
                        <option value="">Select a role</option>
                        <option value={USER_ROLES.PATIENT}>Patient</option>
                        <option value={USER_ROLES.DOCTOR}>Doctor</option>
                        <option value={USER_ROLES.LAB_ASSISTANT}>Lab Assistant</option>
                        <option value={USER_ROLES.ADMIN}>Admin</option>
                    </select>
                    {errors.role && <span className="error-message">{errors.role}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="phoneNumber">Phone Number</label>
                    <input
                        id="phoneNumber"
                        name="phoneNumber"
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        className={errors.phoneNumber ? 'error' : ''}
                        placeholder="(123) 456-7890"
                    />
                    {errors.phoneNumber && <span className="error-message">{errors.phoneNumber}</span>}
                </div>

                {errors.submit && (
                    <div className="error-banner">
                        {errors.submit}
                    </div>
                )}

                <div className="modal-actions">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default EditUserModal;
