import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config';
import './UsersPage.css';
import './Pages.css';
import SideBar from '../components/SideBar';

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

const UsersPage: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [usersByRole, setUsersByRole] = useState<Record<number, User[]>>({});

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
      <header className="page-header">
        <h1>Dashboard</h1>
      </header>
      <div className="users-page-container">
        <SideBar />
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
                      <span>{user.userName}</span>
                      <span>{String(user.employeeNumber).padStart(6, '0')}</span>
                    </div>
                  ))
                ) : (
                  <div className="no-users">No users assigned to this role.</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UsersPage;
