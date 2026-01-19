import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';
import './ConfirmModal.css';

const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'danger', // 'danger', 'warning', 'primary'
    loading = false
}) => {
    const [isConfirming, setIsConfirming] = useState(false);

    const handleConfirm = async () => {
        setIsConfirming(true);
        try {
            await onConfirm();
            onClose();
        } catch (error) {
            // Error handling in parent component
        } finally {
            setIsConfirming(false);
        }
    };

    const getIcon = () => {
        switch (variant) {
            case 'danger':
            case 'warning':
                return <AlertTriangle size={24} />;
            default:
                return null;
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="confirm-modal">
            <div className="modal-header">
                <div className={`header-icon ${variant}`}>
                    {getIcon()}
                </div>
                <div>
                    <h2>{title}</h2>
                </div>
                <button className="close-button" onClick={onClose} disabled={isConfirming}>
                    <X size={20} />
                </button>
            </div>

            <div className="modal-body">
                <p className="confirm-message">{message}</p>
            </div>

            <div className="modal-footer">
                <Button
                    variant="secondary"
                    onClick={onClose}
                    disabled={isConfirming || loading}
                >
                    {cancelText}
                </Button>
                <Button
                    variant={variant}
                    onClick={handleConfirm}
                    loading={isConfirming || loading}
                >
                    {confirmText}
                </Button>
            </div>
        </Modal>
    );
};

export default ConfirmModal;
