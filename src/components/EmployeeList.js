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
    const sampleEmployees = [
      {
        id: 1,
        name: 'John Doe',
        email: 'john.doe@company.com',
        phone: '+1 (555) 123-4567',
        department: 'Engineering',
        position: 'Senior Developer',
        hireDate: '2022-01-15',
        status: 'Active',
        salary: 85000
      },
      {
        id: 2,
        name: 'Jane Smith',
        email: 'jane.smith@company.com',
        phone: '+1 (555) 234-5678',
        department: 'Marketing',
        position: 'Marketing Manager',
        hireDate: '2021-08-20',
        status: 'Active',
        salary: 75000
      },
      {
        id: 3,
        name: 'Mike Johnson',
        email: 'mike.johnson@company.com',
        phone: '+1 (555) 345-6789',
        department: 'HR',
        position: 'HR Specialist',
        hireDate: '2023-03-10',
        status: 'Active',
        salary: 65000
      },
      {
        id: 4,
        name: 'Sarah Wilson',
        email: 'sarah.wilson@company.com',
        phone: '+1 (555) 456-7890',
        department: 'Finance',
        position: 'Financial Analyst',
        hireDate: '2022-11-05',
        status: 'Active',
        salary: 70000
      }
    ];
    setEmployees(sampleEmployees);
    setFilteredEmployees(sampleEmployees);
  }, []);

  // Filter and search functionality
  useEffect(() => {
    let filtered = employees;

    if (searchTerm) {
      filtered = filtered.filter(emp =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.department.toLowerCase().includes(searchTerm.toLowerCase())
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

  const confirmDelete = () => {
    setEmployees(employees.filter(emp => emp.id !== employeeToDelete.id));
    setShowDeleteModal(false);
    setEmployeeToDelete(null);
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
                      {employee.name.charAt(0)}
                    </div>
                    <div>
                      <div className="employee-name">{employee.name}</div>
                      <div className="employee-phone">{employee.phone}</div>
                    </div>
                  </div>
                </td>
                <td>{employee.email}</td>
                <td>
                  <span className="department-badge">{employee.department}</span>
                </td>
                <td>{employee.position}</td>
                <td>{new Date(employee.hireDate).toLocaleDateString()}</td>
                <td>
                  <span className={`status-badge ${employee.status.toLowerCase()}`}>
                    {employee.status}
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