// src/pages/Dashboard.tsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css'; 
import UserInfo from '../components/UserInfo';
import profilePic from '../assets/profile-test-avatar.png'; // Importing the profile picture
import './Pages.css';
import AuthPage from './AuthPage';

interface Job {
  id: string;
  name: string;
  progress: boolean;
}

const Dashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <AuthPage />; // Display login/signup if not authenticated
  }

  // Mock data for demonstration purposes
  const ongoingJobs: Job[] = [
    { id: '0001', name: '2024 Porche Pink Parade Vancouver', progress: false },
    { id: '0002', name: 'The Multiple Myeloma March', progress: false },
    { id: '0003', name: 'Royal Victoria Marathon', progress: false },
  ];

  return (
    <div className="dashboard">
      <header className="page-header">
        <h1>Dashboard</h1>
      </header>
      <div className="dashboard-container">
        <aside className="dashboard-sidebar">
          <button
            className="dashboard-button"
            onClick={() => window.location.href = '/add-event'}>
              Add Event
          </button>

          <button className="dashboard-button">Edit Event</button>
          <button className="dashboard-button">View Events</button>
          <button className="dashboard-button">Users</button>
        </aside>
        <main className="dashboard-main">
          <UserInfo
            role={user?.roleName || 'N/A'} // Fallback to 'N/A' if role or roleName is undefined
            employeeNumber={user?.employeeNumber?.toString() || ''} // Convert to string or use empty string
            userName={user?.userName || ''} // Fallback to empty string if undefined
            ongoingJobsCount={ongoingJobs.length}
            profilePic={profilePic} // Passing the profile picture as a prop
          />
          <section className="ongoing-jobs-section">
            <div className="ongoing-jobs-table">
              <div className='ongoing-jobs-header' id='ongoing-label'>Ongoing Jobs</div>
              <div className="ongoing-jobs-header">
                <span>ID</span>
                <span>Name</span>
                <span>Progress Status</span>
              </div>
              <div className="ongoing-jobs-list">
                {ongoingJobs.map((job) => (
                  <div key={job.id} className="ongoing-job-item">
                    <span>{job.id}</span>
                    <span>{job.name}</span>
                    <input type="checkbox" checked={job.progress} readOnly />
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
