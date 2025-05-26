import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import '../css/Dashboard.css'; 
import UserInfo from '../components/users/UserInfo';
import profilePic from '../assets/profile-test-avatar.png';
import '../css/Pages.css';
import '../css/Dashboard.css';
import { API_BASE_URL } from '../config';
import { saveAs } from 'file-saver';
import UserAvatar from '../components/users/UserAvatar';
import DashboardNotes from '../components/notes/DashboardNotes';

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
            progress: event.status,
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
    const updatedJobs = ongoingJobs.map(job =>
      job.id === jobId ? { ...job, progress: !job.progress } : job
    );

    setOngoingJobs(updatedJobs);

    try {
      const jobToUpdate = updatedJobs.find(job => job.id === jobId);
      await axios.put(`${API_BASE_URL}/events/${jobId}`, { status: jobToUpdate?.progress });
    } catch (error) {
      console.error('Error updating job status:', error);
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

  if (!user) {
    return null;
  }

  return (
    <div className="dashboard-wrapper h-screen">
      <div className="flex flex-row items-start justify-center w-full gap-6 h-full">
        {/* User and ongoing jobs section */}
        <div className="flex flex-col items-center justify-center w-3/5">
          {/* User Info Section */}
          <div className="user-info-section mb-6 w-full">
            <div className="profile-card">
              <div className="flex items-center justify-center mb-4">
                <UserAvatar userName={user?.userName} firstName={user?.firstName} lastName={user?.lastName} profileUrl={user?.profileUrl} size={120}/>
              </div>
              <div className="user-details">
                <h2 className="user-name">
                  { user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.userName || 'N/A' }
                </h2>
                <div className="user-meta">
                  <div className="meta-item">
                    <span className="meta-label">Role</span>
                    <span className="meta-value">{user?.roleName || 'N/A'}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Employee #</span>
                    <span className="meta-value">{user?.employeeNumber?.toString() || 'N/A'}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Ongoing Jobs</span>
                    <span className="meta-value jobs-count">{ongoingJobs.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Ongoing Jobs Section */}
          <div className="bg-black rounded-2xl border border-white/10 shadow-xl overflow-hidden w-full">
            {/* Header */}
            <div className="bg-gradient-45-indigo-purple p-6 flex items-center justify-between">
              <h3 className="text-white text-lg font-semibold">Ongoing Jobs</h3>
              <div className="text-sm px-3 py-1 bg-white/20 text-white rounded-full backdrop-blur-md">
                {ongoingJobs.length} Active
              </div>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-4 text-sm font-semibold uppercase text-gray-400 tracking-wider bg-white/5 border-b border-white/10">
              <div className="col-span-3 px-6 py-3">Name</div>
              <div className="px-6 py-3">Status</div>
            </div>

            {/* Table Body */}
            <div className="max-h-[300px] overflow-y-auto divide-y divide-white/5">
              {ongoingJobs.length === 0 ? (
                <div className="py-16 px-8 text-center text-gray-500">
                  <div className="text-5xl mb-4 opacity-50">📋</div>
                  <p className="text-lg">No ongoing jobs found</p>
                </div>
              ) : (
                ongoingJobs.map((job, index) => (
                  <div
                    key={job.id}
                    className={`grid grid-cols-4 items-center px-6 py-4 transition-all ${
                      index % 2 === 0 ? 'bg-white/5' : 'bg-transparent'
                    } hover:bg-white/10`}
                  >
                    <div className="col-span-3 text-white font-medium truncate">
                      {job.name}
                    </div>

                    <div>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={job.progress}
                          onChange={() => handleCheckboxChange(job.id)}
                          className="hidden peer"
                        />
                        
              <span className="w-5 h-5 rounded border-2 border-gray-600 peer-checked:border-indigo-500 peer-checked:bg-gradient-to-r from-indigo-500 to-purple-500 relative">
                <span className="absolute text-white text-[10px] font-bold top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 peer-checked:opacity-100 opacity-0">✓</span>
              </span>
                        <span
                          className={`text-sm font-medium ${
                            job.progress ? 'text-emerald-400' : 'text-amber-400'
                          }`}
                        >
                          {job.progress ? 'Completed' : 'Ongoing'}
                        </span>
                      </label>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

          {/* Notes Section */}
        <DashboardNotes className="w-full h-auto" />
      </div>
    </div>
  );
};

export default Dashboard;