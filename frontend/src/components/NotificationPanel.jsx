import { Check, X, Clock, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Button from './Button';
import './NotificationPanel.css';

const NotificationPanel = ({ requests, loading, onApprove, onDeny, onClose }) => {
    if (loading && requests.length === 0) {
        return (
            <div className="notification-panel">
                <div className="notification-header">
                    <h3>Access Requests</h3>
                </div>
                <div className="notification-content">
                    <p className="no-notifications">Loading...</p>
                </div>
            </div>
        );
    }

    if (requests.length === 0) {
        return (
            <div className="notification-panel">
                <div className="notification-header">
                    <h3>Access Requests</h3>
                </div>
                <div className="notification-content">
                    <p className="no-notifications">No pending requests</p>
                </div>
            </div>
        );
    }

    return (
        <div className="notification-panel">
            <div className="notification-header">
                <h3>Access Requests</h3>
                <span className="notification-count">{requests.length}</span>
            </div>

            <div className="notification-content">
                {requests.map((request) => (
                    <div key={request._id} className="notification-item">
                        <div className="notification-requester">
                            <div className="requester-icon">
                                <User size={20} />
                            </div>
                            <div className="requester-info">
                                <h4>
                                    {request.requesterId?.firstName || 'Unknown'} {request.requesterId?.lastName || 'User'}
                                </h4>
                                <p className="requester-role">
                                    {request.requesterId?.role === 'doctor' ? 'Doctor' : 'Lab Assistant'}
                                    {request.requesterId?.specialization && ` • ${request.requesterId.specialization}`}
                                </p>
                            </div>
                        </div>

                        {request.message && (
                            <p className="request-message">"{request.message}"</p>
                        )}

                        <div className="request-meta">
                            <Clock size={14} />
                            <span>{formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}</span>
                        </div>

                        <div className="request-actions">
                            <Button
                                variant="success"
                                size="sm"
                                icon={<Check size={16} />}
                                onClick={() => onApprove(request._id)}
                            >
                                Approve
                            </Button>
                            <Button
                                variant="danger"
                                size="sm"
                                icon={<X size={16} />}
                                onClick={() => onDeny(request._id)}
                            >
                                Deny
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NotificationPanel;
