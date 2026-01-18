import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Modal from './Modal';
import Button from './Button';
import { Download, Copy, Check, QrCode as QrIcon } from 'lucide-react';
import './ShareQRModal.css';

const ShareQRModal = ({ isOpen, onClose, shareLink, expiresAt }) => {
    const [copied, setCopied] = useState(false);

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy link:', err);
        }
    };

    const handleDownloadQR = () => {
        const svg = document.getElementById('share-qr-code');
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);

            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'patient-records-qr.png';
                a.click();
                URL.revokeObjectURL(url);
            });
        };

        img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    };

    const formatExpiry = (dateString) => {
        if (!dateString) return 'Unknown';
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Share Your Medical Records"
            size="md"
        >
            <div className="share-qr-content">
                <div className="qr-section">
                    <div className="qr-code-container">
                        <QRCodeSVG
                            id="share-qr-code"
                            value={shareLink}
                            size={256}
                            level="H"
                            includeMargin={true}
                        />
                    </div>
                    <p className="qr-instructions">
                        <QrIcon size={16} />
                        Scan this QR code with a phone camera to access records
                    </p>
                </div>

                <div className="link-section">
                    <label className="section-label">Share Link</label>
                    <div className="link-input-group">
                        <input
                            type="text"
                            value={shareLink}
                            readOnly
                            className="link-input"
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
                </div>

                <div className="expiry-info">
                    <strong>Expires:</strong> {formatExpiry(expiresAt)}
                </div>

                <div className="modal-actions">
                    <Button
                        variant="primary"
                        onClick={handleDownloadQR}
                        icon={<Download size={18} />}
                        fullWidth
                    >
                        Download QR Code
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        fullWidth
                    >
                        Close
                    </Button>
                </div>

                <div className="security-note">
                    <p><strong>Note:</strong> This link allows anyone to view all your medical records until it expires. Share it only with trusted healthcare providers.</p>
                </div>
            </div>
        </Modal>
    );
};

export default ShareQRModal;
