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

        // Check if it's a valid share link format
        const linkPattern = /\/shared\/(all\/)?([A-Za-z0-9+/=]+)$/;
        if (!shareLink.match(linkPattern)) {
            setError('Invalid share link format');
            return;
        }

        setLoading(true);

        try {
            // Extract token from link
            const match = shareLink.match(linkPattern);
            const token = match[2];

            // Decode token to get info
            const decoded = atob(token);
            const parts = decoded.split('-');

            // Check if token has expired
            const expiryTime = parseInt(parts[parts.length - 2]);
            if (Date.now() > expiryTime) {
                setError('This share link has expired');
                setLoading(false);
                return;
            }

            // Success - notify parent component
            setSuccess(true);

            setTimeout(() => {
                if (onAccessRecords) {
                    onAccessRecords({
                        token,
                        isAllRecords: shareLink.includes('/shared/all/'),
                        patientId: parts[1] || parts[2],
                        expiryTime: new Date(expiryTime)
                    });
                }
                handleClose();
            }, 1500);

        } catch (err) {
            setError('Failed to process share link. Please check and try again.');
        } finally {
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
