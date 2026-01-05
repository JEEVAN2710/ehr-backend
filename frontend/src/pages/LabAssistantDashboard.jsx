import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import ScanQRModal from '../components/ScanQRModal';
import { FileText, Plus, TestTube, QrCode } from 'lucide-react';
import './Dashboard.css';

const LabAssistantDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [scanQRModalOpen, setScanQRModalOpen] = useState(false);

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div>
                    <h1 className="dashboard-title">Welcome, {user.firstName}!</h1>
                    <p className="dashboard-subtitle">Manage lab tests and upload results</p>
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
                        Create Lab Record
                    </Button>
                </div>
            </div>

            <div className="stats-grid">
                <Card className="stat-card" glass>
                    <div className="stat-icon" style={{ background: 'var(--gradient-info)' }}>
                        <TestTube size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Lab Tests Created</div>
                        <div className="stat-value">-</div>
                    </div>
                </Card>

                <Card className="stat-card" glass>
                    <div className="stat-icon" style={{ background: 'var(--gradient-primary)' }}>
                        <FileText size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Total Records</div>
                        <div className="stat-value">-</div>
                    </div>
                </Card>
            </div>

            <div className="quick-actions">
                <h2>Quick Actions</h2>
                <div className="actions-grid">
                    <Card glass hover onClick={() => navigate('/records/create')}>
                        <Plus size={32} style={{ color: 'var(--color-primary)' }} />
                        <h3>Create Lab Test</h3>
                        <p>Add a new lab test result for a patient</p>
                    </Card>
                    <Card glass hover onClick={() => navigate('/records')}>
                        <FileText size={32} style={{ color: 'var(--color-success)' }} />
                        <h3>View Records</h3>
                        <p>Browse all lab test records</p>
                    </Card>
                </div>
            </div>

            <ScanQRModal
                isOpen={scanQRModalOpen}
                onClose={() => setScanQRModalOpen(false)}
                onAccessRecords={(data) => {
                    console.log('Accessing patient records:', data);
                    // TODO: Navigate to view patient records
                    alert(`Access granted to patient records! (Token: ${data.token.substring(0, 20)}...)`);
                }}
            />
        </div>
    );
};

export default LabAssistantDashboard;
