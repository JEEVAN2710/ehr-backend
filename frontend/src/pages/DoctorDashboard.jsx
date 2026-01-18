import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import Badge from '../components/Badge';
import ScanQRModal from '../components/ScanQRModal';
import RequestAccessModal from '../components/RequestAccessModal';
import { FileText, Plus, Clock, Users, QrCode, UserPlus } from 'lucide-react';
import { formatRelativeTime } from '../utils/utils';
import { RECORD_TYPES } from '../utils/constants';
import './Dashboard.css';

const DoctorDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [recentRecords, setRecentRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [scanQRModalOpen, setScanQRModalOpen] = useState(false);
    const [requestAccessModalOpen, setRequestAccessModalOpen] = useState(false);
    const [stats, setStats] = useState({
        recordsCreated: 0,
        patientsCount: 0
    });

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            // Get records created by this doctor using creator/me endpoint
            const response = await api.getRecordsByCreator(user._id);
            const records = response.data.records || [];

            // Get unique patient IDs
            const uniquePatients = new Set(records.map(r => r.patientId?._id || r.patientId).filter(Boolean));

            setRecentRecords(records.slice(0, 6));
            setStats({
                recordsCreated: records.length,
                patientsCount: uniquePatients.size
            });
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

    if (loading) {
        return <LoadingSpinner text="Loading your dashboard..." />;
    }

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div>
                    <h1 className="dashboard-title">Welcome, Dr. {user.lastName}!</h1>
                    <p className="dashboard-subtitle">Manage patient records and create new entries</p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                    <Button
                        variant="secondary"
                        icon={<QrCode size={20} />}
                        onClick={() => setScanQRModalOpen(true)}
                    >
                        Scan Patient QR
                    </Button>
                    <Button
                        variant="primary"
                        icon={<Plus size={20} />}
                        onClick={() => navigate('/records/create')}
                    >
                        Create New Record
                    </Button>
                </div>
            </div>

            <div className="stats-grid">
                <Card className="stat-card" glass>
                    <div className="stat-icon" style={{ background: 'var(--gradient-primary)' }}>
                        <FileText size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Records Created</div>
                        <div className="stat-value">{stats.recordsCreated}</div>
                    </div>
                </Card>

                <Card className="stat-card" glass>
                    <div className="stat-icon" style={{ background: 'var(--gradient-success)' }}>
                        <Users size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Patients</div>
                        <div className="stat-value">{stats.patientsCount}</div>
                    </div>
                </Card>
            </div>

            <div className="dashboard-section">
                <div className="section-header">
                    <h2>Recently Created Records</h2>
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => navigate('/records')}
                    >
                        View All Records
                    </Button>
                </div>

                {recentRecords.length === 0 ? (
                    <Card glass>
                        <div className="empty-state">
                            <FileText size={48} style={{ color: 'var(--color-text-muted)' }} />
                            <p>No records created yet</p>
                            <Button
                                variant="primary"
                                icon={<Plus size={18} />}
                                onClick={() => navigate('/records/create')}
                                style={{ marginTop: '1rem' }}
                            >
                                Create First Record
                            </Button>
                        </div>
                    </Card>
                ) : (
                    <div className="records-grid">
                        {recentRecords.map(record => (
                            <Card
                                key={record._id}
                                className="record-card"
                                glass
                                hover
                                onClick={() => navigate(`/records/${record._id}`)}
                            >
                                <div className="record-header">
                                    <h3>{record.title}</h3>
                                    <Badge variant={getRecordTypeVariant(record.recordType)}>
                                        {record.recordType}
                                    </Badge>
                                </div>
                                <p className="record-description">{record.description}</p>
                                <div className="record-meta">
                                    <div className="meta-item">
                                        <Clock size={14} />
                                        <span>{formatRelativeTime(record.createdAt)}</span>
                                    </div>
                                    {record.patient && (
                                        <div className="meta-item">
                                            <span>Patient: {record.patient.firstName} {record.patient.lastName}</span>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            <div className="quick-actions">
                <h2>Quick Actions</h2>
                <div className="actions-grid">
                    <Card glass hover onClick={() => setRequestAccessModalOpen(true)}>
                        <UserPlus size={32} style={{ color: 'var(--color-accent)' }} />
                        <h3>Request Patient Access</h3>
                        <p>Request access to a patient's medical records</p>
                    </Card>
                    <Card glass hover onClick={() => navigate('/records/create')}>
                        <Plus size={32} style={{ color: 'var(--color-primary)' }} />
                        <h3>Create Record</h3>
                        <p>Add a new medical record for a patient</p>
                    </Card>
                    <Card glass hover onClick={() => navigate('/records')}>
                        <FileText size={32} style={{ color: 'var(--color-success)' }} />
                        <h3>View Records</h3>
                        <p>Browse all medical records</p>
                    </Card>
                </div>
            </div>

            <ScanQRModal
                isOpen={scanQRModalOpen}
                onClose={() => setScanQRModalOpen(false)}
                onAccessRecords={(data) => {
                    console.log('Accessing patient records:', data);
                    // Navigate to patient records page
                    if (data.patient && data.patient.id) {
                        navigate(`/records?patientId=${data.patient.id}`);
                    } else {
                        alert('Patient records accessed successfully!');
                    }
                }}
            />

            <RequestAccessModal
                isOpen={requestAccessModalOpen}
                onClose={() => setRequestAccessModalOpen(false)}
                onSuccess={() => {
                    alert('Access request sent successfully! The patient will be notified.');
                }}
            />
        </div>
    );
};

export default DoctorDashboard;
