import React, { useState, useEffect } from 'react';
import { Upload, FileText, AlertTriangle, Download, Trash2, Plus, Search, User, Calendar } from 'lucide-react';
import './DocumentManagement.css';

const DocumentManagement = () => {
  const [documents, setDocuments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterEmployee, setFilterEmployee] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadData, setUploadData] = useState({
    employeeId: '',
    documentType: '',
    title: '',
    expiryDate: '',
    file: null
  });
  const [stats, setStats] = useState({
    totalDocuments: 0,
    validDocuments: 0,
    expiringSoon: 0,
    expiredDocuments: 0
  });

  // Fetch documents and employees on component mount
  useEffect(() => {
    fetchDocuments();
    fetchEmployees();
    fetchStats();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await fetch('http://localhost:3001/documents');
      const data = await response.json();
      setDocuments(Array.isArray(data) ? data : []);
      setFilteredDocuments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
      setDocuments([]);
      setFilteredDocuments([]);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetch('http://localhost:3001/employees');
      const data = await response.json();
      setEmployees(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
      setEmployees([]);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:3001/documents/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  // Filter and search functionality
  useEffect(() => {
    let filtered = Array.isArray(documents) ? documents : [];

    if (searchTerm) {
      filtered = filtered.filter(doc =>
        (doc.employeeName && doc.employeeName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (doc.title && doc.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (doc.documentType && doc.documentType.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (filterType) {
      filtered = filtered.filter(doc => doc.documentType === filterType);
    }

    if (filterEmployee) {
      filtered = filtered.filter(doc => doc.employeeId === parseInt(filterEmployee));
    }

    setFilteredDocuments(filtered);
  }, [documents, searchTerm, filterType, filterEmployee]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    setUploadData(prev => ({
      ...prev,
      file: file
    }));
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();

    const employeeIdNum = parseInt(uploadData.employeeId);
    if (!employeeIdNum || isNaN(employeeIdNum)) {
      alert('Please select a valid employee.');
      return;
    }

    const formData = new FormData();
    formData.append('employeeId', employeeIdNum);
    formData.append('documentType', uploadData.documentType);
    formData.append('title', uploadData.title);
    formData.append('uploadDate', new Date().toISOString().split('T')[0]);
    formData.append('expiryDate', uploadData.expiryDate);
    if (uploadData.file) {
      formData.append('file', uploadData.file);
    }

    try {
      const response = await fetch('http://localhost:3001/documents', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to upload document');
      // Refresh documents and stats
      await fetchDocuments();
      await fetchStats();
      setShowUploadModal(false);
      setUploadData({
        employeeId: '',
        documentType: '',
        title: '',
        expiryDate: '',
        file: null
      });
      alert('Document uploaded successfully!');
    } catch (error) {
      alert('Error uploading document: ' + error.message);
    }
  };

  const handleDelete = async (documentId) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        const response = await fetch(`http://localhost:3001/documents/${documentId}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) throw new Error('Failed to delete document');
        
        // Refresh documents and stats
        await fetchDocuments();
        await fetchStats();
        
        alert('Document deleted successfully!');
      } catch (error) {
        alert('Error deleting document: ' + error.message);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Valid': return 'valid';
      case 'Expiring Soon': return 'warning';
      case 'Expired': return 'expired';
      default: return 'valid';
    }
  };

  const documentTypes = Array.isArray(documents) ? [...new Set(documents.map(doc => doc.documentType))] : [];
  const expiringSoon = Array.isArray(documents) ? documents.filter(doc => doc.status === 'Expiring Soon' || doc.status === 'Expired') : [];

  return (
    <div className="document-management">
      <div className="page-header">
        <h1>Document Management</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowUploadModal(true)}
        >
          <Plus size={16} />
          Upload Document
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="stats-cards">
        <div className="stat-card">
          <h3>Total Documents</h3>
          <p>{stats.totalDocuments}</p>
        </div>
        <div className="stat-card">
          <h3>Valid Documents</h3>
          <p>{stats.validDocuments}</p>
        </div>
        <div className="stat-card">
          <h3>Expiring Soon</h3>
          <p>{stats.expiringSoon}</p>
        </div>
        <div className="stat-card">
          <h3>Expired</h3>
          <p>{stats.expiredDocuments}</p>
        </div>
      </div>

      {/* Alerts for expiring documents */}
      {expiringSoon.length > 0 && (
        <div className="alerts-section">
          <h3>
            <AlertTriangle size={20} />
            Document Alerts
          </h3>
          <div className="alert-cards">
            {expiringSoon.map(doc => (
              <div key={doc.id} className={`alert-card ${getStatusColor(doc.status)}`}>
                <div className="alert-content">
                  <strong>{doc.employeeName || 'Unknown Employee'}</strong> - {doc.title}
                  <div className="alert-details">
                    Expires: {new Date(doc.expiryDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="filters-section">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-box">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="filter-select"
          >
            <option value="">All Types</option>
            {documentTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className="filter-box">
          <select
            value={filterEmployee}
            onChange={(e) => setFilterEmployee(e.target.value)}
            className="filter-select"
          >
            <option value="">All Employees</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Document Type</th>
              <th>Title</th>
              <th>Upload Date</th>
              <th>Expiry Date</th>
              <th>Status</th>
              <th>File Size</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDocuments.map(doc => (
              <tr key={doc.id}>
                <td>
                  <div className="employee-info">
                    <div className="employee-avatar">
                      {(doc.employeeName && doc.employeeName.charAt(0)) || '?'}
                    </div>
                    <div>
                      <div className="employee-name">{doc.employeeName || 'Unknown Employee'}</div>
                      <div className="employee-id">ID: {doc.employeeId}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="document-type-badge">{doc.documentType}</span>
                </td>
                <td>{doc.title}</td>
                <td>{new Date(doc.uploadDate).toLocaleDateString()}</td>
                <td>{new Date(doc.expiryDate).toLocaleDateString()}</td>
                <td>
                  <span className={`status-badge ${getStatusColor(doc.status)}`}>
                    {doc.status}
                  </span>
                </td>
                <td>{doc.fileSize}</td>
                <td>
                  <div className="action-buttons">
                    <button className="btn btn-secondary btn-sm" title="Download">
                      <Download size={14} />
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(doc.id)}
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredDocuments.length === 0 && (
          <div className="no-results">
            <p>No documents found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Upload New Document</h3>
            <form onSubmit={handleUploadSubmit}>
              <div className="form-group">
                <label>Employee *</label>
                <select
                  value={uploadData.employeeId}
                  onChange={(e) => setUploadData(prev => ({ ...prev, employeeId: e.target.value }))}
                  required
                  className="form-input"
                >
                  <option value="">Select Employee</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name} - {emp.department}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Document Type *</label>
                <select
                  value={uploadData.documentType}
                  onChange={(e) => setUploadData(prev => ({ ...prev, documentType: e.target.value }))}
                  required
                  className="form-input"
                >
                  <option value="">Select Type</option>
                  <option value="Contract">Employment Contract</option>
                  <option value="ID">ID Document</option>
                  <option value="Certification">Certification</option>
                  <option value="Training">Training Certificate</option>
                  <option value="Performance">Performance Review</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={uploadData.title}
                  onChange={(e) => setUploadData(prev => ({ ...prev, title: e.target.value }))}
                  required
                  className="form-input"
                  placeholder="Document title"
                />
              </div>

              <div className="form-group">
                <label>Expiry Date</label>
                <input
                  type="date"
                  value={uploadData.expiryDate}
                  onChange={(e) => setUploadData(prev => ({ ...prev, expiryDate: e.target.value }))}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>File</label>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="form-input"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowUploadModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Upload Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentManagement; 