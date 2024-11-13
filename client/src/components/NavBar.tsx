import React from 'react';
import './NavBar.css'; // Optional CSS file for styling

interface NavbarProps {
  username: string;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ username, onLogout }) => {
  return (
    <nav className="navbar">
        <h1 className="navbar-title">BC Cancer Event Management</h1>
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
