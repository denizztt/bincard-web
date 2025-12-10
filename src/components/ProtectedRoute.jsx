import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/EnhancedAuthContext';
import Layout from './Layout';

const ProtectedRoute = ({ children, noLayout = false }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Yükleniyor...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If noLayout is true, return children without Layout (for login, register, etc.)
  if (noLayout) {
    return children;
  }

  // Wrap children with Layout for all protected routes
  return <Layout>{children}</Layout>;
};

export default ProtectedRoute;