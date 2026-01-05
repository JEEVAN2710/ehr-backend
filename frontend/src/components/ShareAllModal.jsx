import React, { useState } from 'react';
import Modal from './Modal';
import Button from './Button';
import { QRCodeSVG } from 'qrcode.react';
import { Clock, Share2, Copy, Check } from 'lucide-react';
import './ShareAllModal.css';

const ShareAllModal = ({ isOpen, onClose, patientId }) => {
    const [duration, setDuration] = useState('24h');
    const [shareLink, setShareLink] = useState('');
    const [copied, setCopied] = useState(false);

    const durations = [
        { value: '4h', label: '4 Hours' },
        { value: '24h', label: '24 Hours' },
        { value: '7d', label: '7 Days' }
    ];

    const generateShareLink = () => {
        const now = new Date();
        let expiryTime;

        switch (duration) {
            case '4h':
                expiryTime = new Date(now.getTime() + 4 * 60 * 60 * 1000);
                break;
            case '24h':
                expiryTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);
                break;
            case '7d':
                expiryTime = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                break;
            default:
                expiryTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        }

        // Generate shareable link for all records
        const token = btoa(`all-records-${patientId}-${expiryTime.getTime()}-${Math.random()}`);
        const link = `${window.location.origin}/shared/all/${token}`;

        setShareLink(link);
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(shareLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleClose = () => {
        setShareLink('');
        setCopied(false);
        setDuration('24h');
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Share All Medical Records"
            size="md"
        >
            <div className="share-all-content">
                <div className="info-banner">
                    <p>Generate a QR code to share all your medical records with doctors or lab assistants</p>
                </div>

                <div className="duration-section">
                    <label className="section-label">
                        <Clock size={18} />
                        <span>Share Duration</span>
                    </label>
                    <div className="duration-options">
                        {durations.map(d => (
                            <button
                                key={d.value}
                                className={`duration-btn ${duration === d.value ? 'active' : ''}`}
                                onClick={() => setDuration(d.value)}
                            >
                                {d.label}
                            </button>
                        ))}
                    </div>
                </div>

                {!shareLink ? (
                    <Button
                        variant="primary"
                        fullWidth
                        icon={<Share2 size={18} />}
                        onClick={generateShareLink}
                    >
                        Generate QR Code
                    </Button>
                ) : (
                    <div className="share-result">
                        <div className="qr-container">
                            <QRCodeSVG
                                value={shareLink}
                                size={220}
                                level="H"
                                includeMargin={true}
                                bgColor="#111827"
                                fgColor="#ffffff"
                            />
                        </div>

                        <div className="share-link-section">
                            <label className="section-label">Shareable Link</label>
                            <div className="link-input-group">
                                <input
                                    type="text"
                                    value={shareLink}
                                    readOnly
                                    className="share-link-input"
                                />
                                <Button
                                    variant={copied ? 'success' : 'secondary'}
                                    size="sm"
                                    icon={copied ? <Check size={16} /> : <Copy size={16} />}
                                    onClick={handleCopyLink}
                                >
                                    {copied ? 'Copied!' : 'Copy'}
                                </Button>
                            </div>
                            <p className="expiry-note">
                                All your records will be accessible for {durations.find(d => d.value === duration)?.label.toLowerCase()}
                            </p>
                        </div>

                        <div className="share-instructions">
                            <h5>What's included:</h5>
                            <ul>
                                <li>All your current medical records</li>
                                <li>Prescriptions, lab tests, scans, and reports</li>
                                <li>Read-only access for recipients</li>
                                <li>Automatically expires after selected duration</li>
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default ShareAllModal;
