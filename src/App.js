import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Users, FileText, Calendar, TrendingUp, BookOpen, Shield, BarChart3, LogIn } from 'lucide-react';
import './App.css';

// Import components
import EmployeeList from './components/EmployeeList';
import EmployeeForm from './components/EmployeeForm';
import DocumentManagement from './components/DocumentManagement';
import AttendanceTracking from './components/AttendanceTracking';
import PerformanceManagement from './components/PerformanceManagement';
import TrainingDevelopment from './components/TrainingDevelopment';
import UserManagement from './components/UserManagement';
import Reports from './components/Reports';
import Login from './components/Login';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const handleLogin = (user) => {
    setIsAuthenticated(true);
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="nav-brand">
            <h2>ERMS</h2>
            <span className="nav-subtitle">Employee Records Management System</span>
          </div>
          <div className="nav-user">
            <span>Welcome, {currentUser?.name || 'User'}</span>
            <button className="btn btn-secondary" onClick={handleLogout}>
              <LogIn size={16} />
              Logout
            </button>
          </div>
        </nav>

        <div className="main-content">
          <aside className="sidebar">
            <nav className="sidebar-nav">
              <Link to="/" className="nav-item">
                <Users size={20} />
                <span>Employees</span>
              </Link>
              <Link to="/documents" className="nav-item">
                <FileText size={20} />
                <span>Documents</span>
              </Link>
              <Link to="/attendance" className="nav-item">
                <Calendar size={20} />
                <span>Attendance</span>
              </Link>
              <Link to="/performance" className="nav-item">
                <TrendingUp size={20} />
                <span>Performance</span>
              </Link>
              <Link to="/training" className="nav-item">
                <BookOpen size={20} />
                <span>Training</span>
              </Link>
              <Link to="/users" className="nav-item">
                <Shield size={20} />
                <span>User Management</span>
              </Link>
              <Link to="/reports" className="nav-item">
                <BarChart3 size={20} />
                <span>Reports</span>
              </Link>
            </nav>
          </aside>

          <main className="content">
            <Routes>
              <Route path="/" element={<EmployeeList />} />
              <Route path="/add-employee" element={<EmployeeForm />} />
              <Route path="/edit-employee/:id" element={<EmployeeForm />} />
              <Route path="/documents" element={<DocumentManagement />} />
              <Route path="/attendance" element={<AttendanceTracking />} />
              <Route path="/performance" element={<PerformanceManagement />} />
              <Route path="/training" element={<TrainingDevelopment />} />
              <Route path="/users" element={<UserManagement />} />
              <Route path="/reports" element={<Reports />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App; 