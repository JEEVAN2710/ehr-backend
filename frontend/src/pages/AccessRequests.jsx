import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import { FileText, Clock, CheckCircle, XCircle, AlertCircle, User, Calendar, Eye, Infinity } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import './AccessRequests.css';

const AccessRequests = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [pendingRequests, setPendingRequests] = useState([]);
    const [sharedRecords, setSharedRecords] = useState([]);
    const [requestHistory, setRequestHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [responding, setResponding] = useState(null);
    const [revokeModal, setRevokeModal] = useState({ open: false, requestId: null, doctorName: '' });
    const [revokeTiming, setRevokeTiming] = useState('immediate');
    const [revoking, setRevoking] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError('');

            if (user.role === 'patient') {
                // Patient: Get pending requests, shared records, and approved access (who has access)
                const [pendingRes, sharedRes, grantedRes] = await Promise.all([
                    api.getPendingRequests(),
                    api.getSharedRecords(),
                    api.getGrantedAccess({ status: 'approved' }) // Get who patient granted access to
                ]);
                setPendingRequests(pendingRes.data.requests || []);
                setSharedRecords(sharedRes.data.records || []);
                setRequestHistory(grantedRes.data.requests || []); // For patients, this shows who they gave access to
            } else {
                // Doctor/Lab Assistant: Get sent requests, shared records, and share-all links
                const [sentRes, sharedRes, viaLinksRes] = await Promise.all([
                    api.getMyRequests(),
                    api.getSharedRecords(),
                    api.getSharedViaLinks()
                ]);
                const allRequests = sentRes.data.requests || [];
                setPendingRequests(allRequests.filter(r => r.status === 'pending'));
                setRequestHistory(allRequests.filter(r => r.status !== 'pending'));
                setSharedRecords(sharedRes.data.records || []);
                setShareViaLinks(viaLinksRes.data || []);
            }
        } catch (err) {
            setError(err.message || 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleRespond = async (requestId, action) => {
        try {
            setResponding(requestId);
            await api.respondToRequest(requestId, action);
            await fetchData(); // Refresh data
        } catch (err) {
            alert(`Failed to ${action} request: ${err.message}`);
        } finally {
            setResponding(null);
        }
    };

    const openRevokeModal = (requestId, doctorName) => {
        setRevokeModal({ open: true, requestId, doctorName });
        setRevokeTiming('immediate');
    };

    const closeRevokeModal = () => {
        setRevokeModal({ open: false, requestId: null, doctorName: '' });
        setRevokeTiming('immediate');
    };

    const handleRevoke = async () => {
        try {
            setRevoking(true);
            await api.revokeAccess(revokeModal.requestId, revokeTiming);
            closeRevokeModal();
            await fetchData(); // Refresh data
            alert(revokeTiming === 'immediate'
                ? 'Access revoked immediately!'
                : `Access will be revoked in ${revokeTiming === '4h' ? '4 hours' : '8 hours'}`);
        } catch (err) {
            alert(`Failed to revoke access: ${err.message}`);
        } finally {
            setRevoking(false);
        }
    };

    const handleViewRecords = (patientId) => {
        navigate(`/records?patientId=${patientId}`);
    };

    const handleViewRecord = (recordId) => {
        navigate(`/records/${recordId}`);
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'approved':
                return <CheckCircle size={20} color="var(--color-success)" />;
            case 'denied':
                return <XCircle size={20} color="var(--color-error)" />;
            case 'revoked':
                return <XCircle size={20} color="var(--color-warning)" />;
            default:
                return <Clock size={20} color="var(--color-warning)" />;
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'approved':
                return 'Approved';
            case 'denied':
                return 'Denied';
            case 'revoked':
                return 'Access Revoked';
            default:
                return 'Pending';
        }
    };

    if (loading) {
        return (
            <div className="access-requests-loading">
                <LoadingSpinner text="Loading..." />
            </div>
        );
    }

    return (
        <div className="access-requests-container">
            <div className="access-requests-header">
                <h1>{user.role === 'patient' ? 'Access Requests & Shared Records' : 'My Requests & Shared Records'}</h1>
                <p>
                    {user.role === 'patient'
                        ? 'Manage who can access your medical records'
                        : 'View your access requests and shared records'}
                </p>
            </div>

            {error && (
                <Card>
                    <div className="error-alert">
                        <AlertCircle size={20} />
                        <span>{error}</span>
                    </div>
                </Card>
            )}

            {/* Pending Requests Section */}
            {pendingRequests.length > 0 && (
                <section className="requests-section">
                    <h2>Pending Requests ({pendingRequests.length})</h2>
                    <div className="requests-grid">
                        {pendingRequests.map((request) => (
                            <Card key={request._id} className="request-card">
                                {user.role === 'patient' ? (
                                    // Patient view: Incoming requests
                                    <>
                                        <div className="request-header">
                                            <div className="requester-info">
                                                <User size={24} className="requester-icon" />
                                                <div>
                                                    <h3>{request.requesterId.firstName} {request.requesterId.lastName}</h3>
                                                    <p className="role-badge">{request.requesterId.role}</p>
                                                </div>
                                            </div>
                                            <div className="request-status pending">
                                                <Clock size={16} />
                                                <span>Pending</span>
                                            </div>
                                        </div>

                                        {request.message && (
                                            <div className="request-message">
                                                <p className="message-label">Message:</p>
                                                <p>{request.message}</p>
                                            </div>
                                        )}

                                        <div className="request-meta">
                                            <Calendar size={16} />
                                            <span>Requested {new Date(request.createdAt).toLocaleDateString()}</span>
                                        </div>

                                        <div className="request-actions">
                                            <Button
                                                variant="success"
                                                onClick={() => handleRespond(request._id, 'approve')}
                                                loading={responding === request._id}
                                                disabled={responding}
                                            >
                                                Approve
                                            </Button>
                                            <Button
                                                variant="danger"
                                                onClick={() => handleRespond(request._id, 'deny')}
                                                loading={responding === request._id}
                                                disabled={responding}
                                            >
                                                Deny
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    // Doctor view: Sent requests
                                    <>
                                        <div className="request-header">
                                            <div className="requester-info">
                                                <User size={24} className="requester-icon" />
                                                <div>
                                                    <h3>Request to: {request.patientId.firstName} {request.patientId.lastName}</h3>
                                                    <p className="patient-email">{request.patientId.email}</p>
                                                </div>
                                            </div>
                                            <div className="request-status pending">
                                                <Clock size={16} />
                                                <span>Pending</span>
                                            </div>
                                        </div>

                                        {request.message && (
                                            <div className="request-message">
                                                <p className="message-label">Your message:</p>
                                                <p>{request.message}</p>
                                            </div>
                                        )}

                                        <div className="request-meta">
                                            <Calendar size={16} />
                                            <span>Sent {new Date(request.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </>
                                )}
                            </Card>
                        ))}
                    </div>
                </section>
            )}

            {/* Request History (for doctors/patients) */}
            {requestHistory.length > 0 && (
                <section className="requests-section">
                    <h2>{user.role === 'patient' ? 'Shared With' : 'Request History'} ({requestHistory.length})</h2>
                    <div className="requests-grid">
                        {requestHistory.map((request) => (
                            <Card key={request._id} className="request-card history">
                                {user.role === 'patient' ? (
                                    // Patient view: Who they gave access to
                                    <>
                                        <div className="request-header">
                                            <div className="requester-info">
                                                <User size={24} className="requester-icon" />
                                                <div>
                                                    <h3>{request.requesterId.firstName} {request.requesterId.lastName}</h3>
                                                    <p className="role-badge">{request.requesterId.role}</p>
                                                </div>
                                            </div>
                                            <div className={`request-status ${request.status}`}>
                                                {getStatusIcon(request.status)}
                                                <span>{getStatusText(request.status)}</span>
                                            </div>
                                        </div>

                                        <div className="access-scope">
                                            <FileText size={16} />
                                            <span>All medical records</span>
                                        </div>

                                        <div className="request-meta">
                                            <div>
                                                <Calendar size={16} />
                                                <span>Granted {new Date(request.respondedAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>

                                        {request.status === 'approved' && (
                                            <>
                                                <div className="access-timer">
                                                    <Clock size={16} className="access-timer-icon" />
                                                    <span>Shared {formatDistanceToNow(new Date(request.respondedAt), { addSuffix: true })}</span>
                                                </div>
                                                <div className="access-duration">
                                                    <Infinity size={16} className="access-duration-icon" />
                                                    <span>Permanent access</span>
                                                </div>
                                                <div className="request-action-button">
                                                    <Button
                                                        variant="danger"
                                                        fullWidth
                                                        onClick={() => openRevokeModal(request._id, `${request.requesterId.firstName} ${request.requesterId.lastName}`)}
                                                    >
                                                        Revoke Access
                                                    </Button>
                                                </div>
                                            </>
                                        )}
                                    </>
                                ) : (
                                    // Doctor view: Request history
                                    <>
                                        <div className="request-header">
                                            <div className="requester-info">
                                                <User size={24} className="requester-icon" />
                                                <div>
                                                    <h3>Request to: {request.patientId.firstName} {request.patientId.lastName}</h3>
                                                    <p className="patient-email">{request.patientId.email}</p>
                                                </div>
                                            </div>
                                            <div className={`request-status ${request.status}`}>
                                                {getStatusIcon(request.status)}
                                                <span>{getStatusText(request.status)}</span>
                                            </div>
                                        </div>

                                        <div className="request-meta">
                                            <div>
                                                <Calendar size={16} />
                                                <span>Sent {new Date(request.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            {request.respondedAt && (
                                                <>
                                                    <div>
                                                        <Clock size={16} />
                                                        <span>Responded {new Date(request.respondedAt).toLocaleDateString()}</span>
                                                    </div>
                                                    {request.status === 'approved' && (
                                                        <>
                                                            <div className="access-timer">
                                                                <Clock size={16} className="access-timer-icon" />
                                                                <span>Access granted {formatDistanceToNow(new Date(request.respondedAt), { addSuffix: true })}</span>
                                                            </div>
                                                            <div className="access-duration">
                                                                <Infinity size={16} className="access-duration-icon" />
                                                                <span>Permanent access</span>
                                                            </div>
                                                        </>
                                                    )}
                                                </>
                                            )}
                                        </div>

                                        {request.status === 'approved' && (
                                            <div className="request-action-button">
                                                <Button
                                                    variant="primary"
                                                    icon={<Eye size={18} />}
                                                    fullWidth
                                                    onClick={() => handleViewRecords(request.patientId._id)}
                                                >
                                                    View Patient Records
                                                </Button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </Card>
                        ))}
                    </div>
                </section>
            )}

            {/* Shared Records Section */}
            {sharedRecords.length > 0 && (
                <section className="requests-section">
                    <h2>Shared Records ({sharedRecords.length})</h2>
                    <div className="records-grid">
                        {sharedRecords.map((record) => (
                            <Card key={record._id} className="record-card" hover onClick={() => handleViewRecord(record._id)}>
                                <div className="record-header">
                                    <FileText size={24} className="record-icon" />
                                    <span className="record-type-badge">{record.recordType}</span>
                                </div>
                                <h3>{record.title}</h3>
                                <p className="record-description">
                                    {record.description?.substring(0, 100)}
                                    {record.description?.length > 100 && '...'}
                                </p>
                                <div className="record-meta">
                                    <div>
                                        <User size={16} />
                                        <span>{record.patientId.firstName} {record.patientId.lastName}</span>
                                    </div>
                                    <div>
                                        <Calendar size={16} />
                                        <span>{new Date(record.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="record-view-button">
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        fullWidth
                                        icon={<Eye size={16} />}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleViewRecord(record._id);
                                        }}
                                    >
                                        View Details
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                </section>
            )}

            {/* Share-All Links Section (Doctor only) */}
            {user.role !== 'patient' && shareViaLinks.length > 0 && (
                <section className="requests-section">
                    <h2>Shared via QR Code ({shareViaLinks.length})</h2>
                    <div className="requests-grid">
                        {shareViaLinks.map((share) => (
                            <Card key={share.id} className="request-card share-link">
                                <div className="request-header">
                                    <div className="requester-info">
                                        <User size={24} className="requester-icon" />
                                        <div>
                                            <h3>{share.patient.firstName} {share.patient.lastName}</h3>
                                            <p className="patient-email">{share.patient.email}</p>
                                        </div>
                                    </div>
                                    <div className="share-badge">
                                        <FileText size={16} />
                                        <span>QR Access</span>
                                    </div>
                                </div>

                                <div className="access-scope">
                                    <FileText size={16} />
                                    <span>All medical records (Temporary QR Access)</span>
                                </div>

                                <div className="request-meta">
                                    <div>
                                        <Calendar size={16} />
                                        <span>Accessed {new Date(share.sharedAt).toLocaleDateString()}</span>
                                    </div>
                                    <div>
                                        <Clock size={16} />
                                        <span>Expires {new Date(share.expiresAt).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                <div className="access-meta">
                                    <div className="access-count">
                                        <Eye size={16} />
                                        <span>{share.accessCount} total view{share.accessCount !== 1 ? 's' : ''}</span>
                                    </div>
                                </div>

                                <div className="request-action-button">
                                    <Button
                                        variant="primary"
                                        icon={<Eye size={18} />}
                                        fullWidth
                                        onClick={() => handleViewRecords(share.patient.id)}
                                    >
                                        View Patient Records
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                </section>
            )}

            {/* Empty States */}
            {pendingRequests.length === 0 && sharedRecords.length === 0 && shareViaLinks.length === 0 && requestHistory.length === 0 && (
                <Card>
                    <div className="empty-state">
                        <FileText size={48} />
                        <h3>No {user.role === 'patient' ? 'Access Requests' : 'Requests'} Yet</h3>
                        <p>
                            {user.role === 'patient'
                                ? 'You have no pending access requests or shared records.'
                                : 'You haven\'t requested access to any patient records yet.'}
                        </p>
                    </div>
                </Card>
            )}

            {/* Revoke Access Modal */}
            {revokeModal.open && (
                <div className="modal-overlay" onClick={closeRevokeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>Revoke Access</h2>
                        <p>
                            You are about to revoke <strong>{revokeModal.doctorName}</strong>'s access to your medical records.
                        </p>

                        <div className="revoke-timing-options">
                            <label className="timing-option">
                                <input
                                    type="radio"
                                    value="immediate"
                                    checked={revokeTiming === 'immediate'}
                                    onChange={(e) => setRevokeTiming(e.target.value)}
                                />
                                <div className="timing-label">
                                    <strong>Immediately</strong>
                                    <span>Access will be revoked right now</span>
                                </div>
                            </label>

                            <label className="timing-option">
                                <input
                                    type="radio"
                                    value="4h"
                                    checked={revokeTiming === '4h'}
                                    onChange={(e) => setRevokeTiming(e.target.value)}
                                />
                                <div className="timing-label">
                                    <strong>After 4 hours</strong>
                                    <span>Access will be revoked in 4 hours</span>
                                </div>
                            </label>

                            <label className="timing-option">
                                <input
                                    type="radio"
                                    value="8h"
                                    checked={revokeTiming === '8h'}
                                    onChange={(e) => setRevokeTiming(e.target.value)}
                                />
                                <div className="timing-label">
                                    <strong>After 8 hours</strong>
                                    <span>Access will be revoked in 8 hours</span>
                                </div>
                            </label>
                        </div>

                        <div className="modal-actions">
                            <Button variant="secondary" onClick={closeRevokeModal} disabled={revoking}>
                                Cancel
                            </Button>
                            <Button variant="danger" onClick={handleRevoke} loading={revoking}>
                                Revoke Access
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AccessRequests;
