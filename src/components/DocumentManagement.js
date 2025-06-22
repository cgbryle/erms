import React, { useState, useEffect } from 'react';
import { Upload, FileText, AlertTriangle, Download, Trash2, Plus, Search } from 'lucide-react';
import './DocumentManagement.css';

const DocumentManagement = () => {
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadData, setUploadData] = useState({
    employeeId: '',
    documentType: '',
    title: '',
    expiryDate: '',
    file: null
  });

  // Sample data for demonstration
  useEffect(() => {
    const sampleDocuments = [
      {
        id: 1,
        employeeId: 1,
        employeeName: 'John Doe',
        documentType: 'Contract',
        title: 'Employment Contract',
        fileName: 'contract_john_doe.pdf',
        uploadDate: '2022-01-15',
        expiryDate: '2025-01-15',
        status: 'Valid',
        fileSize: '2.5 MB'
      },
      {
        id: 2,
        employeeId: 1,
        employeeName: 'John Doe',
        documentType: 'ID',
        title: 'Driver License',
        fileName: 'license_john_doe.pdf',
        uploadDate: '2022-01-15',
        expiryDate: '2024-06-15',
        status: 'Expiring Soon',
        fileSize: '1.2 MB'
      },
      {
        id: 3,
        employeeId: 2,
        employeeName: 'Jane Smith',
        documentType: 'Certification',
        title: 'Project Management Certification',
        fileName: 'pmp_cert_jane_smith.pdf',
        uploadDate: '2023-03-20',
        expiryDate: '2026-03-20',
        status: 'Valid',
        fileSize: '3.1 MB'
      },
      {
        id: 4,
        employeeId: 3,
        employeeName: 'Mike Johnson',
        documentType: 'Contract',
        title: 'Employment Contract',
        fileName: 'contract_mike_johnson.pdf',
        uploadDate: '2023-03-10',
        expiryDate: '2024-03-10',
        status: 'Expired',
        fileSize: '2.8 MB'
      }
    ];
    setDocuments(sampleDocuments);
    setFilteredDocuments(sampleDocuments);
  }, []);

  // Filter and search functionality
  useEffect(() => {
    let filtered = documents;

    if (searchTerm) {
      filtered = filtered.filter(doc =>
        doc.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.documentType.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType) {
      filtered = filtered.filter(doc => doc.documentType === filterType);
    }

    setFilteredDocuments(filtered);
  }, [documents, searchTerm, filterType]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    setUploadData(prev => ({
      ...prev,
      file: file
    }));
  };

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    
    // In a real app, this would upload to server
    const newDocument = {
      id: documents.length + 1,
      employeeId: parseInt(uploadData.employeeId),
      employeeName: 'New Employee', // Would get from employee lookup
      documentType: uploadData.documentType,
      title: uploadData.title,
      fileName: uploadData.file?.name || 'document.pdf',
      uploadDate: new Date().toISOString().split('T')[0],
      expiryDate: uploadData.expiryDate,
      status: 'Valid',
      fileSize: '1.0 MB'
    };

    setDocuments(prev => [...prev, newDocument]);
    setShowUploadModal(false);
    setUploadData({
      employeeId: '',
      documentType: '',
      title: '',
      expiryDate: '',
      file: null
    });
  };

  const handleDelete = (documentId) => {
    setDocuments(prev => prev.filter(doc => doc.id !== documentId));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Valid': return 'valid';
      case 'Expiring Soon': return 'warning';
      case 'Expired': return 'expired';
      default: return 'valid';
    }
  };

  const documentTypes = [...new Set(documents.map(doc => doc.documentType))];
  const expiringSoon = documents.filter(doc => doc.status === 'Expiring Soon' || doc.status === 'Expired');

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
                  <strong>{doc.employeeName}</strong> - {doc.title}
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
      </div>

      <div className="stats-cards">
        <div className="stat-card">
          <h3>Total Documents</h3>
          <p>{documents.length}</p>
        </div>
        <div className="stat-card">
          <h3>Valid Documents</h3>
          <p>{documents.filter(doc => doc.status === 'Valid').length}</p>
        </div>
        <div className="stat-card">
          <h3>Expiring Soon</h3>
          <p>{documents.filter(doc => doc.status === 'Expiring Soon').length}</p>
        </div>
        <div className="stat-card">
          <h3>Expired</h3>
          <p>{documents.filter(doc => doc.status === 'Expired').length}</p>
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
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDocuments.map(document => (
              <tr key={document.id}>
                <td>{document.employeeName}</td>
                <td>
                  <span className="document-type-badge">{document.documentType}</span>
                </td>
                <td>{document.title}</td>
                <td>{new Date(document.uploadDate).toLocaleDateString()}</td>
                <td>{new Date(document.expiryDate).toLocaleDateString()}</td>
                <td>
                  <span className={`status-badge ${getStatusColor(document.status)}`}>
                    {document.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="btn btn-secondary btn-sm">
                      <Download size={14} />
                    </button>
                    <button 
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(document.id)}
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
            <h3>Upload Document</h3>
            <form onSubmit={handleUploadSubmit}>
              <div className="form-group">
                <label className="form-label">Employee ID</label>
                <input
                  type="number"
                  value={uploadData.employeeId}
                  onChange={(e) => setUploadData(prev => ({ ...prev, employeeId: e.target.value }))}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Document Type</label>
                <select
                  value={uploadData.documentType}
                  onChange={(e) => setUploadData(prev => ({ ...prev, documentType: e.target.value }))}
                  className="form-input"
                  required
                >
                  <option value="">Select Type</option>
                  <option value="Contract">Contract</option>
                  <option value="ID">ID</option>
                  <option value="Certification">Certification</option>
                  <option value="License">License</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Document Title</label>
                <input
                  type="text"
                  value={uploadData.title}
                  onChange={(e) => setUploadData(prev => ({ ...prev, title: e.target.value }))}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Expiry Date</label>
                <input
                  type="date"
                  value={uploadData.expiryDate}
                  onChange={(e) => setUploadData(prev => ({ ...prev, expiryDate: e.target.value }))}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">File</label>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="form-input"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  required
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
                  <Upload size={16} />
                  Upload
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