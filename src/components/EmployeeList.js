import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Eye, Filter } from 'lucide-react';
import './EmployeeList.css';

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);

  // Sample data for demonstration
  useEffect(() => {
    fetch('http://localhost:3001/employees')
      .then(res => res.json())
      .then(data => {
        setEmployees(Array.isArray(data) ? data : []);
        setFilteredEmployees(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.error('Failed to fetch employees:', err);
        setEmployees([]);
        setFilteredEmployees([]);
      });
  }, []);

  // Filter and search functionality
  useEffect(() => {
    let filtered = employees;

    if (searchTerm) {
      filtered = filtered.filter(emp =>
        (emp.name && emp.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (emp.email && emp.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (emp.department && emp.department.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (filterDepartment) {
      filtered = filtered.filter(emp => emp.department === filterDepartment);
    }

    setFilteredEmployees(filtered);
  }, [employees, searchTerm, filterDepartment]);

  const handleDelete = (employee) => {
    setEmployeeToDelete(employee);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await fetch(`http://localhost:3001/employees/${employeeToDelete.id}`, {
        method: 'DELETE',
      });
      setEmployees(employees.filter(emp => emp.id !== employeeToDelete.id));
      setShowDeleteModal(false);
      setEmployeeToDelete(null);
    } catch (error) {
      alert('Failed to delete employee');
    }
  };

  const departments = [...new Set(employees.map(emp => emp.department))];

  return (
    <div className="employee-list">
      <div className="page-header">
        <h1>Employee Management</h1>
        <Link to="/add-employee" className="btn btn-primary">
          <Plus size={16} />
          Add Employee
        </Link>
      </div>

      <div className="filters-section">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-box">
          <Filter size={20} />
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="filter-select"
          >
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="stats-cards">
        <div className="stat-card">
          <h3>Total Employees</h3>
          <p>{employees.length}</p>
        </div>
        <div className="stat-card">
          <h3>Active Employees</h3>
          <p>{employees.filter(emp => emp.status === 'Active').length}</p>
        </div>
        <div className="stat-card">
          <h3>Departments</h3>
          <p>{departments.length}</p>
        </div>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Department</th>
              <th>Position</th>
              <th>Hire Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map(employee => (
              <tr key={employee.id}>
                <td>
                  <div className="employee-info">
                    <div className="employee-avatar">
                      {(employee.name && employee.name.charAt(0)) || '?'}
                    </div>
                    <div>
                      <div className="employee-name">{employee.name || 'N/A'}</div>
                      <div className="employee-phone">{employee.phone || ''}</div>
                    </div>
                  </div>
                </td>
                <td>{employee.email || 'N/A'}</td>
                <td>
                  <span className="department-badge">{employee.department || 'N/A'}</span>
                </td>
                <td>{employee.position || 'N/A'}</td>
                <td>{employee.hireDate ? new Date(employee.hireDate).toLocaleDateString() : (employee.date_hired ? new Date(employee.date_hired).toLocaleDateString() : 'N/A')}</td>
                <td>
                  <span className={`status-badge ${(employee.status || '').toLowerCase()}`}>
                    {employee.status || 'N/A'}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <Link to={`/edit-employee/${employee.id}`} className="btn btn-secondary btn-sm">
                      <Edit size={14} />
                    </Link>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(employee)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredEmployees.length === 0 && (
          <div className="no-results">
            <p>No employees found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete {employeeToDelete?.name}?</p>
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeList; 