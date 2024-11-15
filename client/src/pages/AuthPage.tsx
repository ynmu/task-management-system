import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import RoleDropdown from '../components/RoleDropdown';
import { useAuth } from '../context/AuthContext';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [userName, setUserName] = useState('');
  const [employeeNumber, setEmployeeNumber] = useState(0);
  const [password, setPassword] = useState('');
  const [roleId, setRoleId] = useState<number | null>(null);
  const [roleName, setRoleName] = useState<string | null>(null); // New state for roleName
  const [message, setMessage] = useState('');
  const { setUser, setIsAuthenticated } = useAuth();

  const handleSwitchMode = () => {
    setIsLogin(!isLogin);
    setMessage('');
  };

  const handleRoleSelect = (selectedRoleId: number, selectedRoleName: string) => {
    setRoleId(selectedRoleId);
    setRoleName(selectedRoleName); // Store roleName in state
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isLogin) {
        const response = await axios.post(`${API_BASE_URL}/users/login`, { userName, password });
        setUser(response.data);
        setIsAuthenticated(true);
      } else {
        if (roleId === null) {
          setMessage('Please select a role.');
          return;
        }

        const response = await axios.post(`${API_BASE_URL}/users/signup`, { userName, employeeNumber, roleId, password });
        setMessage(`User ${response.data.userName} created successfully with role ${roleName}!`);
      }
    } catch (error: any) {
      setMessage(error.response?.data?.error || `An error occurred: ${error.message}`);
    }
  };

  return (
    <div className="auth-page">
      <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="userName">Username:</label>
          <input
            type="text"
            id="userName"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            required
          />
        </div>
        {!isLogin && (
          <>
            <div className="form-group">
              <label htmlFor="employeeNumber">Employee Number:</label>
              <input
                type="number"
                id="employeeNumber"
                value={employeeNumber}
                onChange={(e) => setEmployeeNumber(Number(e.target.value))}
                required
              />
            </div>
            <div className="form-group">
              <RoleDropdown onRoleSelect={handleRoleSelect} /> {/* Pass the handler */}
            </div>
          </>
        )}
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">{isLogin ? 'Login' : 'Sign Up'}</button>
      </form>
      <button onClick={handleSwitchMode}>
        {isLogin ? 'Switch to Sign Up' : 'Switch to Login'}
      </button>
      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default AuthPage;
