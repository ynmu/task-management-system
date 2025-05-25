// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import NavBar from './components/ui/NavBar';
import Dashboard from './pages/Dashboard';
import AddEventPage from './pages/AddEventPage';
import ViewEventPage from './pages/ViewEventPage';
import MembersPage from './pages/MembersPage';
import AuthPage from './pages/AuthPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import EditEventPage from './pages/EditEventPage';
import SideBar from './components/ui/SideBar';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex h-screen">
          <SideBar />
          <div className="flex-1 flex flex-col">
            <div className="p-4 overflow-y-auto">
              <Routes>
                <Route path="/auth" element={<AuthPage />} />
                <Route element={<ProtectedRoute />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/add-event" element={<AddEventPage />} />
                  <Route path="/view-event" element={<ViewEventPage />} />
                  <Route path="/view-members" element={<MembersPage />} />
                  <Route path="/event-details/:id" element={<EditEventPage />} />
                </Route>
              </Routes>
            </div>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
