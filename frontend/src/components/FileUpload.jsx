import React, { useState, useRef } from 'react';
import { Upload, X, File, AlertCircle, CheckCircle } from 'lucide-react';
import Button from './Button';
import './FileUpload.css';

const FileUpload = ({ onFileUploaded, maxSize = 10 * 1024 * 1024, accept }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [dragging, setDragging] = useState(false);
    const fileInputRef = useRef(null);

    const allowedTypes = accept || [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/jpg',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];

    const validateFile = (file) => {
        if (!file) return 'Please select a file';

        if (!allowedTypes.includes(file.type)) {
            return `File type not allowed. Allowed: PDF, Images, Word, Excel`;
        }

        if (file.size > maxSize) {
            return `File too large. Max size: ${(maxSize / 1024 / 1024).toFixed(0)}MB`;
        }

        return null;
    };

    const handleFileSelect = (file) => {
        setError('');
        setSuccess(false);
        setProgress(0);

        const validationError = validateFile(file);
        if (validationError) {
            setError(validationError);
            return;
        }

        setSelectedFile(file);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragging(true);
    };

    const handleDragLeave = () => {
        setDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        handleFileSelect(file);
    };

    const handleInputChange = (e) => {
        const file = e.target.files[0];
        handleFileSelect(file);
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setError('Please select a file first');
            return;
        }

        try {
            setUploading(true);
            setError('');
            setProgress(10);

            // Call parent callback with file info
            await onFileUploaded(selectedFile, (progressPercent) => {
                setProgress(progressPercent);
            });

            setProgress(100);
            setSuccess(true);
            setSelectedFile(null);

            // Reset after 2 seconds
            setTimeout(() => {
                setSuccess(false);
                setProgress(0);
            }, 2000);
        } catch (err) {
            setError(err.message || 'Upload failed. Please try again.');
            setProgress(0);
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = () => {
        setSelectedFile(null);
        setError('');
        setSuccess(false);
        setProgress(0);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    return (
        <div className="file-upload-container">
            {!selectedFile ? (
                <div
                    className={`drop-zone ${dragging ? 'dragging' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <Upload size={48} className="upload-icon" />
                    <h3>Drag and drop file here</h3>
                    <p>or click to browse</p>
                    <p className="file-hint">PDF, Images, Word, Excel (Max {(maxSize / 1024 / 1024).toFixed(0)}MB)</p>
                    <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleInputChange}
                        accept={allowedTypes.join(',')}
                        style={{ display: 'none' }}
                    />
                </div>
            ) : (
                <div className="file-selected">
                    <div className="file-info">
                        <File size={40} className="file-icon" />
                        <div className="file-details">
                            <h4>{selectedFile.name}</h4>
                            <p>{formatFileSize(selectedFile.size)}</p>
                        </div>
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="remove-btn"
                            disabled={uploading}
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {progress > 0 && progress < 100 && (
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${progress}%` }} />
                        </div>
                    )}

                    <Button
                        onClick={handleUpload}
                        variant="primary"
                        fullWidth
                        loading={uploading}
                        disabled={uploading || success}
                    >
                        {uploading ? 'Uploading...' : success ? 'Uploaded!' : 'Upload File'}
                    </Button>
                </div>
            )}

            {error && (
                <div className="upload-error">
                    <AlertCircle size={18} />
                    <span>{error}</span>
                </div>
            )}

            {success && (
                <div className="upload-success">
                    <CheckCircle size={18} />
                    <span>File uploaded successfully!</span>
                </div>
            )}
        </div>
    );
};

export default FileUpload;
