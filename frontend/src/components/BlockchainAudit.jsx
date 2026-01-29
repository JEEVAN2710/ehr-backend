import React, { useState, useEffect } from 'react';
import api from '../services/api';
import LoadingSpinner from './LoadingSpinner';
import { Clock, CheckCircle, XCircle, FileText, Users, Trash2, Shield } from 'lucide-react';
import './BlockchainAudit.css';

const BlockchainAudit = ({ recordId }) => {
    const [audits, setAudits] = useState([]);
    const [verification, setVerification] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchBlockchainData();
    }, [recordId]);

    const fetchBlockchainData = async () => {
        try {
            setLoading(true);
            setError('');

            // Fetch audit trail and verification in parallel
            const [auditRes, verifyRes] = await Promise.all([
                api.getBlockchainAudit(recordId),
                api.verifyRecordIntegrity(recordId)
            ]);

            setAudits(auditRes.data.audits || []);
            setVerification(verifyRes.data);
        } catch (error) {
            console.error('Failed to fetch blockchain data:', error);
            setError(error.response?.data?.message || 'Failed to load blockchain audit trail');
        } finally {
            setLoading(false);
        }
    };

    const getActionIcon = (action) => {
        switch (action) {
            case 'CREATE':
                return <FileText size={20} className="action-icon create" />;
            case 'UPDATE':
                return <FileText size={20} className="action-icon update" />;
            case 'DELETE':
                return <Trash2 size={20} className="action-icon delete" />;
            case 'ACCESS_GRANTED':
            case 'ACCESS_REVOKED':
                return <Users size={20} className="action-icon access" />;
            default:
                return <FileText size={20} className="action-icon" />;
        }
    };

    const getActionColor = (action) => {
        switch (action) {
            case 'CREATE':
                return '#3b82f6'; // blue
            case 'UPDATE':
                return '#f59e0b'; // orange
            case 'DELETE':
                return '#ef4444'; // red
            case 'ACCESS_GRANTED':
            case 'ACCESS_REVOKED':
                return '#10b981'; // green
            default:
                return '#6b7280'; // gray
        }
    };

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        // Could add a toast notification here
    };

    if (loading) {
        return <LoadingSpinner text="Loading blockchain audit..." />;
    }

    if (error) {
        return (
            <div className="blockchain-error">
                <XCircle size={48} />
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="blockchain-audit-container">
            {/* Verification Status Badge */}
            <div className={`verification-badge ${verification?.isValid ? 'verified' : 'tampered'}`}>
                {verification?.isValid ? (
                    <>
                        <CheckCircle size={24} />
                        <div>
                            <h3>✅ Verified</h3>
                            <p>Record integrity intact - data matches blockchain</p>
                        </div>
                    </>
                ) : (
                    <>
                        <Shield size={24} />
                        <div>
                            <h3>⚠️ Integrity Check</h3>
                            <p>Record data hash: {verification?.currentHash?.substring(0, 16)}...</p>
                        </div>
                    </>
                )}
            </div>

            {/* Audit Trail Timeline */}
            <div className="audit-timeline">
                <h3 className="timeline-title">
                    <Clock size={20} />
                    Audit Trail ({audits.length} {audits.length === 1 ? 'entry' : 'entries'})
                </h3>

                {audits.length === 0 ? (
                    <div className="no-audits">
                        <FileText size={48} />
                        <p>No blockchain audits found for this record</p>
                        <p className="hint">Audits will appear when you create or modify records</p>
                    </div>
                ) : (
                    <div className="timeline">
                        {audits.map((audit, index) => (
                            <div
                                key={index}
                                className="timeline-entry"
                                style={{ '--action-color': getActionColor(audit.action) }}
                            >
                                <div className="timeline-marker">
                                    {getActionIcon(audit.action)}
                                </div>
                                <div className="timeline-content">
                                    <div className="timeline-header">
                                        <h4>{audit.action.replace('_', ' ')}</h4>
                                        <span className="timeline-date">{formatDate(audit.timestamp)}</span>
                                    </div>
                                    <div className="timeline-details">
                                        <div className="detail-row">
                                            <span className="label">Performed by:</span>
                                            <span className="value">{audit.metadata?.createdBy || 'Unknown'} ({audit.metadata?.role || 'N/A'})</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="label">Wallet:</span>
                                            <span className="value monospace">{audit.userAddress?.substring(0, 16)}...</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="label">Data Hash:</span>
                                            <span
                                                className="value monospace clickable"
                                                onClick={() => copyToClipboard(audit.dataHash)}
                                                title="Click to copy"
                                            >
                                                {audit.dataHash?.substring(0, 32)}...
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Blockchain Info */}
            <div className="blockchain-info">
                <Shield size={16} />
                <p>All transactions are permanent and immutable on the blockchain</p>
            </div>
        </div>
    );
};

export default BlockchainAudit;
