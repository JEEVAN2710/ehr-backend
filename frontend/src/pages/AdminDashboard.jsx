import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import LoadingSpinner from '../components/LoadingSpinner';
import EditUserModal from '../components/EditUserModal';
import { Users, CheckCircle, XCircle, Filter, Edit } from 'lucide-react';
import { formatDate, formatRole } from '../utils/utils';
import { USER_ROLES } from '../utils/constants';
import './Dashboard.css';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        role: '',
        isActive: ''
    });
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        loadUsers();
    }, [filters]);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const params = {};
            if (filters.role) params.role = filters.role;
            if (filters.isActive !== '') params.isActive = filters.isActive === 'true';

            const response = await api.getUsers(params);
            setUsers(response.data.users);
        } catch (error) {
            console.error('Failed to load users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusToggle = async (userId, currentStatus) => {
        try {
            await api.updateUserStatus(userId, !currentStatus);
            loadUsers(); // Reload users
        } catch (error) {
            console.error('Failed to update user status:', error);
            alert('Failed to update user status');
        }
    };

    const handleEditUser = (userToEdit) => {
        setSelectedUser(userToEdit);
        setEditModalOpen(true);
    };

    const handleUpdateUser = async (userId, userData) => {
        try {
            await api.updateUser(userId, userData);
            setEditModalOpen(false);
            setSelectedUser(null);
            loadUsers(); // Reload users
            alert('User updated successfully!');
        } catch (error) {
            console.error('Failed to update user:', error);
            throw error; // Re-throw to be caught by modal
        }
    };

    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.isActive).length;
    const inactiveUsers = totalUsers - activeUsers;

    const getRoleBadgeVariant = (role) => {
        switch (role) {
            case USER_ROLES.ADMIN: return 'danger';
            case USER_ROLES.DOCTOR: return 'primary';
            case USER_ROLES.LAB_ASSISTANT: return 'info';
            case USER_ROLES.PATIENT: return 'success';
            default: return 'default';
        }
    };

    if (loading) {
        return <LoadingSpinner text="Loading users..." />;
    }

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div>
                    <h1 className="dashboard-title">Admin Dashboard</h1>
                    <p className="dashboard-subtitle">Manage users and system settings</p>
                </div>
            </div>

            <div className="stats-grid">
                <Card className="stat-card" glass>
                    <div className="stat-icon" style={{ background: 'var(--gradient-primary)' }}>
                        <Users size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Total Users</div>
                        <div className="stat-value">{totalUsers}</div>
                    </div>
                </Card>

                <Card className="stat-card" glass>
                    <div className="stat-icon" style={{ background: 'var(--gradient-success)' }}>
                        <CheckCircle size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Active Users</div>
                        <div className="stat-value">{activeUsers}</div>
                    </div>
                </Card>

                <Card className="stat-card" glass>
                    <div className="stat-icon" style={{ background: 'var(--gradient-danger)' }}>
                        <XCircle size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Inactive Users</div>
                        <div className="stat-value">{inactiveUsers}</div>
                    </div>
                </Card>
            </div>

            <div className="dashboard-section">
                <div className="section-header">
                    <h2>User Management</h2>
                </div>

                <Card glass className="filters-card">
                    <div className="filters-container">
                        <div className="filter-item">
                            <label>Filter by Role:</label>
                            <select
                                value={filters.role}
                                onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                                className="filter-select"
                            >
                                <option value="">All Roles</option>
                                <option value={USER_ROLES.PATIENT}>Patient</option>
                                <option value={USER_ROLES.DOCTOR}>Doctor</option>
                                <option value={USER_ROLES.LAB_ASSISTANT}>Lab Assistant</option>
                                <option value={USER_ROLES.ADMIN}>Admin</option>
                            </select>
                        </div>

                        <div className="filter-item">
                            <label>Filter by Status:</label>
                            <select
                                value={filters.isActive}
                                onChange={(e) => setFilters({ ...filters, isActive: e.target.value })}
                                className="filter-select"
                            >
                                <option value="">All Status</option>
                                <option value="true">Active</option>
                                <option value="false">Inactive</option>
                            </select>
                        </div>
                    </div>
                </Card>

                <div className="users-table-container">
                    <Card glass>
                        <div className="table-responsive">
                            <table className="users-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Phone</th>
                                        <th>Joined</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(u => (
                                        <tr key={u._id}>
                                            <td>
                                                <div className="user-cell">
                                                    <div className="user-avatar-sm">
                                                        {u.firstName[0]}{u.lastName[0]}
                                                    </div>
                                                    <span>{u.firstName} {u.lastName}</span>
                                                </div>
                                            </td>
                                            <td>{u.email}</td>
                                            <td>
                                                <Badge variant={getRoleBadgeVariant(u.role)} size="sm">
                                                    {formatRole(u.role)}
                                                </Badge>
                                            </td>
                                            <td>{u.phoneNumber || '-'}</td>
                                            <td>{formatDate(u.createdAt)}</td>
                                            <td>
                                                <Badge variant={u.isActive ? 'success' : 'danger'} size="sm">
                                                    {u.isActive ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    {u._id !== user._id && (
                                                        <>
                                                            <Button
                                                                variant="secondary"
                                                                size="sm"
                                                                onClick={() => handleEditUser(u)}
                                                            >
                                                                <Edit size={16} style={{ marginRight: '4px' }} />
                                                                Edit
                                                            </Button>
                                                            <Button
                                                                variant={u.isActive ? 'danger' : 'success'}
                                                                size="sm"
                                                                onClick={() => handleStatusToggle(u._id, u.isActive)}
                                                            >
                                                                {u.isActive ? 'Deactivate' : 'Activate'}
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            </div>

            <EditUserModal
                isOpen={editModalOpen}
                onClose={() => {
                    setEditModalOpen(false);
                    setSelectedUser(null);
                }}
                user={selectedUser}
                onSave={handleUpdateUser}
            />
        </div>
    );
};

export default AdminDashboard;
