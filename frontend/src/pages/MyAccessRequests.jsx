import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Clock,
    CheckCircle,
    XCircle,
    ArrowLeft,
    RefreshCw,
    Filter,
    Mail,
    Calendar,
    Trash2
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import ConfirmModal from '../components/ConfirmModal';
import api from '../services/api';
import './MyAccessRequests.css';

const MyAccessRequests = () => {
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all'); // 'all', 'pending', 'approved', 'denied'
    const [refreshing, setRefreshing] = useState(false);
    const [cancelModal, setCancelModal] = useState({ isOpen: false, request: null });
    const [cancelling, setCancelling] = useState(false);

    useEffect(() => {
        loadRequests();
    }, [filter]);

    const loadRequests = async () => {
        try {
            setLoading(true);
            setError('');
            const status = filter === 'all' ? undefined : filter;
            const data = await api.getMyAccessRequests({ status });
            setRequests(data.data.requests || []);
        } catch (err) {
            setError(err.message || 'Failed to load requests');
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadRequests();
        setRefreshing(false);
    };

    const handleCancelClick = (request) => {
        setCancelModal({ isOpen: true, request });
    };

    const handleCancelConfirm = async () => {
        if (!cancelModal.request) return;

        try {
            setCancelling(true);
            await api.cancelAccessRequest(cancelModal.request._id);

            // Remove from local state
            setRequests(prev => prev.filter(r => r._id !== cancelModal.request._id));

            // Close modal
            setCancelModal({ isOpen: false, request: null });
        } catch (err) {
            setError(err.message || 'Failed to cancel request');
        } finally {
            setCancelling(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending':
                return <Clock className="status-icon pending" size={20} />;
            case 'approved':
                return <CheckCircle className="status-icon approved" size={20} />;
            case 'denied':
                return <XCircle className="status-icon denied" size={20} />;
            default:
                return null;
        }
    };

    const getStatusClass = (status) => {
        return `status-badge ${status}`;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
    };

    const filterOptions = [
        { value: 'all', label: 'All Requests', count: requests.length },
        { value: 'pending', label: 'Pending', count: requests.filter(r => r.status === 'pending').length },
        { value: 'approved', label: 'Approved', count: requests.filter(r => r.status === 'approved').length },
        { value: 'denied', label: 'Denied', count: requests.filter(r => r.status === 'denied').length }
    ];

    return (
        <div className="my-requests-page">
            <div className="page-header">
                <Button
                    variant="secondary"
                    icon={<ArrowLeft size={18} />}
                    onClick={() => navigate('/doctor-dashboard')}
                    className="back-button"
                >
                    Back to Dashboard
                </Button>

                <div className="header-content">
                    <h1>My Access Requests</h1>
                    <p className="subtitle">View all your sent access requests and their status</p>
                </div>

                <Button
                    variant="secondary"
                    icon={<RefreshCw size={18} className={refreshing ? 'spinning' : ''} />}
                    onClick={handleRefresh}
                    disabled={refreshing}
                >
                    Refresh
                </Button>
            </div>

            <div className="filter-section">
                <div className="filter-header">
                    <Filter size={18} />
                    <span>Filter by status:</span>
                </div>
                <div className="filter-buttons">
                    {filterOptions.map(option => (
                        <button
                            key={option.value}
                            className={`filter-btn ${filter === option.value ? 'active' : ''}`}
                            onClick={() => setFilter(option.value)}
                        >
                            {option.label}
                            <span className="count-badge">{option.count}</span>
                        </button>
                    ))}
                </div>
            </div>

            {error && (
                <div className="error-banner">
                    <XCircle size={20} />
                    <span>{error}</span>
                </div>
            )}

            <div className="requests-container">
                {loading ? (
                    <div className="loading-state">
                        <RefreshCw size={32} className="spinning" />
                        <p>Loading requests...</p>
                    </div>
                ) : requests.length === 0 ? (
                    <Card className="empty-state">
                        <Mail size={48} className="empty-icon" />
                        <h3>No requests found</h3>
                        <p>
                            {filter === 'all'
                                ? "You haven't sent any access requests yet."
                                : `You don't have any ${filter} requests.`
                            }
                        </p>
                        <Button
                            variant="primary"
                            onClick={() => navigate('/doctor-dashboard')}
                        >
                            Request Access
                        </Button>
                    </Card>
                ) : (
                    <div className="requests-grid">
                        {requests.map(request => (
                            <Card key={request._id} className="request-card" hover>
                                <div className="card-header">
                                    <div className="patient-info">
                                        <div className="patient-avatar">
                                            {request.patientId?.firstName?.[0] || 'P'}
                                            {request.patientId?.lastName?.[0] || ''}
                                        </div>
                                        <div>
                                            <h3>
                                                {request.patientId?.firstName} {request.patientId?.lastName}
                                            </h3>
                                            <p className="patient-email">
                                                <Mail size={14} />
                                                {request.patientId?.email}
                                            </p>
                                        </div>
                                    </div>
                                    <div className={getStatusClass(request.status)}>
                                        {getStatusIcon(request.status)}
                                        <span>{request.status}</span>
                                    </div>
                                </div>

                                {request.message && (
                                    <div className="request-message">
                                        <strong>Your message:</strong>
                                        <p>"{request.message}"</p>
                                    </div>
                                )}

                                <div className="card-footer">
                                    <div className="date-info">
                                        <Calendar size={14} />
                                        <span>Sent {formatDate(request.createdAt)}</span>
                                    </div>

                                    {request.status === 'pending' && request.expiresAt && (
                                        <div className="expires-info">
                                            <Clock size={14} />
                                            <span>Expires {formatDate(request.expiresAt)}</span>
                                        </div>
                                    )}

                                    {request.respondedAt && (
                                        <div className="responded-info">
                                            <CheckCircle size={14} />
                                            <span>Responded {formatDate(request.respondedAt)}</span>
                                        </div>
                                    )}
                                </div>

                                {request.status === 'pending' && (
                                    <div className="card-actions">
                                        <Button
                                            variant="danger"
                                            size="small"
                                            icon={<Trash2 size={16} />}
                                            onClick={() => handleCancelClick(request)}
                                        >
                                            Cancel Request
                                        </Button>
                                    </div>
                                )}

                                {request.status === 'approved' && (
                                    <div className="card-actions">
                                        <Button
                                            variant="primary"
                                            size="small"
                                            onClick={() => navigate(`/patient-records/${request.patientId._id}`)}
                                        >
                                            View Records
                                        </Button>
                                    </div>
                                )}
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            <ConfirmModal
                isOpen={cancelModal.isOpen}
                onClose={() => setCancelModal({ isOpen: false, request: null })}
                onConfirm={handleCancelConfirm}
                title="Cancel Access Request"
                message={`Are you sure you want to cancel your access request to ${cancelModal.request?.patientId?.firstName} ${cancelModal.request?.patientId?.lastName}'s records? This action cannot be undone.`}
                confirmText="Cancel Request"
                cancelText="Keep Request"
                variant="danger"
                loading={cancelling}
            />
        </div>
    );
};

export default MyAccessRequests;
