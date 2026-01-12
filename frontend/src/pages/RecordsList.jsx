import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import { FileText, Calendar, User, AlertCircle, Search, ArrowLeft } from 'lucide-react';
import './RecordsList.css';

const RecordsList = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const patientIdFilter = searchParams.get('patientId');

    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [patientInfo, setPatientInfo] = useState(null);

    useEffect(() => {
        fetchRecords();
    }, [patientIdFilter]);

    const fetchRecords = async () => {
        try {
            setLoading(true);
            setError('');

            let response;
            const targetPatientId = patientIdFilter || user._id;

            if (user.role === 'patient') {
                response = await api.getPatientRecords(user._id);
            } else {
                // For doctors/lab assistants, get records for specified patient
                response = await api.getPatientRecords(targetPatientId);
            }

            setRecords(response.data.records || []);

            // If viewing another patient's records, get patient info
            if (patientIdFilter && response.data.records.length > 0) {
                const firstRecord = response.data.records[0];
                setPatientInfo(firstRecord.patientId);
            }
        } catch (err) {
            setError(err.message || 'Failed to load records');
        } finally {
            setLoading(false);
        }
    };

    const filteredRecords = records.filter(record => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return (
            record.title?.toLowerCase().includes(search) ||
            record.description?.toLowerCase().includes(search) ||
            record.recordType?.toLowerCase().includes(search)
        );
    });

    const handleViewRecord = (recordId) => {
        navigate(`/records/${recordId}`);
    };

    if (loading) {
        return (
            <div className="records-list-loading">
                <LoadingSpinner text="Loading records..." />
            </div>
        );
    }

    return (
        <div className="records-list-container">
            <div className="records-list-header">
                <div>
                    {patientIdFilter && (
                        <Button
                            variant="ghost"
                            size="sm"
                            icon={<ArrowLeft size={18} />}
                            onClick={() => navigate('/shared-records')}
                            style={{ marginBottom: '1rem' }}
                        >
                            Back to Shared Records
                        </Button>
                    )}
                    <h1>{patientInfo ? `${patientInfo.firstName} ${patientInfo.lastName}'s Medical Records` : 'Medical Records'}</h1>
                    <p>{patientInfo ? patientInfo.email : 'View and manage all medical records'}</p>
                </div>
                {user.role !== 'patient' && !patientIdFilter && (
                    <Button onClick={() => navigate('/records/create')}>
                        Create New Record
                    </Button>
                )}
            </div>

            {error && (
                <Card>
                    <div className="error-alert">
                        <AlertCircle size={20} />
                        <span>{error}</span>
                    </div>
                </Card>
            )}

            <Card glass>
                <div className="search-bar">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Search records by title, description, or type..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </Card>

            {filteredRecords.length === 0 ? (
                <Card>
                    <div className="empty-state">
                        <FileText size={48} />
                        <h3>No Records Found</h3>
                        <p>
                            {searchTerm
                                ? 'No records match your search criteria'
                                : 'No medical records available yet'}
                        </p>
                        {user.role !== 'patient' && !searchTerm && (
                            <Button onClick={() => navigate('/records/create')}>
                                Create First Record
                            </Button>
                        )}
                    </div>
                </Card>
            ) : (
                <div className="records-grid">
                    {filteredRecords.map((record) => (
                        <Card key={record._id} className="record-card" hover>
                            <div className="record-card-content" onClick={() => handleViewRecord(record._id)}>
                                <div className="record-card-header">
                                    <FileText size={24} className="record-icon" />
                                    <span className="record-type-badge">{record.recordType}</span>
                                </div>

                                <h3 className="record-title">{record.title}</h3>
                                <p className="record-description">
                                    {record.description?.length > 120
                                        ? `${record.description.substring(0, 120)}...`
                                        : record.description}
                                </p>

                                <div className="record-meta">
                                    <div className="meta-item">
                                        <Calendar size={16} />
                                        <span>{new Date(record.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    {record.createdBy && (
                                        <div className="meta-item">
                                            <User size={16} />
                                            <span>
                                                {record.createdBy.firstName} {record.createdBy.lastName}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {record.files && record.files.length > 0 && (
                                    <div className="files-badge">
                                        {record.files.length} file{record.files.length > 1 ? 's' : ''} attached
                                    </div>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {filteredRecords.length > 0 && (
                <div className="records-summary">
                    Showing {filteredRecords.length} of {records.length} record{records.length > 1 ? 's' : ''}
                </div>
            )}
        </div>
    );
};

export default RecordsList;
