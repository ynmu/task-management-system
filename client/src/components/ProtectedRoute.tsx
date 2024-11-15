// src/components/ProtectedRoute.tsx
import React from 'react';
import { Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthPage from '../pages/AuthPage'; // or any login page you use

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    // Redirect to AuthPage if not authenticated
    return <Navigate to="/auth" />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
