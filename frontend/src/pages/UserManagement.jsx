import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import Badge from '../components/Badge';
import EditUserModal from '../components/EditUserModal';
import { Users, Search, Mail, Calendar, Edit, CheckCircle, XCircle, Filter } from 'lucide-react';
import { formatDate, formatRole } from '../utils/utils';
import { USER_ROLES } from '../utils/constants';
import './UserManagement.css';

const UserManagement = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
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
            setError('');
            const params = {};
            if (filters.role) params.role = filters.role;
            if (filters.isActive !== '') params.isActive = filters.isActive === 'true';

            const response = await api.getAllUsers(params);
            setUsers(response.data.users || []);
        } catch (err) {
            setError(err.message || 'Failed to load users');
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

    const filteredUsers = users.filter(user => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return (
            user.firstName?.toLowerCase().includes(search) ||
            user.lastName?.toLowerCase().includes(search) ||
            user.email?.toLowerCase().includes(search) ||
            user.role?.toLowerCase().includes(search)
        );
    });

    const getRoleBadgeVariant = (role) => {
        switch (role) {
            case 'admin':
                return 'danger';
            case 'doctor':
                return 'primary';
            case 'patient':
                return 'success';
            case 'labassistant':
                return 'warning';
            default:
                return 'secondary';
        }
    };

    if (loading) {
        return (
            <div className="user-management-loading">
                <LoadingSpinner text="Loading users..." />
            </div>
        );
    }

    return (
        <div className="user-management-container">
            <div className="user-management-header">
                <div>
                    <h1>User Management</h1>
                    <p>Manage all system users</p>
                </div>
            </div>

            {error && (
                <Card>
                    <div className="error-alert">
                        {error}
                    </div>
                </Card>
            )}

            <Card glass>
                <div className="search-bar">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Search users by name, email, or role..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </Card>

            {/* Filters */}
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

            <div className="users-stats">
                <Card className="stat-card">
                    <div className="stat-icon">
                        <Users size={24} />
                    </div>
                    <div className="stat-info">
                        <div className="stat-value">{users.length}</div>
                        <div className="stat-label">Total Users</div>
                    </div>
                </Card>
                <Card className="stat-card">
                    <div className="stat-value">{users.filter(u => u.role === 'patient').length}</div>
                    <div className="stat-label">Patients</div>
                </Card>
                <Card className="stat-card">
                    <div className="stat-value">{users.filter(u => u.role === 'doctor').length}</div>
                    <div className="stat-label">Doctors</div>
                </Card>
                <Card className="stat-card">
                    <div className="stat-value">{users.filter(u => u.role === 'labassistant').length}</div>
                    <div className="stat-label">Lab Assistants</div>
                </Card>
            </div>

            {filteredUsers.length === 0 ? (
                <Card>
                    <div className="empty-state">
                        <Users size={48} />
                        <h3>No Users Found</h3>
                        <p>
                            {searchTerm
                                ? 'No users match your search criteria'
                                : 'No users in the system yet'}
                        </p>
                    </div>
                </Card>
            ) : (
                <div className="users-table-container">
                    <Card>
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th>Joined</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((u) => (
                                    <tr key={u._id}>
                                        <td>
                                            <div className="user-name">
                                                <div className="user-avatar">
                                                    {u.firstName?.[0]}{u.lastName?.[0]}
                                                </div>
                                                <span>{u.firstName} {u.lastName}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="user-email">
                                                <Mail size={16} />
                                                {u.email}
                                            </div>
                                        </td>
                                        <td>
                                            <Badge variant={getRoleBadgeVariant(u.role)}>
                                                {formatRole(u.role)}
                                            </Badge>
                                        </td>
                                        <td>
                                            <Badge variant={u.isActive ? 'success' : 'danger'} size="sm">
                                                {u.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </td>
                                        <td>
                                            <div className="user-date">
                                                <Calendar size={16} />
                                                {formatDate(u.createdAt)}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="table-actions">
                                                {u._id !== user._id && (
                                                    <>
                                                        <Button
                                                            variant="secondary"
                                                            size="sm"
                                                            onClick={() => handleEditUser(u)}
                                                        >
                                                            <Edit size={16} />
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
                    </Card>
                </div>
            )}

            <div className="users-summary">
                Showing {filteredUsers.length} of {users.length} user{users.length !== 1 ? 's' : ''}
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

export default UserManagement;
