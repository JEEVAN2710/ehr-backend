import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Card from '../components/Card';
import Badge from '../components/Badge';
import LoadingSpinner from '../components/LoadingSpinner';
import { Activity, AlertCircle, CheckCircle, XCircle, Clock, User, FileText } from 'lucide-react';
import { formatDate } from '../utils/utils';
import './Dashboard.css';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [auditLogs, setAuditLogs] = useState([]);
    const [stats, setStats] = useState({
        totalErrors: 0,
        todayErrors: 0,
        totalActivities: 0,
        todayActivities: 0
    });
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, error, success, info

    useEffect(() => {
        loadAuditLogs();
    }, [filter]);

    const loadAuditLogs = async () => {
        try {
            setLoading(true);
            // Simulated audit logs - in production, this would come from backend
            const mockLogs = generateMockAuditLogs();
            const filteredLogs = filterLogs(mockLogs, filter);
            setAuditLogs(filteredLogs);
            calculateStats(mockLogs);
        } catch (error) {
            console.error('Failed to load audit logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const generateMockAuditLogs = () => {
        const actions = [
            { type: 'success', action: 'User Login', user: 'Dr. John Smith', details: 'Successful authentication' },
            { type: 'error', action: 'Failed Login Attempt', user: 'Unknown', details: 'Invalid credentials for email@example.com' },
            { type: 'success', action: 'Record Created', user: 'Dr. Sarah Johnson', details: 'Created medical record for patient #1234' },
            { type: 'error', action: 'Access Denied', user: 'Dr. Mike Brown', details: 'Attempted to access restricted patient data' },
            { type: 'info', action: 'Password Reset', user: 'System', details: 'Password reset email sent to user@example.com' },
            { type: 'success', action: 'User Registered', user: 'System', details: 'New patient account created' },
            { type: 'error', action: 'Database Error', user: 'System', details: 'Connection timeout to database server' },
            { type: 'success', action: 'Record Shared', user: 'Patient Jane Doe', details: 'Shared records with Dr. Smith' },
            { type: 'warning', action: 'Rate Limit Exceeded', user: 'System', details: 'Too many requests from IP 192.168.1.100' },
            { type: 'error', action: 'File Upload Failed', user: 'Dr. Emily Clark', details: 'File size exceeds maximum limit' },
        ];

        return actions.map((log, index) => ({
            id: index + 1,
            ...log,
            timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random time within last week
        })).sort((a, b) => b.timestamp - a.timestamp);
    };

    const filterLogs = (logs, filterType) => {
        if (filterType === 'all') return logs;
        if (filterType === 'error') return logs.filter(log => log.type === 'error' || log.type === 'warning');
        return logs.filter(log => log.type === filterType);
    };

    const calculateStats = (logs) => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        const errors = logs.filter(log => log.type === 'error' || log.type === 'warning');
        const todayErrors = errors.filter(log => log.timestamp >= today);
        const todayLogs = logs.filter(log => log.timestamp >= today);

        setStats({
            totalErrors: errors.length,
            todayErrors: todayErrors.length,
            totalActivities: logs.length,
            todayActivities: todayLogs.length
        });
    };

    const getLogIcon = (type) => {
        switch (type) {
            case 'error':
                return <XCircle size={20} className="log-icon error" />;
            case 'warning':
                return <AlertCircle size={20} className="log-icon warning" />;
            case 'success':
                return <CheckCircle size={20} className="log-icon success" />;
            case 'info':
                return <Activity size={20} className="log-icon info" />;
            default:
                return <Activity size={20} className="log-icon" />;
        }
    };

    const getLogBadgeVariant = (type) => {
        switch (type) {
            case 'error':
                return 'danger';
            case 'warning':
                return 'warning';
            case 'success':
                return 'success';
            case 'info':
                return 'info';
            default:
                return 'secondary';
        }
    };

    if (loading) {
        return <LoadingSpinner text="Loading audit logs..." />;
    }

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div>
                    <h1 className="dashboard-title">Admin Dashboard</h1>
                    <p className="dashboard-subtitle">System audit logs and error monitoring</p>
                </div>
            </div>

            <div className="stats-grid">
                <Card className="stat-card" glass>
                    <div className="stat-icon" style={{ background: 'var(--gradient-danger)' }}>
                        <XCircle size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Total Errors</div>
                        <div className="stat-value">{stats.totalErrors}</div>
                    </div>
                </Card>

                <Card className="stat-card" glass>
                    <div className="stat-icon" style={{ background: 'var(--gradient-warning)' }}>
                        <AlertCircle size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Today's Errors</div>
                        <div className="stat-value">{stats.todayErrors}</div>
                    </div>
                </Card>

                <Card className="stat-card" glass>
                    <div className="stat-icon" style={{ background: 'var(--gradient-primary)' }}>
                        <Activity size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Total Activities</div>
                        <div className="stat-value">{stats.totalActivities}</div>
                    </div>
                </Card>

                <Card className="stat-card" glass>
                    <div className="stat-icon" style={{ background: 'var(--gradient-success)' }}>
                        <CheckCircle size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Today's Activities</div>
                        <div className="stat-value">{stats.todayActivities}</div>
                    </div>
                </Card>
            </div>

            <div className="dashboard-section">
                <div className="section-header">
                    <h2>Audit Logs</h2>
                </div>

                <Card glass className="filters-card">
                    <div className="filters-container">
                        <div className="filter-item">
                            <label>Filter by Type:</label>
                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="filter-select"
                            >
                                <option value="all">All Activities</option>
                                <option value="error">Errors & Warnings</option>
                                <option value="success">Success</option>
                                <option value="info">Info</option>
                            </select>
                        </div>
                    </div>
                </Card>

                <div className="audit-logs-container">
                    {auditLogs.map((log) => (
                        <Card key={log.id} className="audit-log-card" glass>
                            <div className="audit-log-header">
                                <div className="audit-log-title">
                                    {getLogIcon(log.type)}
                                    <span>{log.action}</span>
                                </div>
                                <Badge variant={getLogBadgeVariant(log.type)} size="sm">
                                    {log.type.toUpperCase()}
                                </Badge>
                            </div>
                            <div className="audit-log-body">
                                <div className="audit-log-meta">
                                    <div className="audit-meta-item">
                                        <User size={16} />
                                        <span>{log.user}</span>
                                    </div>
                                    <div className="audit-meta-item">
                                        <Clock size={16} />
                                        <span>{formatDate(log.timestamp)}</span>
                                    </div>
                                </div>
                                <div className="audit-log-details">
                                    <FileText size={16} />
                                    <span>{log.details}</span>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                {auditLogs.length === 0 && (
                    <Card>
                        <div className="empty-state">
                            <Activity size={48} />
                            <h3>No Logs Found</h3>
                            <p>No audit logs match the selected filter</p>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
