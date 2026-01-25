import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Card from '../components/Card';
import Badge from '../components/Badge';
import LoadingSpinner from '../components/LoadingSpinner';
import { Users, Clock, CheckCircle, XCircle, Upload } from 'lucide-react';
import './EligibleUploaders.css';

const EligibleUploaders = () => {
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState({ total: 0, canUpload: 0, expired: 0, uploaded: 0 });
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // 'all', 'eligible', 'expired', 'uploaded'

    useEffect(() => {
        loadEligibleUploaders();
    }, []);

    const loadEligibleUploaders = async () => {
        try {
            setLoading(true);
            const response = await api.getEligibleUploaders();

            if (response.success) {
                setUsers(response.data.users);
                setStats(response.data.stats);
            }
        } catch (error) {
            console.error('Failed to load eligible uploaders:', error);
        } finally {
            setLoading(false);
        }
    };

    const getFilteredUsers = () => {
        switch (filter) {
            case 'eligible':
                return users.filter(u => u.canUpload);
            case 'expired':
                return users.filter(u => !u.canUpload && !u.hasUploaded);
            case 'uploaded':
                return users.filter(u => u.hasUploaded);
            default:
                return users;
        }
    };

    const getStatusBadge = (user) => {
        if (user.hasUploaded) {
            return <Badge color="success" icon={<CheckCircle size={14} />}>Uploaded</Badge>;
        } else if (user.canUpload) {
            if (user.daysRemaining <= 2) {
                return <Badge color="error" icon={<Clock size={14} />}>Urgent - {user.daysRemaining}d left</Badge>;
            } else if (user.daysRemaining <= 5) {
                return <Badge color="warning" icon={<Clock size={14} />}>{user.daysRemaining} days left</Badge>;
            } else {
                return <Badge color="success" icon={<Clock size={14} />}>{user.daysRemaining} days left</Badge>;
            }
        } else {
            return <Badge color="default" icon={<XCircle size={14} />}>Expired</Badge>;
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const filteredUsers = getFilteredUsers();

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="eligible-uploaders">
            <div className="header">
                <div className="title-section">
                    <Upload size={28} />
                    <h2>Upload Eligibility Tracker</h2>
                </div>
                <p className="subtitle">Monitor patients within their 10-day self-upload window</p>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <Card className="stat-card">
                    <div className="stat-content">
                        <Users size={24} className="stat-icon total" />
                        <div>
                            <div className="stat-value">{stats.total}</div>
                            <div className="stat-label">Total Patients</div>
                        </div>
                    </div>
                </Card>

                <Card className="stat-card">
                    <div className="stat-content">
                        <Clock size={24} className="stat-icon eligible" />
                        <div>
                            <div className="stat-value">{stats.canUpload}</div>
                            <div className="stat-label">Can Upload</div>
                        </div>
                    </div>
                </Card>

                <Card className="stat-card">
                    <div className="stat-content">
                        <CheckCircle size={24} className="stat-icon uploaded" />
                        <div>
                            <div className="stat-value">{stats.uploaded}</div>
                            <div className="stat-label">Uploaded</div>
                        </div>
                    </div>
                </Card>

                <Card className="stat-card">
                    <div className="stat-content">
                        <XCircle size={24} className="stat-icon expired" />
                        <div>
                            <div className="stat-value">{stats.expired}</div>
                            <div className="stat-label">Expired</div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Filters */}
            <div className="filters">
                <button
                    className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                >
                    All ({stats.total})
                </button>
                <button
                    className={`filter-btn ${filter === 'eligible' ? 'active' : ''}`}
                    onClick={() => setFilter('eligible')}
                >
                    Eligible ({stats.canUpload})
                </button>
                <button
                    className={`filter-btn ${filter === 'uploaded' ? 'active' : ''}`}
                    onClick={() => setFilter('uploaded')}
                >
                    Uploaded ({stats.uploaded})
                </button>
                <button
                    className={`filter-btn ${filter === 'expired' ? 'active' : ''}`}
                    onClick={() => setFilter('expired')}
                >
                    Expired ({stats.expired})
                </button>
            </div>

            {/* Users List */}
            {filteredUsers.length === 0 ? (
                <Card className="empty-state">
                    <p>No patients found in this category</p>
                </Card>
            ) : (
                <div className="users-list">
                    {filteredUsers.map(user => (
                        <Card key={user._id} className="user-card">
                            <div className="user-header">
                                <div className="user-info">
                                    <h3>{user.firstName} {user.lastName}</h3>
                                    <div className="user-details">
                                        <span>📧 {user.email}</span>
                                        {user.phoneNumber && <span>📞 {user.phoneNumber}</span>}
                                    </div>
                                </div>
                                {getStatusBadge(user)}
                            </div>

                            <div className="user-timeline">
                                <div className="timeline-item">
                                    <span className="label">Registered:</span>
                                    <span className="value">{formatDate(user.registeredAt)}</span>
                                </div>
                                <div className="timeline-item">
                                    <span className="label">Upload Expires:</span>
                                    <span className="value">{formatDate(user.expiresAt)}</span>
                                </div>
                                {user.hasUploaded && (
                                    <div className="timeline-item">
                                        <span className="label">First Upload:</span>
                                        <span className="value">{formatDate(user.firstUploadAt)}</span>
                                    </div>
                                )}
                            </div>

                            {user.canUpload && (
                                <div className={`urgency-bar ${user.daysRemaining <= 2 ? 'urgent' : user.daysRemaining <= 5 ? 'warning' : 'normal'}`}>
                                    <div
                                        className="urgency-fill"
                                        style={{ width: `${(user.daysRemaining / 10) * 100}%` }}
                                    />
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default EligibleUploaders;
