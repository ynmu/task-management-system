// Account.tsx - Main Page Component
import React from 'react';
import AccountEditForm from '../components/users/AccountEditForm';
import AccountProfileUpload from '../components/users/AccountProfileUpload';

const Account: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Account Settings</h1>
          <p className="text-gray-600">Manage your profile information and preferences</p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-black rounded-3xl shadow-2xl border border-white/10 overflow-hidden h-fit">
              <div className="bg-gradient-45-indigo-purple p-6">
                <h2 className="text-white text-xl font-semibold">Profile</h2>
              </div>
              <div className="p-8">
                <AccountProfileUpload />
              </div>
            </div>
          </div>

          {/* Edit Form Card */}
          <div className="lg:col-span-2">
            <div className="bg-black rounded-3xl shadow-2xl border border-white/10 overflow-hidden">
              <div className="bg-gradient-45-indigo-purple p-6">
                <h2 className="text-white text-xl font-semibold">Personal Information</h2>
                <p className="text-white/80 text-sm mt-1">Update your account details</p>
              </div>
              <div className="p-8">
                <AccountEditForm />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
