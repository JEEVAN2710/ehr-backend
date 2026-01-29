import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import BlockchainAudit from '../components/BlockchainAudit';
import { ArrowLeft, Download, FileText, Calendar, User, AlertCircle, Shield, Info } from 'lucide-react';
import './ViewRecord.css';

const ViewRecord = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [record, setRecord] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('details'); // 'details' or 'blockchain'

    useEffect(() => {
        fetchRecord();
    }, [id]);

    const fetchRecord = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await api.getRecord(id);
            // API returns data directly, not nested under 'record'
            setRecord(response.data);
        } catch (err) {
            setError(err.message || 'Failed to load record');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadFile = async (file) => {
        try {
            const response = await api.getPresignedDownloadUrl(file.key, id);
            window.open(response.data.downloadUrl, '_blank');
        } catch (err) {
            alert('Failed to download file: ' + err.message);
        }
    };

    if (loading) {
        return (
            <div className="view-record-loading">
                <LoadingSpinner text="Loading record..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className="view-record-error">
                <Card>
                    <div className="error-content">
                        <AlertCircle size={48} color="var(--color-error)" />
                        <h2>Error Loading Record</h2>
                        <p>{error}</p>
                        <Button onClick={() => navigate('/dashboard')}>
                            Back to Dashboard
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    if (!record) {
        return null;
    }

    return (
        <div className="view-record-container">
            <div className="view-record-header">
                <Button
                    variant="ghost"
                    icon={<ArrowLeft size={20} />}
                    onClick={() => navigate('/dashboard')}
                >
                    Back to Dashboard
                </Button>
            </div>

            <Card glass>
                {/* Tab Navigation */}
                <div className="record-tabs">
                    <button
                        className={`tab-button ${activeTab === 'details' ? 'active' : ''}`}
                        onClick={() => setActiveTab('details')}
                    >
                        <Info size={18} />
                        Details
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'blockchain' ? 'active' : ''}`}
                        onClick={() => setActiveTab('blockchain')}
                    >
                        <Shield size={18} />
                        Blockchain Audit
                    </button>
                </div>

                {/* Details Tab */}
                {activeTab === 'details' && (
                    <div className="record-details">
                        <div className="record-title-section">
                            <FileText size={32} className="record-icon" />
                            <div>
                                <h1>{record.title}</h1>
                                <div className="record-meta">
                                    <span className="record-type-badge">{record.recordType}</span>
                                    <span className="record-date">
                                        <Calendar size={16} />
                                        {new Date(record.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="record-section">
                            <h3>Description</h3>
                            <p className="record-description">{record.description}</p>
                        </div>

                        <div className="record-section">
                            <h3>Patient Information</h3>
                            <div className="info-grid">
                                <div className="info-item">
                                    <span className="info-label">Name:</span>
                                    <span className="info-value">
                                        {record.patientId?.firstName} {record.patientId?.lastName}
                                    </span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Email:</span>
                                    <span className="info-value">{record.patientId?.email}</span>
                                </div>
                            </div>
                        </div>

                        <div className="record-section">
                            <h3>Created By</h3>
                            <div className="info-grid">
                                <div className="info-item">
                                    <span className="info-label">Name:</span>
                                    <span className="info-value">
                                        {record.createdBy?.firstName} {record.createdBy?.lastName}
                                    </span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Role:</span>
                                    <span className="info-value">{record.createdBy?.role}</span>
                                </div>
                            </div>
                        </div>

                        {record.files && record.files.length > 0 && (
                            <div className="record-section">
                                <h3>Attached Files ({record.files.length})</h3>
                                <div className="files-list">
                                    {record.files.map((file, index) => (
                                        <div key={index} className="file-item">
                                            <div className="file-info">
                                                <FileText size={24} className="file-icon" />
                                                <div>
                                                    <p className="file-name">{file.filename}</p>
                                                    <p className="file-size">
                                                        {(file.size / 1024).toFixed(2)} KB
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="secondary"
                                                icon={<Download size={18} />}
                                                onClick={() => handleDownloadFile(file)}
                                            >
                                                Download
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Blockchain Audit Tab */}
                {activeTab === 'blockchain' && (
                    <BlockchainAudit recordId={id} />
                )}
            </Card>
        </div>
    );
};

export default ViewRecord;
