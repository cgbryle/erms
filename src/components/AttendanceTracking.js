import React, { useState, useEffect } from 'react';

const AttendanceTracking = ({ currentUser }) => {
  const [attendance, setAttendance] = useState(null);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leaveForm, setLeaveForm] = useState({
    type: '',
    startDate: '',
    endDate: '',
    reason: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [allAttendance, setAllAttendance] = useState([]);
  const [allLeaveRequests, setAllLeaveRequests] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [attendanceDate, setAttendanceDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [notification, setNotification] = useState('');
  const [leaveActionComment, setLeaveActionComment] = useState('');
  const [leaveStatusFilter, setLeaveStatusFilter] = useState('');
  const [attendanceStatusFilter, setAttendanceStatusFilter] = useState('');
  const [attendanceEmployeeFilter, setAttendanceEmployeeFilter] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [editError, setEditError] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const isEmployee = currentUser?.role === 'employee';

  // Admin/HR: fetch all attendance and leave requests
  useEffect(() => {
    if (!isEmployee) {
      fetchAllAttendance();
      fetchAllLeaveRequests();
      fetchEmployees();
    }
    // eslint-disable-next-line
  }, [isEmployee]);

  const fetchAllAttendance = async () => {
    try {
      let url = `http://localhost:3001/attendance/date/${attendanceDate}`;
      const params = [];
      if (attendanceEmployeeFilter) params.push(`employeeId=${attendanceEmployeeFilter}`);
      if (attendanceStatusFilter) params.push(`status=${attendanceStatusFilter}`);
      if (params.length > 0) url += '?' + params.join('&');
      const res = await fetch(url);
      const data = await res.json();
      setAllAttendance(Array.isArray(data) ? data : []);
    } catch (e) {
      setAllAttendance([]);
    }
  };

  const fetchAllLeaveRequests = async () => {
    try {
      let url = 'http://localhost:3001/leave-requests';
      if (leaveStatusFilter) url += `?status=${leaveStatusFilter}`;
      const res = await fetch(url);
      const data = await res.json();
      setAllLeaveRequests(Array.isArray(data) ? data : []);
    } catch (e) {
      setAllLeaveRequests([]);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await fetch('http://localhost:3001/employees');
      const data = await res.json();
      setEmployees(Array.isArray(data) ? data : []);
    } catch (e) {
      setEmployees([]);
    }
  };

  // Fetch today's attendance and leave requests
  useEffect(() => {
    fetchAttendance();
    fetchLeaveRequests();
    // eslint-disable-next-line
  }, []);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3001/attendance/${currentUser.id}`);
      const data = await res.json();
      // Find today's record
      const today = new Date().toISOString().split('T')[0];
      setAttendance(data.find(a => a.date === today) || null);
    } catch (e) {
      setAttendance(null);
    }
    setLoading(false);
  };

  const fetchLeaveRequests = async () => {
    try {
      const res = await fetch(`http://localhost:3001/leave-requests/${currentUser.id}`);
      const data = await res.json();
      setLeaveRequests(Array.isArray(data) ? data : []);
    } catch (e) {
      setLeaveRequests([]);
    }
  };

  const handleClockIn = async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('http://localhost:3001/attendance/clockin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: currentUser.id })
      });
      const data = await res.json();
      setMessage(data.message || 'Clocked in!');
      fetchAttendance();
    } catch (e) {
      setMessage('Error clocking in.');
    }
    setLoading(false);
  };

  const handleClockOut = async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('http://localhost:3001/attendance/clockout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: currentUser.id })
      });
      const data = await res.json();
      setMessage(data.message || 'Clocked out!');
      fetchAttendance();
    } catch (e) {
      setMessage('Error clocking out.');
    }
    setLoading(false);
  };

  const handleAbsent = async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('http://localhost:3001/attendance/absent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: currentUser.id })
      });
      const data = await res.json();
      setMessage(data.message || 'Marked as absent.');
      fetchAttendance();
    } catch (e) {
      setMessage('Error marking absent.');
    }
    setLoading(false);
  };

  const handleLeaveChange = (e) => {
    setLeaveForm({ ...leaveForm, [e.target.name]: e.target.value });
  };

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('http://localhost:3001/leave-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: currentUser.id,
          ...leaveForm
        })
      });
      const data = await res.json();
      setMessage(data.message || 'Leave request submitted!');
      setLeaveForm({ type: '', startDate: '', endDate: '', reason: '' });
      fetchLeaveRequests();
    } catch (e) {
      setMessage('Error submitting leave request.');
    }
    setLoading(false);
  };

  // Refetch attendance when date changes
  useEffect(() => {
    if (!isEmployee) {
      fetchAllAttendance();
    }
    // eslint-disable-next-line
  }, [attendanceDate]);

  // Approve/Deny leave request with comment and notification
  const handleLeaveAction = async (id, status) => {
    try {
      const res = await fetch(`http://localhost:3001/leave-requests/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, comment: leaveActionComment })
      });
      await res.json();
      setNotification(`Leave request ${status.toLowerCase()}${leaveActionComment ? ': ' + leaveActionComment : ''}`);
      setLeaveActionComment('');
      fetchAllLeaveRequests();
    } catch (e) {
      setNotification('Failed to update leave request.');
    }
  };

  // Notification auto-hide
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleEditProfile = () => {
    setEditForm({
      ...currentUser,
      hireDate: currentUser.hireDate || currentUser.date_hired || '',
      emergencyContact: currentUser.emergencyContact || { name: '', phone: '', relationship: '' },
    });
    setShowEditModal(true);
    setEditError('');
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('emergencyContact.')) {
      const field = name.split('.')[1];
      setEditForm((prev) => ({
        ...prev,
        emergencyContact: { ...prev.emergencyContact, [field]: value },
      }));
    } else {
      setEditForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError('');
    try {
      const res = await fetch(`http://localhost:3001/employees/${currentUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editForm,
          date_hired: editForm.hireDate,
        }),
      });
      if (!res.ok) throw new Error('Failed to update profile');
      setShowEditModal(false);
      window.location.reload(); // reload to update profile info
    } catch (err) {
      setEditError('Failed to update profile.');
    }
    setEditLoading(false);
  };

  if (!currentUser) {
    return null;
  }

  if (!isEmployee) {
    // Admin/HR view
    return (
      <div className="attendance-tracking">
        <div className="card">
          <h1>Attendance & Leave Management</h1>
          {notification && <div style={{ background: '#e3f2fd', color: '#1976d2', padding: 10, marginBottom: 10, borderRadius: 6 }}>{notification}</div>}
          <h2>Attendance</h2>
          <div style={{ marginBottom: 10, display: 'flex', gap: 10, alignItems: 'center' }}>
            <label><b>Date: </b></label>
            <input type="date" value={attendanceDate} onChange={e => setAttendanceDate(e.target.value)} />
            <label>Employee:</label>
            <select value={attendanceEmployeeFilter} onChange={e => setAttendanceEmployeeFilter(e.target.value)}>
              <option value="">All</option>
              {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
            </select>
            <label>Status:</label>
            <select value={attendanceStatusFilter} onChange={e => setAttendanceStatusFilter(e.target.value)}>
              <option value="">All</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
            </select>
          </div>
          <table className="table" style={{ maxWidth: 900 }}>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Status</th>
                <th>Clock In</th>
                <th>Clock Out</th>
              </tr>
            </thead>
            <tbody>
              {allAttendance.length === 0 ? (
                <tr><td colSpan={4}>No attendance records for this date.</td></tr>
              ) : (
                allAttendance.map(a => {
                  const emp = employees.find(e => e.id === a.employeeId);
                  return (
                    <tr key={a.id}>
                      <td>{emp ? emp.name : a.employeeId}</td>
                      <td>{a.status}</td>
                      <td>{a.clockIn || '-'}</td>
                      <td>{a.clockOut || '-'}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          <hr />
          <h2>All Leave Requests</h2>
          <div style={{ marginBottom: 10, display: 'flex', gap: 10, alignItems: 'center' }}>
            <label>Status:</label>
            <select value={leaveStatusFilter} onChange={e => setLeaveStatusFilter(e.target.value)}>
              <option value="">All</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Denied">Denied</option>
            </select>
          </div>
          <table className="table" style={{ maxWidth: 900 }}>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Type</th>
                <th>Start</th>
                <th>End</th>
                <th>Status</th>
                <th>Reason</th>
                <th>Comment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {allLeaveRequests.length === 0 ? (
                <tr><td colSpan={8}>No leave requests.</td></tr>
              ) : (
                allLeaveRequests.map(req => {
                  const emp = employees.find(e => e.id === req.employeeId);
                  return (
                    <tr key={req.id}>
                      <td>{emp ? emp.name : req.employeeId}</td>
                      <td>{req.type}</td>
                      <td>{req.startDate}</td>
                      <td>{req.endDate}</td>
                      <td>{req.status}</td>
                      <td>{req.reason || '-'}</td>
                      <td>{req.comment || '-'}</td>
                      <td>
                        {req.status === 'Pending' && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <input
                              type="text"
                              placeholder="Comment (optional)"
                              value={leaveActionComment}
                              onChange={e => setLeaveActionComment(e.target.value)}
                              style={{ fontSize: 12, padding: 4, borderRadius: 4, border: '1px solid #ccc' }}
                            />
                            <div style={{ display: 'flex', gap: 4 }}>
                              <button className="btn btn-success btn-sm" onClick={() => handleLeaveAction(req.id, 'Approved')}>Approve</button>
                              <button className="btn btn-danger btn-sm" onClick={() => handleLeaveAction(req.id, 'Denied')}>Deny</button>
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="attendance-tracking" style={{ position: 'relative' }}>
      {/* Employee Profile Card (only for employees) */}
      {isEmployee && (
        <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}>
          <button className="btn btn-primary" onClick={() => setShowProfile((prev) => !prev)}>
            {showProfile ? 'Hide Profile' : 'View Profile'}
          </button>
        </div>
      )}
      {isEmployee && showProfile && (
        <div className="profile-card" style={{ marginTop: 56 }}>
          <h2>My Profile</h2>
          <div className="profile-details">
            <div><strong>Name:</strong> {currentUser?.name || 'N/A'}</div>
            <div><strong>Email:</strong> {currentUser?.email || 'N/A'}</div>
            <div><strong>Phone:</strong> {currentUser?.phone || 'N/A'}</div>
            <div><strong>Address:</strong> {currentUser?.address || 'N/A'}</div>
            <div><strong>Department:</strong> {currentUser?.department || 'N/A'}</div>
            <div><strong>Position:</strong> {currentUser?.position || 'N/A'}</div>
            <div><strong>Hire Date:</strong> {currentUser?.hireDate ? new Date(currentUser.hireDate).toLocaleDateString() : (currentUser?.date_hired ? new Date(currentUser.date_hired).toLocaleDateString() : 'N/A')}</div>
            <div><strong>Salary:</strong> {currentUser?.salary || 'N/A'}</div>
            <div><strong>Status:</strong> {currentUser?.status || 'N/A'}</div>
            {currentUser?.emergencyContact && (
              <div><strong>Emergency Contact:</strong> {currentUser.emergencyContact.name} ({currentUser.emergencyContact.relationship}) - {currentUser.emergencyContact.phone}</div>
            )}
          </div>
          <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={handleEditProfile}>Edit Profile</button>
        </div>
      )}
      {/* Edit Profile Modal (only for employees) */}
      {showEditModal && editForm && (
        <div className="modal-overlay">
          <div className="modal profile-modal">
            <h3>Edit My Profile</h3>
            <form onSubmit={handleEditSubmit} className="profile-details" style={{ gap: 12 }}>
              <label>Name: <input name="name" value={editForm.name} onChange={handleEditChange} required /></label>
              <label>Email: <input name="email" value={editForm.email} onChange={handleEditChange} required /></label>
              <label>Phone: <input name="phone" value={editForm.phone} onChange={handleEditChange} required /></label>
              <label>Address: <input name="address" value={editForm.address} onChange={handleEditChange} /></label>
              <label>Department: <input name="department" value={editForm.department} onChange={handleEditChange} /></label>
              <label>Position: <input name="position" value={editForm.position} onChange={handleEditChange} /></label>
              <label>Hire Date: <input name="hireDate" type="date" value={editForm.hireDate} onChange={handleEditChange} /></label>
              <label>Salary: <input name="salary" value={editForm.salary} onChange={handleEditChange} /></label>
              <label>Status: <input name="status" value={editForm.status} onChange={handleEditChange} /></label>
              <fieldset style={{ border: '1px solid #eee', borderRadius: 4, padding: 8 }}>
                <legend>Emergency Contact</legend>
                <label>Name: <input name="emergencyContact.name" value={editForm.emergencyContact?.name || ''} onChange={handleEditChange} /></label>
                <label>Phone: <input name="emergencyContact.phone" value={editForm.emergencyContact?.phone || ''} onChange={handleEditChange} /></label>
                <label>Relationship: <input name="emergencyContact.relationship" value={editForm.emergencyContact?.relationship || ''} onChange={handleEditChange} /></label>
              </fieldset>
              {editError && <div style={{ color: 'red' }}>{editError}</div>}
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={editLoading}>{editLoading ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <div className="card">
        <h1>Attendance & Leave Tracking</h1>
        {message && <div style={{ color: '#1976d2', marginBottom: 10 }}>{message}</div>}
        <h2>Today's Attendance</h2>
        {attendance ? (
          <div>
            <p>Status: <b>{attendance.status}</b></p>
            <p>Clock In: {attendance.clockIn || '-'}</p>
            <p>Clock Out: {attendance.clockOut || '-'}</p>
          </div>
        ) : (
          <p>No attendance record for today.</p>
        )}
        <div style={{ display: 'flex', gap: 10, margin: '10px 0' }}>
          <button className="btn btn-primary" onClick={handleClockIn} disabled={loading}>Clock In</button>
          <button className="btn btn-secondary" onClick={handleClockOut} disabled={loading}>Clock Out</button>
          <button className="btn btn-danger" onClick={handleAbsent} disabled={loading}>Mark Absent</button>
        </div>
        <hr />
        <h2>Submit Leave Request</h2>
        <form onSubmit={handleLeaveSubmit} style={{ maxWidth: 400 }}>
          <div className="form-group">
            <label>Type *</label>
            <select name="type" value={leaveForm.type} onChange={handleLeaveChange} required className="form-input">
              <option value="">Select Type</option>
              <option value="Vacation">Vacation</option>
              <option value="Sick">Sick</option>
              <option value="Personal">Personal</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label>Start Date *</label>
            <input type="date" name="startDate" value={leaveForm.startDate} onChange={handleLeaveChange} required className="form-input" />
          </div>
          <div className="form-group">
            <label>End Date *</label>
            <input type="date" name="endDate" value={leaveForm.endDate} onChange={handleLeaveChange} required className="form-input" />
          </div>
          <div className="form-group">
            <label>Reason</label>
            <input type="text" name="reason" value={leaveForm.reason} onChange={handleLeaveChange} className="form-input" placeholder="Optional" />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>Submit Leave Request</button>
        </form>
        <hr />
        <h2>My Leave Requests</h2>
        {leaveRequests.length === 0 ? <p>No leave requests yet.</p> : (
          <table className="table" style={{ maxWidth: 600 }}>
            <thead>
              <tr>
                <th>Type</th>
                <th>Start</th>
                <th>End</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {leaveRequests.map(req => (
                <tr key={req.id}>
                  <td>{req.type}</td>
                  <td>{req.startDate}</td>
                  <td>{req.endDate}</td>
                  <td>{req.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AttendanceTracking; 