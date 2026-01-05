import React, { useState } from 'react';
import { Download, File, Image, FileText, AlertCircle } from 'lucide-react';
import api from '../services/api';
import Button from './Button';
import './FileList.css';

const FileList = ({ files, recordId, readOnly = false }) => {
    const [downloading, setDownloading] = useState({});
    const [error, setError] = useState('');

    const getFileIcon = (contentType) => {
        if (contentType.startsWith('image/')) {
            return <Image size={24} className="file-type-icon image" />;
        } else if (contentType === 'application/pdf') {
            return <FileText size={24} className="file-type-icon pdf" />;
        } else {
            return <File size={24} className="file-type-icon" />;
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleDownload = async (file) => {
        try {
            setError('');
            setDownloading(prev => ({ ...prev, [file.key]: true }));

            // Get presigned download URL
            const response = await api.getPresignedDownloadUrl(file.key, recordId);

            // Open download URL in new tab
            window.open(response.data.downloadUrl, '_blank');

        } catch (err) {
            setError(`Failed to download ${file.filename}: ${err.message}`);
            console.error('Download error:', err);
        } finally {
            setDownloading(prev => ({ ...prev, [file.key]: false }));
        }
    };

    if (!files || files.length === 0) {
        return (
            <div className="no-files">
                <File size={48} className="no-files-icon" />
                <p>No files attached</p>
            </div>
        );
    }

    return (
        <div className="file-list-container">
            {error && (
                <div className="file-error">
                    <AlertCircle size={18} />
                    <span>{error}</span>
                </div>
            )}

            <div className="file-list">
                {files.map((file, index) => (
                    <div key={file.key || index} className="file-item">
                        <div className="file-item-icon">
                            {getFileIcon(file.contentType)}
                        </div>

                        <div className="file-item-details">
                            <h4 className="file-name">{file.filename}</h4>
                            <div className="file-meta">
                                <span className="file-size">{formatFileSize(file.size)}</span>
                                {file.uploadedAt && (
                                    <>
                                        <span className="separator">•</span>
                                        <span className="file-date">{formatDate(file.uploadedAt)}</span>
                                    </>
                                )}
                            </div>
                        </div>

                        {!readOnly && (
                            <Button
                                onClick={() => handleDownload(file)}
                                variant="ghost"
                                size="sm"
                                loading={downloading[file.key]}
                                icon={<Download size={16} />}
                            >
                                {downloading[file.key] ? 'Downloading...' : 'Download'}
                            </Button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FileList;
