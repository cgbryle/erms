import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, User, Mail, Phone, MapPin, Calendar, DollarSign } from 'lucide-react';
import './EmployeeForm.css';

const EmployeeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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
      fetch(`http://localhost:3001/employees`)
        .then(res => res.json())
        .then(data => {
          const emp = data.find(e => e.id === parseInt(id));
          if (emp) {
            setFormData({
              ...emp,
              hireDate: emp.date_hired || '',
              emergencyContact: emp.emergencyContact || { name: '', phone: '', relationship: '' },
            });
          }
        });
    }
  }, [id, isEditing]);

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
    </div>
  );
};

export default EmployeeForm; 