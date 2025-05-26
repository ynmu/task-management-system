import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { MenuOutlined } from '@ant-design/icons';
import '../../css/NavBar.css';
import { useAuth } from '../../context/AuthContext';

const Navbar: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="flex items-center gap-4">
        <h1 className="navbar-title">BC Cancer Event Management</h1>
      </div>

      <div className="navbar-links">
        {location.pathname !== '/' && isAuthenticated && (
          <Link to="/" className="navbar-back-button">
            <div>Back to Dashboard</div>
          </Link>
        )}
      </div>

      <div className="navbar-content">
        {user ? (
          <>
            <span className="navbar-welcome">Welcome, {user.userName}!</span>
            <button className="navbar-logout" onClick={logout}>
              Log Out
            </button>
          </>
        ) : (
          <span className="navbar-welcome">Welcome!</span>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
