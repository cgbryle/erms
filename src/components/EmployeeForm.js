import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, User, Mail, Phone, MapPin, Calendar, DollarSign, FileText, Plus, Upload, Trash2, AlertTriangle } from 'lucide-react';
import './EmployeeForm.css';

const EmployeeForm = ({ selfEdit = false, currentUser = null }) => {
  const { id: paramId } = useParams();
  const navigate = useNavigate();
  const id = selfEdit && currentUser ? (currentUser.employeeId || currentUser.id) : paramId;
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    department: '',
    position: '',
    hireDate: '',
    salary: '',
    status: 'Active',
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    }
  });

  const [errors, setErrors] = useState({});
  const [employeeDocuments, setEmployeeDocuments] = useState([]);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [documentData, setDocumentData] = useState({
    documentType: '',
    title: '',
    expiryDate: '',
    file: null
  });
  const [accountData, setAccountData] = useState({ username: '', password: '' });

  // Sample departments for demo
  const departments = [
    'Engineering',
    'Marketing',
    'Sales',
    'HR',
    'Finance',
    'Operations',
    'Customer Support',
    'Product Management'
  ];

  const positions = {
    'Engineering': ['Software Engineer', 'Senior Developer', 'Tech Lead', 'Architect'],
    'Marketing': ['Marketing Specialist', 'Marketing Manager', 'Content Creator', 'SEO Specialist'],
    'Sales': ['Sales Representative', 'Sales Manager', 'Account Executive', 'Business Development'],
    'HR': ['HR Specialist', 'HR Manager', 'Recruiter', 'Benefits Coordinator'],
    'Finance': ['Financial Analyst', 'Accountant', 'Finance Manager', 'Controller'],
    'Operations': ['Operations Manager', 'Project Manager', 'Process Analyst', 'Coordinator'],
    'Customer Support': ['Support Specialist', 'Support Manager', 'Customer Success', 'Team Lead'],
    'Product Management': ['Product Manager', 'Product Owner', 'Business Analyst', 'Product Analyst']
  };

  useEffect(() => {
    if (isEditing) {
      fetchEmployeeData();
      fetchEmployeeDocuments();
    }
  }, [id, isEditing]);

  const fetchEmployeeData = async () => {
    try {
      const response = await fetch(`http://localhost:3001/employees`);
      const data = await response.json();
      const emp = data.find(e => e.id === parseInt(id));
      if (emp) {
        setFormData({
          name: emp.name ?? '',
          email: emp.email ?? '',
          phone: emp.phone ?? '',
          address: emp.address ?? '',
          department: emp.department ?? '',
          position: emp.position ?? '',
          hireDate: emp.date_hired ?? '',
          salary: emp.salary ?? '',
          status: emp.status ?? 'Active',
          emergencyContact: {
            name: emp.emergencyContact?.name ?? '',
            phone: emp.emergencyContact?.phone ?? '',
            relationship: emp.emergencyContact?.relationship ?? ''
          }
        });
      }
    } catch (error) {
      console.error('Failed to fetch employee data:', error);
    }
  };

  const fetchEmployeeDocuments = async () => {
    if (!isEditing) return;
    
    try {
      const response = await fetch(`http://localhost:3001/employees/${id}/documents`);
      const data = await response.json();
      setEmployeeDocuments(data);
    } catch (error) {
      console.error('Failed to fetch employee documents:', error);
      setEmployeeDocuments([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleEmergencyContactChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      emergencyContact: {
        ...prev.emergencyContact,
        [name]: value
      }
    }));
  };

  const handleAccountChange = (e) => {
    const { name, value } = e.target;
    setAccountData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.department) newErrors.department = 'Department is required';
    if (!formData.position) newErrors.position = 'Position is required';
    if (!formData.hireDate) newErrors.hireDate = 'Hire date is required';
    if (!formData.salary) newErrors.salary = 'Salary is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      try {
        const url = isEditing
          ? `http://localhost:3001/employees/${id}`
          : 'http://localhost:3001/employees';
        const method = isEditing ? 'PUT' : 'POST';
        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            date_hired: formData.hireDate, // match backend field
            ...(isEditing ? {} : accountData),
          }),
        });
        if (!response.ok) throw new Error('Failed to save employee');
        alert(isEditing ? 'Employee updated successfully!' : 'Employee added successfully!');
        navigate('/');
      } catch (error) {
        alert('Error: ' + error.message);
      }
    }
  };

  const handleDocumentUpload = (e) => {
    const file = e.target.files[0];
    setDocumentData(prev => ({
      ...prev,
      file: file
    }));
  };

  const handleDocumentSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const fileSize = documentData.file ? `${(documentData.file.size / (1024 * 1024)).toFixed(1)} MB` : '1.0 MB';
      const fileName = documentData.file ? documentData.file.name : 'document.pdf';
      
      const response = await fetch('http://localhost:3001/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: parseInt(id),
          documentType: documentData.documentType,
          title: documentData.title,
          fileName: fileName,
          uploadDate: new Date().toISOString().split('T')[0],
          expiryDate: documentData.expiryDate,
          fileSize: fileSize
        }),
      });

      if (!response.ok) throw new Error('Failed to upload document');
      
      // Refresh documents
      await fetchEmployeeDocuments();
      
      setShowDocumentModal(false);
      setDocumentData({
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

  const handleDocumentDelete = async (documentId) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        const response = await fetch(`http://localhost:3001/documents/${documentId}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) throw new Error('Failed to delete document');
        
        // Refresh documents
        await fetchEmployeeDocuments();
        
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

  return (
    <div className="employee-form">
      <div className="page-header">
        <button className="btn btn-secondary" onClick={() => navigate('/')}>
          <ArrowLeft size={16} />
          Back to Employees
        </button>
        <h1>{isEditing ? 'Edit Employee' : 'Add New Employee'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="form-container">
        <div className="form-sections">
          {/* Personal Information */}
          <div className="form-section">
            <h3>
              <User size={20} />
              Personal Information
            </h3>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`form-input ${errors.name ? 'error' : ''}`}
                  placeholder="Enter full name"
                />
                {errors.name && <span className="error-message">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  placeholder="Enter email address"
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Phone *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`form-input ${errors.phone ? 'error' : ''}`}
                  placeholder="Enter phone number"
                />
                {errors.phone && <span className="error-message">{errors.phone}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter address"
                />
              </div>
            </div>
          </div>

          {/* Employment Information */}
          <div className="form-section">
            <h3>
              <Calendar size={20} />
              Employment Information
            </h3>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Department *</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className={`form-input ${errors.department ? 'error' : ''}`}
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                {errors.department && <span className="error-message">{errors.department}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Position *</label>
                <select
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  className={`form-input ${errors.position ? 'error' : ''}`}
                  disabled={!formData.department}
                >
                  <option value="">Select Position</option>
                  {formData.department && positions[formData.department]?.map(pos => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </select>
                {errors.position && <span className="error-message">{errors.position}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Hire Date *</label>
                <input
                  type="date"
                  name="hireDate"
                  value={formData.hireDate}
                  onChange={handleChange}
                  className={`form-input ${errors.hireDate ? 'error' : ''}`}
                />
                {errors.hireDate && <span className="error-message">{errors.hireDate}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Salary *</label>
                <input
                  type="number"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  className={`form-input ${errors.salary ? 'error' : ''}`}
                  placeholder="Enter annual salary"
                  min="0"
                />
                {errors.salary && <span className="error-message">{errors.salary}</span>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="form-input"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="On Leave">On Leave</option>
              </select>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="form-section">
            <h3>
              <Phone size={20} />
              Emergency Contact
            </h3>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Contact Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.emergencyContact.name}
                  onChange={handleEmergencyContactChange}
                  className="form-input"
                  placeholder="Enter emergency contact name"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Contact Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.emergencyContact.phone}
                  onChange={handleEmergencyContactChange}
                  className="form-input"
                  placeholder="Enter emergency contact phone"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Relationship</label>
              <input
                type="text"
                name="relationship"
                value={formData.emergencyContact.relationship}
                onChange={handleEmergencyContactChange}
                className="form-input"
                placeholder="e.g., Spouse, Parent, Friend"
              />
            </div>
          </div>

          {/* Documents Section - Only show when editing */}
          {isEditing && (
            <div className="form-section">
              <div className="section-header">
                <h3>
                  <FileText size={20} />
                  Documents
                </h3>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => setShowDocumentModal(true)}
                >
                  <Plus size={16} />
                  Add Document
                </button>
              </div>

              {employeeDocuments.length > 0 ? (
                <div className="documents-list">
                  {employeeDocuments.map(doc => (
                    <div key={doc.id} className="document-item">
                      <div className="document-info">
                        <div className="document-title">{doc.title}</div>
                        <div className="document-details">
                          <span className="document-type">{doc.documentType}</span>
                          <span className="document-date">
                            Uploaded: {new Date(doc.uploadDate).toLocaleDateString()}
                          </span>
                          {doc.expiryDate && (
                            <span className="document-expiry">
                              Expires: {new Date(doc.expiryDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="document-actions">
                        <span className={`status-badge ${getStatusColor(doc.status)}`}>
                          {doc.status}
                        </span>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDocumentDelete(doc.id)}
                          title="Delete Document"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-documents">
                  <p>No documents uploaded yet.</p>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setShowDocumentModal(true)}
                  >
                    <Upload size={16} />
                    Upload First Document
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Account Information (only when adding) */}
          {!isEditing && (
            <div className="form-section">
              <h3>
                <User size={20} />
                Account Information
              </h3>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Username</label>
                  <input
                    type="text"
                    name="username"
                    value={accountData.username}
                    onChange={handleAccountChange}
                    className="form-input"
                    placeholder="Set username for employee login"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={accountData.password}
                    onChange={handleAccountChange}
                    className="form-input"
                    placeholder="Set password for employee login"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/')}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            <Save size={16} />
            {isEditing ? 'Update Employee' : 'Add Employee'}
          </button>
        </div>
      </form>

      {/* Document Upload Modal */}
      {showDocumentModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Upload New Document</h3>
            <form onSubmit={handleDocumentSubmit}>
              <div className="form-group">
                <label>Document Type *</label>
                <select
                  value={documentData.documentType}
                  onChange={(e) => setDocumentData(prev => ({ ...prev, documentType: e.target.value }))}
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
                  value={documentData.title}
                  onChange={(e) => setDocumentData(prev => ({ ...prev, title: e.target.value }))}
                  required
                  className="form-input"
                  placeholder="Document title"
                />
              </div>

              <div className="form-group">
                <label>Expiry Date</label>
                <input
                  type="date"
                  value={documentData.expiryDate}
                  onChange={(e) => setDocumentData(prev => ({ ...prev, expiryDate: e.target.value }))}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>File</label>
                <input
                  type="file"
                  onChange={handleDocumentUpload}
                  className="form-input"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowDocumentModal(false)}
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

export default EmployeeForm; 