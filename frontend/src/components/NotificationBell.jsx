import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import NotificationPanel from './NotificationPanel';
import api from '../services/api';
import './NotificationBell.css';

const NotificationBell = () => {
    const [showPanel, setShowPanel] = useState(false);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [count, setCount] = useState(0);

    useEffect(() => {
        loadPendingRequests();
        // Poll for new requests every 30 seconds
        const interval = setInterval(loadPendingRequests, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadPendingRequests = async () => {
        try {
            setLoading(true);
            const response = await api.getPendingRequests();
            setRequests(response.data.requests);
            setCount(response.data.pagination.total);
        } catch (error) {
            console.error('Failed to load notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (requestId) => {
        try {
            await api.respondToRequest(requestId, 'approve');
            // Reload requests
            await loadPendingRequests();
        } catch (error) {
            console.error('Failed to approve request:', error);
            alert('Failed to approve request: ' + error.message);
        }
    };

    const handleDeny = async (requestId) => {
        try {
            await api.respondToRequest(requestId, 'deny');
            // Reload requests
            await loadPendingRequests();
        } catch (error) {
            console.error('Failed to deny request:', error);
            alert('Failed to deny request: ' + error.message);
        }
    };

    return (
        <div className="notification-bell-container">
            <button
                className="notification-bell-button"
                onClick={() => setShowPanel(!showPanel)}
                aria-label="Notifications"
            >
                <Bell size={20} />
                {count > 0 && (
                    <span className="notification-badge">{count}</span>
                )}
            </button>

            {showPanel && (
                <>
                    <div
                        className="notification-overlay"
                        onClick={() => setShowPanel(false)}
                    />
                    <NotificationPanel
                        requests={requests}
                        loading={loading}
                        onApprove={handleApprove}
                        onDeny={handleDeny}
                        onClose={() => setShowPanel(false)}
                    />
                </>
            )}
        </div>
    );
};

export default NotificationBell;
