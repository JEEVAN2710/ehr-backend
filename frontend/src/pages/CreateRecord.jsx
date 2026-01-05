import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import FileUpload from '../components/FileUpload';
import { Mail, FileText, AlertCircle, ArrowLeft, CheckCircle } from 'lucide-react';
import { RECORD_TYPES } from '../utils/constants';
import './CreateRecord.css';

const CreateRecord = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        patientEmail: '',
        title: '',
        description: '',
        recordType: 'other'
    });
    const [patientId, setPatientId] = useState(null);
    const [patientInfo, setPatientInfo] = useState(null);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [verifyingEmail, setVerifyingEmail] = useState(false);
    const [emailVerified, setEmailVerified] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleVerifyEmail = async (e) => {
        e.preventDefault();

        if (!formData.patientEmail) {
            setError('Please enter patient email');
            return;
        }

        try {
            setVerifyingEmail(true);
            setError('');

            // Find patient by email
            const response = await api.getUsers({ email: formData.patientEmail, role: 'patient' });

            if (!response.data.users || response.data.users.length === 0) {
                throw new Error('Patient not found with this email');
            }

            const patient = response.data.users[0];
            setPatientId(patient._id);
            setPatientInfo(patient);
            setEmailVerified(true);
        } catch (err) {
            setError(err.message || 'Failed to verify patient email');
            setEmailVerified(false);
            setPatientId(null);
            setPatientInfo(null);
        } finally {
            setVerifyingEmail(false);
        }
    };

    const handleFileUpload = async (file, onProgress) => {
        try {
            // Step 1: Get presigned upload URL
            onProgress(20);
            const uploadResponse = await api.getPresignedUploadUrl(
                file.name,
                file.type,
                patientId
            );

            // Step 2: Upload file to R2
            onProgress(50);
            await api.uploadFileToR2(uploadResponse.data.uploadUrl, file);

            // Step 3: Store file info
            onProgress(100);
            const fileInfo = {
                key: uploadResponse.data.key,
                filename: file.name,
                contentType: file.type,
                size: file.size
            };

            setUploadedFiles(prev => [...prev, fileInfo]);
        } catch (error) {
            throw new Error('Upload failed: ' + error.message);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!emailVerified || !patientId) {
            setError('Please verify patient email first');
            return;
        }

        if (!formData.title.trim()) {
            setError('Please enter a title');
            return;
        }

        if (!formData.description.trim()) {
            setError('Please enter a description');
            return;
        }

        try {
            setLoading(true);
            setError('');

            // Step 1: Create medical record
            const recordResponse = await api.createRecord({
                patientId,
                title: formData.title,
                description: formData.description,
                recordType: formData.recordType
            });

            // Step 2: Link all uploaded files to the record
            for (const fileInfo of uploadedFiles) {
                await api.addFileToRecord(recordResponse.data._id, fileInfo);
            }

            // Success!
            alert('Medical record created successfully!');
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Failed to create record');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-record-container">
            <div className="create-record-header">
                <Button
                    variant="ghost"
                    icon={<ArrowLeft size={20} />}
                    onClick={() => navigate('/dashboard')}
                >
                    Back to Dashboard
                </Button>
                <h1>Create Medical Record</h1>
                <p>Add a new medical record for a patient</p>
            </div>

            <Card glass>
                {error && (
                    <div className="error-alert">
                        <AlertCircle size={20} />
                        <span>{error}</span>
                    </div>
                )}

                {/* Step 1: Verify Patient Email */}
                <div className="form-section">
                    <h3>Step 1: Find Patient</h3>
                    <form onSubmit={handleVerifyEmail}>
                        <div className="email-verify-group">
                            <Input
                                label="Patient Email Address"
                                type="email"
                                name="patientEmail"
                                value={formData.patientEmail}
                                onChange={handleChange}
                                placeholder="patient@example.com"
                                icon={<Mail size={18} />}
                                required
                                disabled={emailVerified}
                            />
                            <Button
                                type="submit"
                                variant={emailVerified ? 'success' : 'primary'}
                                loading={verifyingEmail}
                                disabled={emailVerified}
                            >
                                {emailVerified ? 'Verified ✓' : verifyingEmail ? 'Verifying...' : 'Verify Email'}
                            </Button>
                        </div>
                    </form>

                    {patientInfo && (
                        <div className="patient-info">
                            <CheckCircle size={20} className="success-icon" />
                            <div>
                                <p><strong>Patient Found:</strong></p>
                                <p>{patientInfo.firstName} {patientInfo.lastName}</p>
                                <p className="small-text">{patientInfo.email}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Step 2: Record Details */}
                {emailVerified && (
                    <form onSubmit={handleSubmit}>
                        <div className="form-section">
                            <h3>Step 2: Record Information</h3>

                            <Input
                                label="Record Title"
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g., Blood Test Results, X-Ray Report"
                                icon={<FileText size={18} />}
                                required
                            />

                            <div className="input-wrapper">
                                <label className="input-label">
                                    Record Type<span className="input-required">*</span>
                                </label>
                                <select
                                    name="recordType"
                                    value={formData.recordType}
                                    onChange={handleChange}
                                    className="input-field"
                                >
                                    <option value={RECORD_TYPES.PRESCRIPTION}>Prescription</option>
                                    <option value={RECORD_TYPES.LAB_TEST}>Lab Test</option>
                                    <option value={RECORD_TYPES.SCAN}>Scan</option>
                                    <option value={RECORD_TYPES.REPORT}>Report</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div className="input-wrapper">
                                <label className="input-label">
                                    Description<span className="input-required">*</span>
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Detailed description of the medical record..."
                                    className="input-field textarea"
                                    rows="5"
                                    required
                                />
                            </div>
                        </div>

                        {/* Step 3: File Upload */}
                        <div className="form-section">
                            <h3>Step 3: Attach Files (Optional)</h3>
                            <p className="section-subtitle">Upload medical reports, test results, or images</p>

                            <FileUpload onFileUploaded={handleFileUpload} />

                            {uploadedFiles.length > 0 && (
                                <div className="uploaded-files-summary">
                                    <p><strong>{uploadedFiles.length} file(s) ready to attach:</strong></p>
                                    <ul>
                                        {uploadedFiles.map((file, index) => (
                                            <li key={index}>{file.filename}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Submit Button */}
                        <div className="form-actions">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => navigate('/dashboard')}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                loading={loading}
                                disabled={loading}
                            >
                                {loading ? 'Creating Record...' : 'Create Medical Record'}
                            </Button>
                        </div>
                    </form>
                )}
            </Card>
        </div>
    );
};

export default CreateRecord;
