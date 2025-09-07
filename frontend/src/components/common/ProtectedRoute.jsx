// import React from 'react';
// import { Navigate } from 'react-router-dom';
// import { useAuth } from '../../Context/AuthContext';
// import LoadingSpinner from './LoadingSpinner';

// const ProtectedRoute = ({ children }) => {
//   const { user, loading, token } = useAuth();

//   if (loading) return <LoadingSpinner />;

//   if ( !token) return <Navigate to="/login" replace />;

//   return children;
// };

// export default ProtectedRoute;
import React from 'react';
import { Navigate } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children }) => {
  // Check token directly from localStorage
  const token = localStorage.getItem('token');

  if (!token) {
    // If no token, redirect to login
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
