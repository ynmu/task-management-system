import React, { useState, useEffect } from 'react';
import { Form, Input, Card, Alert, Typography, Space, Divider, Select, Button } from 'antd';
import { UserOutlined, LockOutlined, IdcardOutlined, TeamOutlined, HeartOutlined, SafetyCertificateOutlined, ExperimentOutlined } from '@ant-design/icons';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import GeneralButton from '../components/ui/GeneralButton';
import AuthPageBranding from '../components/ui/AuthPageBranding';

const { Title, Text } = Typography;

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState('');
  const [employeeNumber, setEmployeeNumber] = useState(0);
  const [password, setPassword] = useState('');
  const [roleId, setRoleId] = useState<number | null>(null);
  const [roleName, setRoleName] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [roles, setRoles] = useState<{ id: number; roleName: string }[]>([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/users/roles`);
        setRoles(response.data);
      } catch (error) {
        console.error('Failed to fetch roles:', error);
      } finally {
        setRolesLoading(false);
      }
    };
  
    if (!isLogin) {
      fetchRoles();
    }
  }, [isLogin]);
  
  const from = location.state?.from?.pathname || '/';

  const handleSwitchMode = () => {
    setIsLogin(!isLogin);
    setFeedback(null);
  };

  const handleRoleSelect = (selectedRoleId: number, selectedRoleName: string) => {
    setRoleId(selectedRoleId);
    setRoleName(selectedRoleName);
  };

  if (isAuthenticated) {
    navigate('/', { replace: true });
  }

  const handleSubmit = async (values: any) => {
    setLoading(true);
    setFeedback(null);

    try {
      if (isLogin) {
        const response = await axios.post(`${API_BASE_URL}/users/login`, { 
          userName: values.userName, 
          password: values.password 
        });
        login(response.data);
        navigate(from, { replace: true });
      } else {
        if (roleId === null) {
          setFeedback({ message: 'Please select a role.', type: 'error' });
          setLoading(false);
          return;
        }

        const response = await axios.post(`${API_BASE_URL}/users/signup`, { 
          userName: values.userName, 
          employeeNumber: parseInt(values.employeeNumber), 
          roleId, 
          password: values.password 
        });
        
        setFeedback({ 
          message: `User ${response.data.userName} created successfully! Logging you in...`, 
          type: 'success' 
        });
        
        setTimeout(() => {
          login(response.data);
          navigate(from, { replace: true });
        }, 1000);
      }
    } catch (error: any) {
      setFeedback({ 
        message: error.response?.data?.error || `An error occurred: ${error.message}`, 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <AuthPageBranding />

      {/* Right Panel - Auth Form */}
      <div className="flex-1 lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-xl flex items-center justify-center mx-auto mb-4">
              <HeartOutlined className="text-2xl text-white" />
            </div>
            <Title level={2} className="!mb-1 text-gray-800">BC Cancer</Title>
            <Text className="text-gray-500">Version 2.1.0</Text>
          </div>

          <Card 
            className="shadow-xl border-0 rounded-2xl"
            bodyStyle={{ padding: '2rem' }}
          >
            <div className="text-center mb-8">
              <Title level={2} className="!mb-2 text-gray-800">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </Title>
              <Text className="text-gray-500 text-base">
                {isLogin 
                  ? 'Please sign in to your account' 
                  : 'Fill in the details to get started'
                }
              </Text>
            </div>

            {feedback && (
              <Alert
                message={feedback.message}
                type={feedback.type}
                showIcon
                className="mb-6 rounded-lg"
                closable
                onClose={() => setFeedback(null)}
              />
            )}

            <Form
              name="auth"
              onFinish={handleSubmit}
              layout="vertical"
              size="large"
              className="space-y-4"
            >
              <Form.Item
                name="userName"
                label={<span className="text-gray-700 font-medium">Username</span>}
                rules={[{ required: true, message: 'Please input your username!' }]}
              >
                <Input
                  prefix={<UserOutlined className="text-gray-400" />}
                  placeholder="Enter your username"
                  className="rounded-lg h-12"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                />
              </Form.Item>

              {!isLogin && (
                <>
                  <Form.Item
                    name="employeeNumber"
                    label={<span className="text-gray-700 font-medium">Employee Number</span>}
                    rules={[{ required: true, message: 'Please input your employee number!' }]}
                  >
                    <Input
                      type="number"
                      prefix={<IdcardOutlined className="text-gray-400" />}
                      placeholder="Enter employee number"
                      className="rounded-lg h-12 no-spinner"
                      value={employeeNumber}
                      onChange={(e) => setEmployeeNumber(Number(e.target.value))}
                    />
                  </Form.Item>
                  <Form.Item
                    label={<span className="text-gray-700 font-medium">Role</span>}
                    name="roleId"
                    rules={[{ required: true, message: 'Please select a role!' }]}
                  >
                    <Select
                      placeholder="Select a role"
                      size="large"
                      loading={rolesLoading}
                      className="rounded-lg"
                      onChange={(value, option: any) => {
                        setRoleId(value);
                        setRoleName(option?.label);
                      }}
                      options={roles.map(role => ({
                        value: role.id,
                        label: role.roleName
                      }))}
                    />
                  </Form.Item>
                </>
              )}

              <Form.Item
                name="password"
                label={<span className="text-gray-700 font-medium">Password</span>}
                rules={[{ required: true, message: 'Please input your password!' }]}
              >
                <Input.Password
                  prefix={<LockOutlined className="text-gray-400" />}
                  placeholder="Enter your password"
                  className="rounded-lg h-12"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Form.Item>

              <Form.Item className="mb-0">
                <GeneralButton
                  label={isLogin ? 'Sign In' : 'Create Account'}
                  htmlType="submit"
                  theme="dark"
                  width="100%"
                  height="48px"
                  disabled={loading}
                />
              </Form.Item>
            </Form>

            <Divider className="my-6">
              <Text className="text-gray-400 text-sm">or</Text>
            </Divider>

            <div className="text-center">
              <Text className="text-gray-600">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
              </Text>
              <Button
                type="link"
                onClick={handleSwitchMode}
                className="p-0 ml-1 font-medium !text-black underline hover:underline-offset-2"
              >
                {isLogin ? "Sign up here" : "Sign in here"}
              </Button>
            </div>
          </Card>

          {/* Footer */}
          <div className="text-center mt-8">
            <Text className="text-gray-400 text-sm">
              © {new Date().getFullYear()} BC Cancer. All rights reserved.
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;