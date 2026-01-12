import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import { FileText, Calendar, User, AlertCircle, Clock, Download, Lock } from 'lucide-react';
import './SharedRecordsView.css';

const SharedRecordsView = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchSharedRecords();
    }, [token]);

    const fetchSharedRecords = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await api.getRecordsByShareToken(token);
            setData(response.data);
        } catch (err) {
            setError(err.message || 'Failed to load shared records');
        } finally {
            setLoading(false);
        }
    };

    const handleViewRecord = (recordId) => {
        // View record details (could open in modal or navigate)
        alert('Record viewing coming soon!');
    };

    if (loading) {
        return (
            <div className="shared-view-loading">
                <LoadingSpinner text="Loading shared records..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className="shared-view-error">
                <Card>
                    <div className="error-content">
                        <AlertCircle size={48} color="var(--color-error)" />
                        <h2>Unable to Load Records</h2>
                        <p>{error}</p>
                        <Button onClick={() => navigate('/')}>
                            Go to Home
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    const expiresAt = new Date(data.expiresAt);
    const now = new Date();
    const isExpiring = (expiresAt - now) < 60 * 60 * 1000; // < 1 hour

    return (
        <div className="shared-records-container">
            <div className="shared-header">
                <div className="shared-branding">
                    <Lock size={24} />
                    <h1>Shared Medical Records</h1>
                </div>
                <div className="patient-info-card">
                    <h3>Patient Information</h3>
                    <p>
                        <strong>{data.patient.firstName} {data.patient.lastName}</strong>
                    </p>
                    <p className="patient-email">{data.patient.email}</p>
                </div>
            </div>

            <Card glass>
                <div className="share-meta">
                    <div className="meta-item">
                        <Clock size={18} />
                        <span>
                            Expires: {expiresAt.toLocaleString()}
                            {isExpiring && <span className="expiring-soon"> (Expiring soon!)</span>}
                        </span>
                    </div>
                    <div className="meta-item">
                        <AlertCircle size={18} />
                        <span>Read-only access • {data.accessCount} view{data.accessCount !== 1 ? 's' : ''}</span>
                    </div>
                </div>
            </Card>

            {data.records.length === 0 ? (
                <Card>
                    <div className="empty-state">
                        <FileText size={48} />
                        <h3>No Records Available</h3>
                        <p>This patient has no medical records to share.</p>
                    </div>
                </Card>
            ) : (
                <>
                    <div className="records-header">
                        <h2>Medical Records ({data.records.length})</h2>
                        <p className="read-only-notice">
                            <Lock size={16} /> Read-only view
                        </p>
                    </div>

                    <div className="records-grid">
                        {data.records.map((record) => (
                            <Card key={record._id} className="record-card" hover>
                                <div className="record-card-content">
                                    <div className="record-card-header">
                                        <FileText size={24} className="record-icon" />
                                        <span className="record-type-badge">{record.recordType}</span>
                                    </div>

                                    <h3 className="record-title">{record.title}</h3>
                                    <p className="record-description">
                                        {record.description?.length > 120
                                            ? `${record.description.substring(0, 120)}...`
                                            : record.description}
                                    </p>

                                    <div className="record-meta">
                                        <div className="meta-item">
                                            <Calendar size={16} />
                                            <span>{new Date(record.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        {record.createdBy && (
                                            <div className="meta-item">
                                                <User size={16} />
                                                <span>
                                                    {record.createdBy.firstName} {record.createdBy.lastName}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {record.files && record.files.length > 0 && (
                                        <div className="files-info">
                                            <Download size={16} />
                                            <span>{record.files.length} file{record.files.length > 1 ? 's' : ''} attached</span>
                                        </div>
                                    )}

                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        fullWidth
                                        onClick={() => handleViewRecord(record._id)}
                                    >
                                        View Details
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                </>
            )}

            <div className="shared-footer">
                <p>
                    This link was securely generated to share medical records.
                    Access is temporary and will expire automatically.
                </p>
            </div>
        </div>
    );
};

export default SharedRecordsView;
