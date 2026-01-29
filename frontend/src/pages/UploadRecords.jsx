import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import Badge from '../components/Badge';
import { Upload, FileText, Image, CheckCircle, XCircle, Clock, AlertCircle, Shield } from 'lucide-react';
import './UploadRecords.css';

const UploadRecords = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({});
    const [eligibility, setEligibility] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        checkEligibility();
    }, []);

    const checkEligibility = async () => {
        try {
            const response = await api.checkUploadEligibility();

            if (!response.canUpload) {
                // User cannot upload - redirect to dashboard
                navigate('/dashboard');
                return;
            }

            setEligibility(response);
        } catch (error) {
            console.error('Failed to check eligibility:', error);
            setError('Failed to verify upload eligibility');
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (e) => {
        const selectedFiles = Array.from(e.target.files);

        // Filter for PDF and images only
        const validFiles = selectedFiles.filter(file => {
            const isValid = file.type === 'application/pdf' || file.type.startsWith('image/');
            return isValid && file.size <= 50 * 1024 * 1024; // 50MB limit
        });

        if (validFiles.length !== selectedFiles.length) {
            setError('Some files were skipped. Only PDF and image files under 50MB are allowed.');
        }

        setFiles(prev => [...prev, ...validFiles.map(file => ({
            file,
            id: Math.random().toString(36).substr(2, 9),
            status: 'pending', // pending, uploading, success, error
            progress: 0
        }))]);

        // Clear file input
        e.target.value = '';
    };

    const removeFile = (id) => {
        setFiles(prev => prev.filter(f => f.id !== id));
    };

    const uploadFiles = async () => {
        if (files.length === 0) {
            setError('Please select at least one file');
            return;
        }

        setUploading(true);
        setError('');

        try {
            // Upload each file
            for (const fileItem of files) {
                if (fileItem.status === 'success') continue;

                // Update status to uploading
                setFiles(prev => prev.map(f =>
                    f.id === fileItem.id ? { ...f, status: 'uploading' } : f
                ));

                try {
                    // Step 1: Get presigned URL
                    const presignedRes = await api.getPresignedUploadUrl({
                        filename: fileItem.file.name,
                        contentType: fileItem.file.type
                    });

                    const { uploadUrl, key } = presignedRes.data;

                    // Step 2: Upload to R2
                    const uploadResponse = await fetch(uploadUrl, {
                        method: 'PUT',
                        body: fileItem.file,
                        headers: {
                            'Content-Type': fileItem.file.type
                        }
                    });

                    if (!uploadResponse.ok) {
                        throw new Error('Upload failed');
                    }

                    // Step 3: Create record in database (without files)
                    const recordResponse = await api.createRecord({
                        patientId: user._id,
                        title: fileItem.file.name.replace(/\.[^/.]+$/, ''), // Remove extension
                        description: `Self-uploaded medical record`,
                        recordType: 'other'
                    });

                    // Step 4: Add file to the record
                    await api.addFileToRecord(recordResponse.data._id, {
                        fileKey: key,
                        filename: fileItem.file.name,
                        contentType: fileItem.file.type,
                        size: fileItem.file.size
                    });

                    // Mark as success
                    setFiles(prev => prev.map(f =>
                        f.id === fileItem.id ? { ...f, status: 'success', progress: 100 } : f
                    ));

                } catch (error) {
                    console.error(`Failed to upload ${fileItem.file.name}:`, error);

                    // Set error message with details if available
                    const errorMsg = error.message || 'Upload failed';
                    setError(errorMsg + (error.hint ? ` Hint: ${error.hint}` : ''));

                    setFiles(prev => prev.map(f =>
                        f.id === fileItem.id ? { ...f, status: 'error' } : f
                    ));
                }
            }

            // Check if all succeeded
            const allSuccess = files.every(f => f.status === 'success');
            if (allSuccess) {
                setTimeout(() => {
                    navigate('/dashboard');
                }, 2000);
            }

        } catch (error) {
            setError(error.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return <LoadingSpinner text="Checking eligibility..." />;
    }

    if (!eligibility || !eligibility.canUpload) {
        return null; // Will redirect
    }

    const getFileIcon = (file) => {
        if (file.type === 'application/pdf') return <FileText size={24} />;
        if (file.type.startsWith('image/')) return <Image size={24} />;
        return <FileText size={24} />;
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'uploading':
                return <Clock size={18} className="status-icon uploading" />;
            case 'success':
                return <CheckCircle size={18} className="status-icon success" />;
            case 'error':
                return <XCircle size={18} className="status-icon error" />;
            default:
                return null;
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
        <div className="upload-records-container">
            <div className="upload-header">
                <div>
                    <h1 className="upload-title">
                        <Upload size={32} />
                        Upload Your Medical Records
                    </h1>
                    <p className="upload-subtitle">
                        Digitize your historical medical records during your 10-day upload window
                    </p>
                </div>

                <Badge color={eligibility.daysRemaining <= 2 ? 'error' : eligibility.daysRemaining <= 5 ? 'warning' : 'success'}>
                    <Clock size={16} />
                    {eligibility.daysRemaining} day{eligibility.daysRemaining === 1 ? '' : 's'} remaining
                </Badge>
            </div>

            <div className="upload-info-cards">
                <Card className="info-card">
                    <Shield size={24} className="info-icon" />
                    <div>
                        <h3>AI Verification</h3>
                        <p>Documents are automatically verified using AI</p>
                    </div>
                </Card>
                <Card className="info-card">
                    <FileText size={24} className="info-icon" />
                    <div>
                        <h3>Supported Formats</h3>
                        <p>PDF documents and images (JPG, PNG)</p>
                    </div>
                </Card>
                <Card className="info-card">
                    <AlertCircle size={24} className="info-icon" />
                    <div>
                        <h3>One-Time Only</h3>
                        <p>After this window, only doctors can add records</p>
                    </div>
                </Card>
            </div>

            {error && (
                <div className="error-alert">
                    <AlertCircle size={20} />
                    <span>{error}</span>
                </div>
            )}

            <Card className="upload-card">
                <div className="upload-zone">
                    <input
                        type="file"
                        id="file-input"
                        multiple
                        accept=".pdf,image/*"
                        onChange={handleFileSelect}
                        disabled={uploading}
                        style={{ display: 'none' }}
                    />
                    <label htmlFor="file-input" className="upload-label">
                        <Upload size={48} />
                        <h3>Click to select files</h3>
                        <p>or drag and drop files here</p>
                        <p className="upload-hint">PDF and images up to 50MB each</p>
                    </label>
                </div>

                {files.length > 0 && (
                    <div className="files-list">
                        <h3>Selected Files ({files.length})</h3>
                        {files.map(fileItem => (
                            <div key={fileItem.id} className={`file-item ${fileItem.status}`}>
                                <div className="file-info">
                                    <div className="file-icon">
                                        {getFileIcon(fileItem.file)}
                                    </div>
                                    <div className="file-details">
                                        <div className="file-name">{fileItem.file.name}</div>
                                        <div className="file-size">{formatFileSize(fileItem.file.size)}</div>
                                    </div>
                                </div>
                                <div className="file-actions">
                                    {getStatusIcon(fileItem.status)}
                                    {fileItem.status === 'pending' && !uploading && (
                                        <button
                                            onClick={() => removeFile(fileItem.id)}
                                            className="remove-btn"
                                        >
                                            <XCircle size={18} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="upload-actions">
                    <Button
                        variant="secondary"
                        onClick={() => navigate('/dashboard')}
                        disabled={uploading}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={uploadFiles}
                        disabled={files.length === 0 || uploading}
                        loading={uploading}
                    >
                        {uploading ? 'Uploading...' : `Upload ${files.length} File${files.length === 1 ? '' : 's'}`}
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default UploadRecords;
