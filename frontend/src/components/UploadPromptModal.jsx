import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { UploadCloud, Clock, FileCheck, Shield } from 'lucide-react';
import './UploadPromptModal.css';

const UploadPromptModal = ({ isOpen, onClose, daysRemaining, onUpload }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="">
            <div className="upload-prompt-modal">
                <div className="upload-icon-wrapper">
                    <UploadCloud size={64} className="upload-icon" />
                </div>

                <h2 className="upload-title">📤 Upload Your Old Medical Records</h2>

                <div className="days-remaining">
                    <Clock size={20} />
                    <span>You have <strong>{daysRemaining} day{daysRemaining === 1 ? '' : 's'}</strong> remaining</span>
                </div>

                <p className="upload-description">
                    Digitize your historical medical records now. After this period, only doctors can add records.
                </p>

                <div className="features-list">
                    <div className="feature-item">
                        <FileCheck size={18} className="feature-icon" />
                        <span>Upload PDFs and images</span>
                    </div>
                    <div className="feature-item">
                        <Shield size={18} className="feature-icon" />
                        <span>AI verifies documents automatically</span>
                    </div>
                    <div className="feature-item">
                        <FileCheck size={18} className="feature-icon" />
                        <span>Duplicate detection included</span>
                    </div>
                </div>

                <div className="modal-actions">
                    <Button variant="secondary" onClick={onClose} fullWidth>
                        Later
                    </Button>
                    <Button variant="primary" onClick={onUpload} fullWidth>
                        Upload Now
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default UploadPromptModal;
