import React, { useState } from 'react';
import { LogIn, Eye, EyeOff } from 'lucide-react';
import './Login.css';

const Login = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Simple authentication for demo purposes
    if (credentials.username === 'admin' && credentials.password === 'admin123') {
      onLogin({
        id: 1,
        name: 'Admin User',
        role: 'admin',
        email: 'admin@company.com'
      });
    } else if (credentials.username === 'hr' && credentials.password === 'hr123') {
      onLogin({
        id: 2,
        name: 'HR Manager',
        role: 'hr',
        email: 'hr@company.com'
      });
    } else if (credentials.username === 'employee' && credentials.password === 'emp123') {
      onLogin({
        id: 3,
        name: 'John Employee',
        role: 'employee',
        email: 'john@company.com'
      });
    } else {
      setError('Invalid credentials. Try admin/admin123, hr/hr123, or employee/emp123');
    }
  };

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error when user types
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <LogIn size={48} className="login-icon" />
          <h1>ERMS Login</h1>
          <p>Employee Records Management System</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              type="text"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter username"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="password-input">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={credentials.password}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter password"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary login-btn">
            <LogIn size={16} />
            Login
          </button>
        </form>

        <div className="login-help">
          <h4>Demo Credentials:</h4>
          <div className="demo-credentials">
            <div><strong>Admin:</strong> admin / admin123</div>
            <div><strong>HR:</strong> hr / hr123</div>
            <div><strong>Employee:</strong> employee / emp123</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 