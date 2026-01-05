import React, { useState } from 'react';
import Modal from './Modal';
import Button from './Button';
import { QRCodeSVG } from 'qrcode.react';
import { Clock, Share2, Copy, Check } from 'lucide-react';
import './ShareRecordModal.css';

const ShareRecordModal = ({ isOpen, onClose, record }) => {
    const [duration, setDuration] = useState('24h');
    const [shareLink, setShareLink] = useState('');
    const [copied, setCopied] = useState(false);

    const durations = [
        { value: '4h', label: '4 Hours' },
        { value: '24h', label: '24 Hours' },
        { value: '7d', label: '7 Days' }
    ];

    const generateShareLink = () => {
        // Generate expiry timestamp
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

        // Generate shareable link (in production, this would be a backend-generated token)
        const token = btoa(`${record._id}-${expiryTime.getTime()}-${Math.random()}`);
        const link = `${window.location.origin}/shared/${token}`;

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

    if (!record) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Share Medical Record"
            size="md"
        >
            <div className="share-record-content">
                <div className="record-info">
                    <h4>{record.title}</h4>
                    <p className="record-type">{record.recordType}</p>
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
                                size={200}
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
                                This link will expire in {durations.find(d => d.value === duration)?.label.toLowerCase()}
                            </p>
                        </div>

                        <div className="share-instructions">
                            <h5>How to use:</h5>
                            <ul>
                                <li>Scan the QR code with a smartphone camera</li>
                                <li>Or copy and share the link directly</li>
                                <li>The recipient can view the record until it expires</li>
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default ShareRecordModal;
