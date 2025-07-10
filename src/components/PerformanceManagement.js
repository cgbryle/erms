import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './PerformanceManagement.css';

const ratingWords = {
  1: 'Poor',
  2: 'Fair',
  3: 'Average',
  4: 'Good',
  5: 'Very Good',
};

const PerformanceManagement = () => {
  const location = useLocation();
  const [reviews, setReviews] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({
    id: null,
    employeeId: '',
    reviewer: '',
    reviewDate: '',
    rating: '',
    comments: ''
  });
  const [editing, setEditing] = useState(false);
  const [filterEmployee, setFilterEmployee] = useState('');
  const [error, setError] = useState('');

  // Set filterEmployee from query param on mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const empId = params.get('employeeId');
    if (empId) setFilterEmployee(empId);
  }, [location.search]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line
  }, [filterEmployee]);

  // When filterEmployee changes and not editing, pre-select in form
  useEffect(() => {
    if (filterEmployee && !editing) {
      setForm(f => ({ ...f, employeeId: filterEmployee }));
    }
  }, [filterEmployee, editing]);

  const fetchEmployees = async () => {
    try {
      const res = await fetch('http://localhost:3001/employees');
      const data = await res.json();
      setEmployees(Array.isArray(data) ? data : []);
    } catch (e) {
      setEmployees([]);
    }
  };

  const fetchReviews = async () => {
    try {
      let url = 'http://localhost:3001/performance-reviews';
      if (filterEmployee) url += `?employeeId=${filterEmployee}`;
      const res = await fetch(url);
      const data = await res.json();
      setReviews(Array.isArray(data) ? data : []);
    } catch (e) {
      setReviews([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Helper to format date to YYYY-MM-DD
  const formatDate = (dateStr) => {
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
      const [day, month, year] = dateStr.split('/');
      return `${year}-${month}-${day}`;
    }
    return dateStr;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    // Validate employeeId is in employees list
    const validEmployee = employees.some(emp => String(emp.id) === String(form.employeeId));
    if (!validEmployee) {
      setError('Please select a valid employee.');
      return;
    }
    if (!form.employeeId || !form.reviewer || !form.reviewDate || !form.rating) {
      setError('All fields except comments are required.');
      return;
    }
    try {
      const method = editing ? 'PUT' : 'POST';
      const url = editing
        ? `http://localhost:3001/performance-reviews/${form.id}`
        : 'http://localhost:3001/performance-reviews';
      const reviewDate = formatDate(form.reviewDate);
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: form.employeeId,
          reviewer: form.reviewer,
          reviewDate,
          rating: form.rating,
          comments: form.comments
        })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Failed to save review.');
        return;
      }
      setForm({ id: null, employeeId: '', reviewer: '', reviewDate: '', rating: '', comments: '' });
      setEditing(false);
      fetchReviews();
    } catch (e) {
      setError('Failed to save review.');
    }
  };

  const handleEdit = (review) => {
    setForm({ ...review });
    setEditing(true);
    setError('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await fetch(`http://localhost:3001/performance-reviews/${id}`, { method: 'DELETE' });
      fetchReviews();
    } catch (e) {
      alert('Failed to delete review.');
    }
  };

  const handleCancel = () => {
    setForm({ id: null, employeeId: '', reviewer: '', reviewDate: '', rating: '', comments: '' });
    setEditing(false);
    setError('');
  };

  return (
    <div className="performance-bg">
      <div className="performance-card">
        <h1 className="performance-title">Performance Management</h1>
        <div className="performance-section performance-filter">
          <label htmlFor="filterEmployee">Filter by Employee: </label>
          <select id="filterEmployee" value={filterEmployee} onChange={e => setFilterEmployee(e.target.value)}>
            <option value="">All</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.name}</option>
            ))}
          </select>
        </div>
        <div className="performance-section">
          <h2 className="section-header">Performance Reviews</h2>
          <table className="performance-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Reviewer</th>
                <th>Date</th>
                <th>Rating</th>
                <th>Comments</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.length === 0 ? (
                <tr><td colSpan={6}>No reviews found.</td></tr>
              ) : (
                reviews.map(r => (
                  <tr key={r.id}>
                    <td>{employees.find(e => e.id === r.employeeId)?.name || r.employeeId}</td>
                    <td>{r.reviewer}</td>
                    <td>{r.reviewDate}</td>
                    <td>{r.rating} {ratingWords[r.rating] ? `(${ratingWords[r.rating]})` : ''}</td>
                    <td>{r.comments}</td>
                    <td>
                      <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(r)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(r.id)}>Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="performance-section">
          <h2 className="section-header">{editing ? 'Edit Review' : 'Add Review'}</h2>
          <form onSubmit={handleSubmit} className="performance-form">
            <div className="form-group">
              <label>Employee *</label>
              <select name="employeeId" value={form.employeeId} onChange={handleChange} required disabled={!!filterEmployee && !editing}>
                <option value="">Select Employee</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Reviewer *</label>
              <input name="reviewer" value={form.reviewer} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Date *</label>
              <input name="reviewDate" type="date" value={form.reviewDate} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Rating *</label>
              <input name="rating" type="number" min="1" max="5" value={form.rating} onChange={handleChange} required />
              <div style={{ fontSize: '0.9em', color: '#555', marginTop: 2 }}>
                1 = Poor, 2 = Fair, 3 = Average, 4 = Good, 5 = Very Good
              </div>
            </div>
            <div className="form-group">
              <label>Comments</label>
              <textarea name="comments" value={form.comments} onChange={handleChange} />
            </div>
            {error && <div className="form-error">{error}</div>}
            <div className="form-actions">
              <button className="btn btn-primary" type="submit">{editing ? 'Update' : 'Add'}</button>
              {editing && <button className="btn btn-secondary" type="button" onClick={handleCancel} style={{ marginLeft: 8 }}>Cancel</button>}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PerformanceManagement; 