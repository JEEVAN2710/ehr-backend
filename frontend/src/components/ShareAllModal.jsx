import React, { useState } from 'react';
import Modal from './Modal';
import Button from './Button';
import api from '../services/api';
import { QRCodeSVG } from 'qrcode.react';
import { Clock, Share2, Copy, Check } from 'lucide-react';
import './ShareAllModal.css';

const ShareAllModal = ({ isOpen, onClose, patientId }) => {
    const [duration, setDuration] = useState('24h');
    const [shareLink, setShareLink] = useState('');
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const durations = [
        { value: '4h', label: '4 Hours' },
        { value: '24h', label: '24 Hours' },
        { value: '7d', label: '7 Days' }
    ];

    const generateShareLink = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await api.generateShareAllToken(duration);
            setShareLink(response.data.shareLink);
        } catch (err) {
            setError(err.message || 'Failed to generate share link');
        } finally {
            setLoading(false);
        }
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
        setError('');
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

                {error && (
                    <div className="error-banner">
                        <p>{error}</p>
                    </div>
                )}

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
                        loading={loading}
                        disabled={loading}
                    >
                        {loading ? 'Generating...' : 'Generate QR Code'}
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
