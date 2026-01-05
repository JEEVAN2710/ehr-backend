import React from 'react';
import { useAuth } from '../context/AuthContext';
import { USER_ROLES } from '../utils/constants';
import PatientDashboard from './PatientDashboard';
import DoctorDashboard from './DoctorDashboard';
import LabAssistantDashboard from './LabAssistantDashboard';
import AdminDashboard from './AdminDashboard';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner text="Loading dashboard..." />;
  }

  // Route to appropriate dashboard based on user role
  switch (user?.role) {
    case USER_ROLES.PATIENT:
      return <PatientDashboard />;
    case USER_ROLES.DOCTOR:
      return <DoctorDashboard />;
    case USER_ROLES.LAB_ASSISTANT:
      return <LabAssistantDashboard />;
    case USER_ROLES.ADMIN:
      return <AdminDashboard />;
    default:
      return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>Invalid Role</h2>
          <p>Your account role is not recognized. Please contact support.</p>
        </div>
      );
  }
};

export default Dashboard;
