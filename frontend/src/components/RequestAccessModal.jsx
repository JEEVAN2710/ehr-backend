import { useState } from 'react';
import { X, UserPlus, Send } from 'lucide-react';
import Modal from './Modal';
import Input from './Input';
import Button from './Button';
import api from '../services/api';
import './RequestAccessModal.css';

const RequestAccessModal = ({ isOpen, onClose, onSuccess }) => {
    const [patientEmail, setPatientEmail] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!patientEmail.trim()) {
            setError('Please enter patient email address');
            return;
        }

        // Simple email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(patientEmail)) {
            setError('Please enter a valid email address');
            return;
        }

        try {
            setLoading(true);
            await api.requestAccess(patientEmail, message);

            // Success
            if (onSuccess) {
                onSuccess();
            }
            handleClose();
        } catch (err) {
            setError(err.message || 'Failed to send access request');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setPatientEmail('');
        setMessage('');
        setError('');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} className="request-access-modal">
            <div className="modal-header">
                <div className="header-icon">
                    <UserPlus size={24} />
                </div>
                <div>
                    <h2>Request Patient Access</h2>
                    <p className="modal-subtitle">
                        Request access to view a patient's medical records
                    </p>
                </div>
                <button className="close-button" onClick={handleClose}>
                    <X size={20} />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-body">
                <div className="form-group">
                    <label htmlFor="patientEmail">Patient Email Address *</label>
                    <Input
                        id="patientEmail"
                        type="email"
                        placeholder="patient@example.com"
                        value={patientEmail}
                        onChange={(e) => setPatientEmail(e.target.value)}
                        disabled={loading}
                        required
                    />
                    <p className="field-hint">
                        Enter the email address of the patient whose records you want to access
                    </p>
                </div>

                <div className="form-group">
                    <label htmlFor="requestMessage">Message (Optional)</label>
                    <textarea
                        id="requestMessage"
                        className="request-textarea"
                        placeholder="e.g., I need access to review your medical history for an upcoming consultation..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        disabled={loading}
                        maxLength={500}
                        rows={4}
                    />
                    <p className="field-hint">
                        {message.length}/500 characters
                    </p>
                </div>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <div className="info-box">
                    <p><strong>What happens next?</strong></p>
                    <ul>
                        <li>The patient will receive a notification about your request</li>
                        <li>They can approve or deny access to their records</li>
                        <li>If approved, you'll get access to all their medical records</li>
                        <li>Requests expire after 7 days if not responded to</li>
                    </ul>
                </div>

                <div className="modal-footer">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={handleClose}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        icon={<Send size={18} />}
                        loading={loading}
                    >
                        Send Request
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default RequestAccessModal;
