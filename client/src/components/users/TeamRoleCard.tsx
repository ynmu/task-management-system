import React, { useState } from 'react';
import { TbUserQuestion } from 'react-icons/tb';
import { IoClose } from 'react-icons/io5';

interface Employee {
  id: number;
  userName: string;
  employeeNumber: number;
}

interface TeamRoleCardProps {
  roleId: number;
  roleName: string;
  users: Employee[];
  currentUserId?: number;
}

const TeamRoleCard: React.FC<TeamRoleCardProps> = ({ roleName, users, currentUserId }) => {
  const [showModal, setShowModal] = useState(false);
  const visibleUsers = users.slice(0, 3);

  return (
    <>
      <div className="bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-sm border border-white/10 rounded-2xl p-4 shadow hover:border-white/20 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300">
        <div className="mb-4">
          <h4 className="text-white text-lg font-semibold mb-1">{roleName}</h4>
          <p className="text-gray-400 text-sm">
            {users.length} member{users.length === 1 ? '' : 's'}
          </p>
        </div>

        <div className="space-y-3">
          {users.length > 0 ? (
            visibleUsers.map((user) => (
              <div key={user.id} className="flex justify-between items-center px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors">
                <div className="flex flex-col">
                  <span className="font-medium">
                    {user.userName}
                    {user.id === currentUserId && (
                      <span className="ml-2 px-2 py-0.5 text-xs font-semibold bg-blue-600/80 rounded-full text-white">You</span>
                    )}
                  </span>
                  <span className="text-sm text-gray-400">
                    #{String(user.employeeNumber).padStart(6, '0')}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center text-center text-gray-400 py-10 gap-2">
              <TbUserQuestion size={30} />
              <p className="text-sm">No users assigned to this role.</p>
            </div>
          )}
        </div>

        {users.length > 3 && (
          <div className="mt-4 text-right">
            <button
              onClick={() => setShowModal(true)}
              className="text-sm text-gray-300 hover:text-white transition-all underline"
            >
              View All Members
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div
            className="bg-black border border-white/10 rounded-2xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto shadow-xl relative"
            onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside modal
          >
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-400 transition-colors"
            >
              <IoClose size={24} />
            </button>

            <h3 className="text-white text-xl font-semibold mb-4">{roleName} – All Members</h3>

            <div className="space-y-3">
              {users.map((user) => (
                <div key={user.id} className="flex justify-between items-center px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors">
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {user.userName}
                      {user.id === currentUserId && (
                        <span className="ml-2 px-2 py-0.5 text-xs font-semibold bg-blue-600/80 rounded-full text-white">You</span>
                      )}
                    </span>
                    <span className="text-sm text-gray-400">
                      #{String(user.employeeNumber).padStart(6, '0')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TeamRoleCard;
