
// AccountEditForm.tsx - Updated Form Component
import React from 'react';
import { Input, Form, message } from 'antd';
import { useAuth, User } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config';

const AccountEditForm: React.FC = () => {
  const { user, setUser } = useAuth();
  const [form] = Form.useForm();

  const handleFinish = async (values: any) => {
    try {
      await fetch(`${API_BASE_URL}/users/${user?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      console.log('Updated user info:', values);

      // Update user context with new values
      setUser({
        ...user,
        email: values.email,
        firstName: values.firstName,
        lastName: values.lastName,
      } as User);
      console.log('User updated successfully');
      message.success('User information updated successfully');
    } catch (err) {
      console.error('Failed to update user:', err);
      message.error('Failed to update user information');
    }
  };

  return (
    <div className="space-y-6">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          userName: user?.userName,
          email: user?.email,
          firstName: user?.firstName,
          lastName: user?.lastName,
        }}
        className="space-y-6"
      >
        {/* Username Field */}
        <div className="space-y-2">
          <label className="block text-white font-medium text-sm">Username</label>
          <Form.Item name="userName" className="mb-0">
            <Input 
              disabled 
              className="bg-gray-800/50 border-white/20 text-gray-400 rounded-xl px-4 py-3 text-base"
              style={{
                backgroundColor: 'rgba(55, 65, 81, 0.5)',
                borderColor: 'rgba(255, 255, 255, 0.2)',
                color: 'rgb(156, 163, 175)'
              }}
            />
          </Form.Item>
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <label className="block text-white font-medium text-sm">Email Address</label>
          <Form.Item name="email" className="mb-0">
            <Input 
              type="email"
              className="bg-gray-900/50 border-white/20 text-white rounded-xl px-4 py-3 text-base hover:border-white/40 focus:border-blue-400 transition-all duration-300"
              style={{
                backgroundColor: 'rgba(17, 24, 39, 0.5)',
                borderColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white'
              }}
            />
          </Form.Item>
        </div>

        {/* Name Fields Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-white font-medium text-sm">First Name</label>
            <Form.Item name="firstName" className="mb-0">
              <Input 
                className="bg-gray-900/50 border-white/20 text-white rounded-xl px-4 py-3 text-base hover:border-white/40 focus:border-blue-400 transition-all duration-300"
                style={{
                  backgroundColor: 'rgba(17, 24, 39, 0.5)',
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white'
                }}
              />
            </Form.Item>
          </div>
          
          <div className="space-y-2">
            <label className="block text-white font-medium text-sm">Last Name</label>
            <Form.Item name="lastName" className="mb-0">
              <Input 
                className="bg-gray-900/50 border-white/20 text-white rounded-xl px-4 py-3 text-base hover:border-white/40 focus:border-blue-400 transition-all duration-300"
                style={{
                  backgroundColor: 'rgba(17, 24, 39, 0.5)',
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white'
                }}
              />
            </Form.Item>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            className="w-full bg-gradient-45-indigo-purple text-white font-medium px-6 py-3 rounded-xl shadow-lg hover:shadow-purple-500/30 hover:-translate-y-0.5 transition-all duration-300 transform hover:from-blue-400 hover:to-purple-500"
          >
            Save Changes
          </button>
        </div>
      </Form>
    </div>
  );
};

export default AccountEditForm;