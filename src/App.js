import React, { useState, useEffect } from 'react';
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
import Reports from './components/Reports';
import Login from './components/Login';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Restore login state from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('ermsUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (user) => {
    setIsAuthenticated(true);
    setCurrentUser(user);
    localStorage.setItem('ermsUser', JSON.stringify(user));
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('ermsUser');
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  // If employee, only show attendance page and hide other sidebar links
  const isEmployee = currentUser?.role === 'employee';

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
              {isEmployee ? (
                <Link to="/attendance" className="nav-item">
                  <Calendar size={20} />
                  <span>Attendance</span>
                </Link>
              ) : (
                <>
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
                  <Link to="/reports" className="nav-item">
                    <BarChart3 size={20} />
                    <span>Reports</span>
                  </Link>
                </>
              )}
            </nav>
          </aside>

          <main className="content">
            <Routes>
              {isEmployee ? (
                <Route path="*" element={<AttendanceTracking currentUser={currentUser} />} />
              ) : (
                <>
                  <Route path="/" element={<EmployeeList />} />
                  <Route path="/add-employee" element={<EmployeeForm />} />
                  <Route path="/edit-employee/:id" element={<EmployeeForm />} />
                  <Route path="/documents" element={<DocumentManagement />} />
                  <Route path="/attendance" element={<AttendanceTracking currentUser={currentUser} />} />
                  <Route path="/performance" element={<PerformanceManagement />} />
                  <Route path="/training" element={<TrainingDevelopment />} />
                  <Route path="/reports" element={<Reports currentUser={currentUser} />} />
                </>
              )}
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App; 