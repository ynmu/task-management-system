import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config';
import '../css/MembersPage.css';
import '../css/Pages.css';
import { TbUserQuestion } from "react-icons/tb";
import { useAuth } from '../context/AuthContext';
import TeamRoleCard from '../components/users/TeamRoleCard';

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
    fetch(`${API_BASE_URL}/users/roles`)
      .then((response) => response.json())
      .then((data: Role[]) => {
        setRoles(data);
        data.forEach((role) => {
          fetch(`${API_BASE_URL}/users/roles/${role.id}`)
            .then((response) => response.json())
            .then((users: User[]) => {
              setUsersByRole((prev) => ({ ...prev, [role.id]: users }));
            })
            .catch((err) => console.error(`Failed to fetch users for role ${role.id}:`, err));
        });
      })
      .catch((err) => console.error('Failed to fetch roles:', err));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 p-8">
      <div className="rounded-3xl shadow-2xl border border-white/10 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-45-indigo-purple p-6">
          <h3 className="text-white text-xl font-semibold">Team Members</h3>
          <p className="text-white/80 text-sm">Grouped by roles</p>
        </div>

        {/* Body */}
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((role) => (
            <TeamRoleCard
              roleId={role.id}
              roleName={role.roleName}
              users={usersByRole[role.id] || []}
              currentUserId={currentUser?.id}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MembersPage;
