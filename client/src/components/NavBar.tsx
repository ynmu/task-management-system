import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import './NavBar.css';
import { useAuth } from '../context/AuthContext'; // Import useAuth

const Navbar: React.FC = () => {
  const location = useLocation(); // Get the current location
  const { isAuthenticated, user, logout } = useAuth(); // Access user data and logout function from the context

  return (
    <nav className="navbar">
      <h1 className="navbar-title">BC Cancer Event Management</h1>
      {location.pathname !== '/' && isAuthenticated && (
        <Link to="/" className="navbar-back-button">
          <div>Back to Dashboard</div>
        </Link>
      )}
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
