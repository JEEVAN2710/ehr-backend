import React, { useState } from 'react';
import Modal from './Modal';
import Button from './Button';
import Input from './Input';
import { QrCode, Link, CheckCircle, AlertCircle } from 'lucide-react';
import './ScanQRModal.css';

const ScanQRModal = ({ isOpen, onClose, onAccessRecords }) => {
    const [shareLink, setShareLink] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const validateAndAccessLink = async () => {
        setError('');
        setSuccess(false);

        if (!shareLink.trim()) {
            setError('Please enter a valid share link');
            return;
        }

        // Extract token from link - support both full URLs and just tokens
        // Pattern matches: /shared/all/TOKEN or just TOKEN
        const linkPattern = /\/shared\/all\/([A-Za-z0-9_-]+)$|^([A-Za-z0-9_-]+)$/;
        const match = shareLink.match(linkPattern);

        if (!match) {
            setError('Invalid share link format');
            return;
        }

        const token = match[1] || match[2];
        setLoading(true);

        try {
            // Call the backend API to get records using the token
            const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
            const response = await fetch(`${API_BASE_URL}/api/records/shared/all/${token}`);
            const data = await response.json();

            if (!response.ok) {
                if (response.status === 404) {
                    setError('Invalid share link');
                } else if (response.status === 401) {
                    setError(data.message || 'This share link has expired');
                } else {
                    setError(data.message || 'Failed to access records');
                }
                setLoading(false);
                return;
            }

            // Success - notify parent component with actual data from backend
            setSuccess(true);

            setTimeout(() => {
                if (onAccessRecords) {
                    onAccessRecords({
                        token,
                        isAllRecords: true,
                        patient: data.data.patient,
                        records: data.data.records,
                        expiresAt: data.data.expiresAt,
                        accessCount: data.data.accessCount
                    });
                }
                handleClose();
            }, 1500);

        } catch (err) {
            console.error('Failed to access share link:', err);
            setError('Failed to process share link. Please check and try again.');
            setLoading(false);
        }
    };

    const handleClose = () => {
        setShareLink('');
        setError('');
        setSuccess(false);
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Access Patient Records"
            size="md"
        >
            <div className="scan-qr-content">
                <div className="info-section">
                    <QrCode size={48} style={{ color: 'var(--color-primary)' }} />
                    <h4>Scan QR Code or Enter Link</h4>
                    <p>Enter the share link provided by the patient to access their medical records</p>
                </div>

                <Input
                    label="Share Link"
                    type="text"
                    value={shareLink}
                    onChange={(e) => {
                        setShareLink(e.target.value);
                        setError('');
                        setSuccess(false);
                    }}
                    placeholder="Paste patient's share link here..."
                    icon={<Link size={18} />}
                    error={error}
                />

                {success && (
                    <div className="success-message">
                        <CheckCircle size={20} />
                        <span>Access granted! Loading patient records...</span>
                    </div>
                )}

                {error && !success && (
                    <div className="error-message">
                        <AlertCircle size={20} />
                        <span>{error}</span>
                    </div>
                )}

                <div className="modal-actions">
                    <Button
                        variant="primary"
                        fullWidth
                        onClick={validateAndAccessLink}
                        loading={loading}
                        disabled={success}
                    >
                        {success ? 'Accessing...' : 'Access Records'}
                    </Button>
                    <Button
                        variant="ghost"
                        fullWidth
                        onClick={handleClose}
                        disabled={loading || success}
                    >
                        Cancel
                    </Button>
                </div>

                <div className="instructions-box">
                    <h5>How to use:</h5>
                    <ul>
                        <li>Ask patient to share their records via QR code</li>
                        <li>Scan the QR code with your phone camera</li>
                        <li>Copy the link and paste it above</li>
                        <li>Or have the patient send you the link directly</li>
                    </ul>
                </div>
            </div>
        </Modal>
    );
};

export default ScanQRModal;
