import React from 'react';
import './SideBar.css';

const SideBar: React.FC = () => {
    return (
        <aside className="sidebar">
            <button
                className="sidebar-button"
                onClick={() => window.location.href = '/add-event'}>
                Add Event
            </button>
            <button 
                className="sidebar-button"
                onClick={() => window.location.href = '/edit-event'}>
                Edit Event
            </button>
            <button
                className="sidebar-button"
                onClick={() => window.location.href = '/view-event'}>
                View Events
            </button>
            <button
                className="sidebar-button"
                onClick={() => window.location.href = '/view-users'}>
                Users
            </button>
        </aside>
    );
};

export default SideBar;