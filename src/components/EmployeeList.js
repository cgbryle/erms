import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Eye, Filter, FileText, AlertTriangle, User } from 'lucide-react';
import './EmployeeList.css';

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [employeeDocuments, setEmployeeDocuments] = useState({});
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const searchTimeout = useRef();
  const navigate = useNavigate();

  // Sample data for demonstration
  useEffect(() => {
    fetchEmployees();
  }, [page]);

  const fetchEmployees = async () => {
    try {
      const response = await fetch(`http://localhost:3001/employees?page=${page}&limit=${limit}`);
      const data = await response.json();
      const employeesData = Array.isArray(data) ? data : [];
      setEmployees(employeesData);
      setFilteredEmployees(employeesData);
      
      // Fetch documents for each employee
      await fetchEmployeeDocuments(employeesData);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
      setEmployees([]);
      setFilteredEmployees([]);
    }
  };

  const fetchEmployeeDocuments = async (employeesData) => {
    const documentsMap = {};
    
    for (const employee of employeesData) {
      try {
        const response = await fetch(`http://localhost:3001/employees/${employee.id}/documents`);
        const documents = await response.json();
        documentsMap[employee.id] = documents;
      } catch (error) {
        console.error(`Failed to fetch documents for employee ${employee.id}:`, error);
        documentsMap[employee.id] = [];
      }
    }
    
    setEmployeeDocuments(documentsMap);
  };

  // Debounced search
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
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
    }, 400);
    return () => clearTimeout(searchTimeout.current);
  }, [searchTerm, filterDepartment, employees]);

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

  const getDocumentStats = (employeeId) => {
    const documents = Array.isArray(employeeDocuments[employeeId]) ? employeeDocuments[employeeId] : [];
    const total = documents.length;
    const valid = documents.filter(doc => doc.status === 'Valid').length;
    const expiringSoon = documents.filter(doc => doc.status === 'Expiring Soon').length;
    const expired = documents.filter(doc => doc.status === 'Expired').length;
    
    return { total, valid, expiringSoon, expired };
  };

  const getDocumentStatusColor = (employeeId) => {
    const stats = getDocumentStats(employeeId);
    if (stats.expired > 0) return 'expired';
    if (stats.expiringSoon > 0) return 'warning';
    if (stats.total === 0) return 'no-docs';
    return 'valid';
  };

  const departments = [...new Set(employees.map(emp => emp.department))];

  const handleViewProfile = (employee) => {
    setSelectedEmployee(employee);
    setShowProfileModal(true);
  };

  const closeProfileModal = () => {
    setShowProfileModal(false);
    setSelectedEmployee(null);
  };

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
        <div className="stat-card">
          <h3>Employees with Documents</h3>
          <p>{employees.filter(emp => getDocumentStats(emp.id).total > 0).length}</p>
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
              <th>Documents</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map(employee => {
              const docStats = getDocumentStats(employee.id);
              const docStatusColor = getDocumentStatusColor(employee.id);
              
              return (
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
                    <div className="document-info">
                      <div className={`document-status ${docStatusColor}`}>
                        <FileText size={16} />
                        <span>{docStats.total} docs</span>
                        {docStats.expired > 0 && (
                          <AlertTriangle size={14} className="alert-icon" title={`${docStats.expired} expired documents`} />
                        )}
                        {docStats.expiringSoon > 0 && docStats.expired === 0 && (
                          <AlertTriangle size={14} className="warning-icon" title={`${docStats.expiringSoon} expiring soon`} />
                        )}
                      </div>
                      {docStats.total > 0 && (
                        <div className="document-breakdown">
                          <span className="valid-count">{docStats.valid}</span>
                          <span className="warning-count">{docStats.expiringSoon}</span>
                          <span className="expired-count">{docStats.expired}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <Link to={`/edit-employee/${employee.id}`} className="btn btn-secondary btn-sm" title="Edit Employee">
                        <Edit size={14} />
                      </Link>
                      <Link 
                        to={`/documents?employee=${employee.id}`} 
                        className="btn btn-info btn-sm"
                        title="View Documents"
                      >
                        <Eye size={14} />
                      </Link>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleViewProfile(employee)}
                        title="View Profile"
                      >
                        <User size={14} />
                      </button>
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => navigate(`/performance?employeeId=${employee.id}`)}
                        title="View Performance"
                      >
                        <FileText size={14} />
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(employee)}
                        title="Delete Employee"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredEmployees.length === 0 && (
          <div className="no-results">
            <p>No employees found matching your criteria.</p>
          </div>
        )}
      </div>

      <div className="pagination-controls">
        <button className="btn btn-secondary" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Prev</button>
        <span style={{ margin: '0 12px' }}>Page {page}</span>
        <button className="btn btn-secondary" onClick={() => setPage(p => p + 1)} disabled={filteredEmployees.length < limit}>Next</button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete {employeeToDelete?.name}?</p>
            <p className="warning-text">This will also delete all associated documents.</p>
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

      {/* Employee Profile Modal */}
      {showProfileModal && selectedEmployee && (
        <div className="modal-overlay">
          <div className="modal profile-modal">
            <h3>Employee Profile</h3>
            <div className="profile-details">
              <div><strong>Name:</strong> {selectedEmployee.name || 'N/A'}</div>
              <div><strong>Email:</strong> {selectedEmployee.email || 'N/A'}</div>
              <div><strong>Phone:</strong> {selectedEmployee.phone || 'N/A'}</div>
              <div><strong>Address:</strong> {selectedEmployee.address || 'N/A'}</div>
              <div><strong>Department:</strong> {selectedEmployee.department || 'N/A'}</div>
              <div><strong>Position:</strong> {selectedEmployee.position || 'N/A'}</div>
              <div><strong>Hire Date:</strong> {selectedEmployee.hireDate ? new Date(selectedEmployee.hireDate).toLocaleDateString() : (selectedEmployee.date_hired ? new Date(selectedEmployee.date_hired).toLocaleDateString() : 'N/A')}</div>
              <div><strong>Salary:</strong> {selectedEmployee.salary || 'N/A'}</div>
              <div><strong>Status:</strong> {selectedEmployee.status || 'N/A'}</div>
              {selectedEmployee.emergencyContact && (
                <div><strong>Emergency Contact:</strong> {selectedEmployee.emergencyContact.name} ({selectedEmployee.emergencyContact.relationship}) - {selectedEmployee.emergencyContact.phone}</div>
              )}
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={closeProfileModal}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeList; 