import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import './App.css';
import NavBar from './components/NavBar'; // Assuming your NavBar component is located in this path
import Dashboard from './pages/Dashboard'; // Assuming your Dashboard component is located in this path

function App() {
  return (
    <Router>
      <NavBar username="TestUser" onLogout={() => console.log('Logout')} />
      <div className='App'>
        <Routes>
          <Route path='/dashboard' element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
