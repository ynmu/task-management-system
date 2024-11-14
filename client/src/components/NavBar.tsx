import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import './NavBar.css';

interface NavbarProps {
    username: string;
    onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ username, onLogout }) => {
    const location = useLocation(); // Get the current location

    return (
        <nav className="navbar">
            <h1 className="navbar-title">BC Cancer Event Management</h1>
            {location.pathname !== '/' && (
                <Link to="/" className="navbar-back-button">
                    <div>Back to Dashboard</div>
                </Link>
            )}
            <div className="navbar-content">
                <span className="navbar-welcome">Welcome, {username}!</span>
                <button className="navbar-logout" onClick={onLogout}>
                    Log Out
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
