import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config';
import '../css/MembersPage.css';
import '../css/Pages.css';
import { TbUserQuestion } from "react-icons/tb";
import { useAuth } from '../context/AuthContext';

interface Role {
  id: number;
  roleName: string;
}

interface User {
  id: number;
  userName: string;
  employeeNumber: number;
  roleId: number;
  roleName?: string;
}

const MembersPage: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [usersByRole, setUsersByRole] = useState<Record<number, User[]>>({});
  const { user: currentUser } = useAuth();

  useEffect(() => {
    // Fetch all roles
    fetch(`${API_BASE_URL}/users/roles`)
      .then((response) => response.json())
      .then((data: Role[]) => {
        setRoles(data);
        // Fetch users for each role
        data.forEach((role) => {
          fetch(`${API_BASE_URL}/users/roles/${role.id}`)
            .then((response) => response.json())
            .then((users: User[]) => {
              setUsersByRole((prevUsersByRole) => ({
                ...prevUsersByRole,
                [role.id]: users,
              }));
            })
            .catch((error) => console.error(`Failed to fetch users for role ${role.id}:`, error));
        });
      })
      .catch((error) => console.error('Failed to fetch roles:', error));
  }, []);

  return (
    <div className="users-page">
      <div className="users-page-container">
        <div className="roles-table-section">
          {roles.map((role) => (
            <div key={role.id} className="role-table">
              <div className="role-header">{role.roleName}</div>
              <div className="role-headers">
                <span>User Name</span>
                <span>Employee Number</span>
              </div>
              <div className="role-users-list">
                {usersByRole[role.id] && usersByRole[role.id].length > 0 ? (
                  usersByRole[role.id].map((user) => (
                    <div key={user.id} className="role-user-item">
                      <span className='role-user-item-name'>
                        {user.userName}
                        {user.id === currentUser?.id && <div className="current-user-tag">You</div>}
                      </span>
                      <span>{String(user.employeeNumber).padStart(6, '0')}</span>
                    </div>
                  ))
                ) : (
                  <div className="no-users">
                    <TbUserQuestion size={30} />
                    <span>No users assigned to this role.</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MembersPage;
