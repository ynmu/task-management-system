import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Loader.css';

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="lds-facebook"><div></div><div></div><div></div></div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
