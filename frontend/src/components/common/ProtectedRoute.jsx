import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children }) => {
  const { user, loading, token } = useAuth();

  if (loading) return <LoadingSpinner />;

  if ( !token) return <Navigate to="/login" replace />;

  return children;
};

export default ProtectedRoute;
