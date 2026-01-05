import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import DashboardLayout from './components/DashboardLayout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import CreateRecord from './pages/CreateRecord';
import LoadingSpinner from './components/LoadingSpinner';

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh'
      }}>
        <LoadingSpinner text="Loading..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
};

// Public Route wrapper (redirect to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh'
      }}>
        <LoadingSpinner text="Loading..." />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Placeholder component for not yet created pages
const ComingSoon = ({ pageName }) => (
  <div style={{ textAlign: 'center', padding: '3rem' }}>
    <h2>{pageName}</h2>
    <p style={{ color: 'var(--color-text-secondary)', marginTop: '1rem' }}>
      This page is under construction. Basic functionality is in place via the dashboard.
    </p>
  </div>
);

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />

      <Route path="/signup" element={
        <PublicRoute>
          <Signup />
        </PublicRoute>
      } />

      {/* Protected Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />

      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />

      <Route path="/records" element={
        <ProtectedRoute>
          <ComingSoon pageName="Medical Records List" />
        </ProtectedRoute>
      } />

      <Route path="/records/create" element={
        <ProtectedRoute>
          <CreateRecord />
        </ProtectedRoute>
      } />

      <Route path="/records/:id" element={
        <ProtectedRoute>
          <ComingSoon pageName="Record Details" />
        </ProtectedRoute>
      } />

      <Route path="/shared-records" element={
        <ProtectedRoute>
          <ComingSoon pageName="Shared Records" />
        </ProtectedRoute>
      } />

      <Route path="/users" element={
        <ProtectedRoute>
          <ComingSoon pageName="User Management" />
        </ProtectedRoute>
      } />

      {/* Default Route */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* 404 */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
