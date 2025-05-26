// src/context/AuthContext.tsx
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

export interface User {
  id: number;
  userName: string;
  employeeNumber: number;
  roleId: number;
  roleName: string;
  firstName?: string;
  lastName?: string;
  profileUrl?: string;
  email?: string;
}

interface AuthContextProps {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  setIsAuthenticated: (authState: boolean) => void;
  setUser: (user: User | null) => void;
  login: (userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // Initialize loading state

  const setUserAndPersist = (user: User | null) => {
    setUser(user);
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  };

  // Load user data from localStorage on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    console.log('Stored user:', storedUser);
    setTimeout(() => {
      if (storedUser) {
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
      setLoading(false); // Set loading to false after the delay
    }, 350);
  }, []);
  

  const login = (userData: User) => {
    setUserAndPersist(userData);
    setIsAuthenticated(true);
    setLoading(false);
  };
  
  const logout = () => {
    setUserAndPersist(null);
    setIsAuthenticated(false);
  };
  

  return (
    <AuthContext.Provider value={
      {
        isAuthenticated,
        user,
        loading,
        setIsAuthenticated,
        setUser: setUserAndPersist,
        login,
        logout
      }
    }>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
