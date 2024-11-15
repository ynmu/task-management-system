import React from 'react';
import './UserInfo.css';

interface UserInfoProps {
  role: string;
  employeeNumber: string;
  userName: string;
  ongoingJobsCount: number;
  profilePic: string;
}

const UserInfo: React.FC<UserInfoProps> = ({ role, employeeNumber, userName, ongoingJobsCount, profilePic }) => {
    return (
      <div className="user-info-container">
          <img src={profilePic} alt="Profile" className="user-profile-pic" />
          <div className="user-info">
              <div className="user-info-label"><div className="user-info-label-item">User Role</div> {role}</div>
              <div className="user-info-label">
                <div className="user-info-label-item">Employee Number</div> {String(employeeNumber).padStart(5, '0')}
              </div>
              <div className="user-info-label"><div className="user-info-label-item">User Name</div> {userName}</div>
              <div className="user-info-label"><div className="user-info-label-item">Ongoing Jobs in Queue</div> {ongoingJobsCount}</div>
          </div>
      </div>
    );
  };
  

export default UserInfo;
