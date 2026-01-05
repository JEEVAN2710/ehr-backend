import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    FileText,
    Share2,
    Users,
    User,
    LogOut,
    Menu,
    X,
    Activity
} from 'lucide-react';
import Button from './Button';
import Badge from './Badge';
import { formatRole } from '../utils/utils';
import { USER_ROLES } from '../utils/constants';
import './DashboardLayout.css';

const DashboardLayout = ({ children }) => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getMenuItems = () => {
        const baseItems = [
            {
                icon: <LayoutDashboard size={20} />,
                label: 'Dashboard',
                path: '/dashboard',
                roles: [USER_ROLES.PATIENT, USER_ROLES.DOCTOR, USER_ROLES.LAB_ASSISTANT, USER_ROLES.ADMIN]
            },
            {
                icon: <FileText size={20} />,
                label: 'Medical Records',
                path: '/records',
                roles: [USER_ROLES.PATIENT, USER_ROLES.DOCTOR, USER_ROLES.LAB_ASSISTANT]
            },
            {
                icon: <Share2 size={20} />,
                label: 'Shared With Me',
                path: '/shared-records',
                roles: [USER_ROLES.PATIENT, USER_ROLES.DOCTOR, USER_ROLES.LAB_ASSISTANT]
            },
            {
                icon: <Users size={20} />,
                label: 'User Management',
                path: '/users',
                roles: [USER_ROLES.ADMIN]
            },
            {
                icon: <User size={20} />,
                label: 'Profile',
                path: '/profile',
                roles: [USER_ROLES.PATIENT, USER_ROLES.DOCTOR, USER_ROLES.LAB_ASSISTANT, USER_ROLES.ADMIN]
            }
        ];

        return baseItems.filter(item => item.roles.includes(user?.role));
    };

    const menuItems = getMenuItems();
    const isActive = (path) => location.pathname === path;

    return (
        <div className="dashboard-layout">
            {/* Sidebar */}
            <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
                <div className="sidebar-header">
                    <div className="logo">
                        <Activity size={32} className="logo-icon" />
                        <span className="logo-text">HealthCare EHR</span>
                    </div>
                    <button
                        className="sidebar-close"
                        onClick={() => setSidebarOpen(false)}
                        aria-label="Close sidebar"
                    >
                        <X size={24} />
                    </button>
                </div>

                <nav className="sidebar-nav">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`nav-item ${isActive(item.path) ? 'nav-item-active' : ''}`}
                            onClick={() => setSidebarOpen(false)}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <Button
                        variant="danger"
                        fullWidth
                        icon={<LogOut size={18} />}
                        onClick={handleLogout}
                    >
                        Logout
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="main-content">
                {/* Top Header */}
                <header className="top-header glass">
                    <button
                        className="menu-toggle"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        aria-label="Toggle sidebar"
                    >
                        <Menu size={24} />
                    </button>

                    <div className="header-user">
                        <div className="user-info">
                            <div className="user-name">{user?.firstName} {user?.lastName}</div>
                            <Badge variant="primary" size="sm">
                                {formatRole(user?.role)}
                            </Badge>
                        </div>
                        <div className="user-avatar">
                            {user?.firstName?.[0]}{user?.lastName?.[0]}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="page-content">
                    {children}
                </main>
            </div>

            {/* Backdrop for mobile */}
            {sidebarOpen && (
                <div
                    className="sidebar-backdrop"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    );
};

export default DashboardLayout;
