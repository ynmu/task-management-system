import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import '../css/Dashboard.css'; 
import UserInfo from '../components/users/UserInfo';
import profilePic from '../assets/profile-test-avatar.png'; // Importing the profile picture
import '../css/Pages.css';
import { API_BASE_URL } from '../config';
import { saveAs } from 'file-saver'; // Import file-saver

interface Job {
  id: string;
  name: string;
  progress: boolean;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [ongoingJobs, setOngoingJobs] = useState<Job[]>([]);

  useEffect(() => {
    const fetchOngoingJobs = async () => {
      if (user?.roleId) {
        try {
          const response = await axios.get(`${API_BASE_URL}/events/role/${user.roleId}`);
          const jobs: Job[] = response.data.map((event: any) => ({
            id: String(event.id),
            name: event.name,
            progress: event.status, // Assuming 'status' maps to progress
          }));
          setOngoingJobs(jobs);
        } catch (error) {
          console.error('Error fetching ongoing jobs:', error);
        }
      }
    };

    fetchOngoingJobs();
  }, [user?.roleId]);

  const handleCheckboxChange = async (jobId: string) => {
    // Find the job in the state and toggle its progress
    const updatedJobs = ongoingJobs.map(job =>
      job.id === jobId ? { ...job, progress: !job.progress } : job
    );

    // Update state with the new jobs list
    setOngoingJobs(updatedJobs);

    // Optionally: Make an API call to update the progress status on the backend
    try {
      const jobToUpdate = updatedJobs.find(job => job.id === jobId);
      await axios.put(`${API_BASE_URL}/events/${jobId}`, { status: jobToUpdate?.progress });
    } catch (error) {
      console.error('Error updating job status:', error);
      // Optionally: Revert the state change if the API call fails
      setOngoingJobs(ongoingJobs);
    }
  };

  const exportToCSV = () => {
    const csvData = ongoingJobs.map((job) => ({
      ID: job.id,
      Name: job.name,
      'Progress Status': job.progress ? 'In Progress' : 'Completed',
    }));

    const csvHeader = ['ID', 'Name', 'Progress Status'];

    let csvContent = csvHeader.join(',') + '\n';
    csvData.forEach((row) => {
      csvContent += Object.values(row).join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'ongoing-jobs.csv');
  };

  return (
    <div className="dashboard">
      <div className="dashboard-container">
        <main className="dashboard-main">
          <UserInfo
            role={user?.roleName || 'N/A'}
            employeeNumber={user?.employeeNumber?.toString() || ''}
            userName={user?.userName || ''}
            ongoingJobsCount={ongoingJobs.length}
            profilePic={profilePic}
          />
          <section className="ongoing-jobs-section">
            <div className="ongoing-jobs-table">
              <div className='ongoing-jobs-header' id='ongoing-label'>Ongoing Jobs</div>
              <div className="ongoing-jobs-header">
                <span>ID</span>
                <span id="ongoing-jobs-name">Name</span>
                <span>Progress Status</span>
              </div>
              <div className="ongoing-jobs-list">
                {ongoingJobs.map((job) => (
                  <div key={job.id} className="ongoing-job-item">
                    <span>{String(job.id).padStart(3, '0')}</span>
                    <span>{job.name}</span>
                    <input
                      type="checkbox"
                      checked={job.progress}
                      onChange={() => handleCheckboxChange(job.id)}
                    />
                  </div>
                ))}
              </div>
            </div>
            <button onClick={exportToCSV} className="export-csv-button">
              Export Jobs to CSV
            </button>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;