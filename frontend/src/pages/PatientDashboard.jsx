import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import Badge from '../components/Badge';
import ShareRecordModal from '../components/ShareRecordModal';
import ShareAllModal from '../components/ShareAllModal';
import NotificationBell from '../components/NotificationBell';
import { FileText, Share2, Clock, Activity } from 'lucide-react';
import { formatRelativeTime } from '../utils/utils';
import { RECORD_TYPES } from '../utils/constants';
import './Dashboard.css';

const PatientDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [shareAllModalOpen, setShareAllModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const recordsRes = await api.getPatientRecords(user._id, { limit: 10 });
            setRecords(recordsRes.data.records);
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getRecordTypeVariant = (type) => {
        switch (type) {
            case RECORD_TYPES.PRESCRIPTION: return 'primary';
            case RECORD_TYPES.LAB_TEST: return 'info';
            case RECORD_TYPES.SCAN: return 'warning';
            case RECORD_TYPES.REPORT: return 'success';
            default: return 'default';
        }
    };

    const handleShare = (e, record) => {
        e.stopPropagation();
        setSelectedRecord(record);
        setShareModalOpen(true);
    };

    if (loading) {
        return <LoadingSpinner text="Loading your dashboard..." />;
    }

    const totalRecords = records.length;
    const recentRecords = records.filter(r => {
        const daysSince = (Date.now() - new Date(r.createdAt).getTime()) / (1000 * 60 * 60 * 24);
        return daysSince <= 30;
    }).length;

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div>
                    <h1 className="dashboard-title">Welcome back, {user.firstName}!</h1>
                    <p className="dashboard-subtitle">Manage and share your medical records</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                    <NotificationBell />
                    <Button
                        variant="primary"
                        icon={<Share2 size={18} />}
                        onClick={() => setShareAllModalOpen(true)}
                    >
                        Share All Records
                    </Button>
                </div>
            </div>

            <div className="stats-grid">
                <Card className="stat-card" glass>
                    <div className="stat-icon" style={{ background: 'var(--gradient-primary)' }}>
                        <FileText size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Total Records</div>
                        <div className="stat-value">{totalRecords}</div>
                    </div>
                </Card>

                <Card className="stat-card" glass>
                    <div className="stat-icon" style={{ background: 'var(--gradient-success)' }}>
                        <Activity size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Recent (30 days)</div>
                        <div className="stat-value">{recentRecords}</div>
                    </div>
                </Card>
            </div>

            <div className="dashboard-section">
                <div className="section-header">
                    <h2>My Medical Records</h2>
                    <Button variant="secondary" size="sm" onClick={() => navigate('/records')}>
                        View All
                    </Button>
                </div>

                {records.length === 0 ? (
                    <Card glass>
                        <div className="empty-state">
                            <FileText size={48} style={{ color: 'var(--color-text-muted)' }} />
                            <p>No medical records yet</p>
                        </div>
                    </Card>
                ) : (
                    <div className="records-grid">
                        {records.map(record => (
                            <Card key={record._id} className="record-card" glass>
                                <div className="record-header">
                                    <h3 onClick={() => navigate(`/records/${record._id}`)} style={{ cursor: 'pointer', flex: 1 }}>
                                        {record.title}
                                    </h3>
                                    <Badge variant={getRecordTypeVariant(record.recordType)}>
                                        {record.recordType}
                                    </Badge>
                                </div>
                                <p className="record-description" onClick={() => navigate(`/records/${record._id}`)} style={{ cursor: 'pointer' }}>
                                    {record.description}
                                </p>
                                <div className="record-meta">
                                    <div className="meta-item">
                                        <Clock size={14} />
                                        <span>{formatRelativeTime(record.createdAt)}</span>
                                    </div>
                                    {record.creator && (
                                        <div className="meta-item">
                                            <span>By: {record.creator.firstName} {record.creator.lastName}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="record-actions" style={{ marginTop: 'var(--spacing-md)', paddingTop: 'var(--spacing-md)', borderTop: '1px solid var(--color-border)' }}>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        fullWidth
                                        icon={<Share2 size={16} />}
                                        onClick={(e) => handleShare(e, record)}
                                    >
                                        Share with QR
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            <ShareRecordModal
                isOpen={shareModalOpen}
                onClose={() => setShareModalOpen(false)}
                record={selectedRecord}
            />

            <ShareAllModal
                isOpen={shareAllModalOpen}
                onClose={() => setShareAllModalOpen(false)}
                patientId={user._id}
            />
        </div>
    );
};

export default PatientDashboard;
