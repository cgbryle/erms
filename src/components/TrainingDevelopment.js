import React, { useState, useEffect } from 'react';
import './TrainingDevelopment.css';

const TABS = ['Trainings', 'Certifications', 'Skills'];

const TrainingDevelopment = () => {
  const [activeTab, setActiveTab] = useState('Trainings');
  const [employees, setEmployees] = useState([]);
  const [filterEmployee, setFilterEmployee] = useState('');

  // Trainings
  const [trainings, setTrainings] = useState([]);
  const [trainingForm, setTrainingForm] = useState({ id: null, employeeId: '', title: '', provider: '', date: '', status: 'Planned', notes: '' });
  const [editingTraining, setEditingTraining] = useState(false);
  const [trainingError, setTrainingError] = useState('');

  // Certifications
  const [certifications, setCertifications] = useState([]);
  const [certForm, setCertForm] = useState({ id: null, employeeId: '', name: '', issuedBy: '', issueDate: '', expiryDate: '', notes: '' });
  const [editingCert, setEditingCert] = useState(false);
  const [certError, setCertError] = useState('');

  // Skills
  const [skills, setSkills] = useState([]);
  const [skillForm, setSkillForm] = useState({ id: null, employeeId: '', skill: '', level: 'Beginner', notes: '' });
  const [editingSkill, setEditingSkill] = useState(false);
  const [skillError, setSkillError] = useState('');

  useEffect(() => { fetchEmployees(); }, []);
  useEffect(() => { fetchTrainings(); fetchCertifications(); fetchSkills(); }, [filterEmployee]);

  // Pre-select employee in forms when filter changes and not editing
  useEffect(() => {
    if (filterEmployee && !editingTraining) setTrainingForm(f => ({ ...f, employeeId: filterEmployee }));
    if (filterEmployee && !editingCert) setCertForm(f => ({ ...f, employeeId: filterEmployee }));
    if (filterEmployee && !editingSkill) setSkillForm(f => ({ ...f, employeeId: filterEmployee }));
  }, [filterEmployee, editingTraining, editingCert, editingSkill]);

  // Fetch functions
  const fetchEmployees = async () => {
    try {
      const res = await fetch('http://localhost:3001/employees');
      const data = await res.json();
      setEmployees(Array.isArray(data) ? data : []);
    } catch (e) { setEmployees([]); }
  };
  const fetchTrainings = async () => {
    try {
      let url = 'http://localhost:3001/trainings';
      if (filterEmployee) url += `?employeeId=${filterEmployee}`;
      const res = await fetch(url);
      const data = await res.json();
      setTrainings(Array.isArray(data) ? data : []);
    } catch (e) { setTrainings([]); }
  };
  const fetchCertifications = async () => {
    try {
      let url = 'http://localhost:3001/certifications';
      if (filterEmployee) url += `?employeeId=${filterEmployee}`;
      const res = await fetch(url);
      const data = await res.json();
      setCertifications(Array.isArray(data) ? data : []);
    } catch (e) { setCertifications([]); }
  };
  const fetchSkills = async () => {
    try {
      let url = 'http://localhost:3001/skills';
      if (filterEmployee) url += `?employeeId=${filterEmployee}`;
      const res = await fetch(url);
      const data = await res.json();
      setSkills(Array.isArray(data) ? data : []);
    } catch (e) { setSkills([]); }
  };

  // Training CRUD
  const handleTrainingChange = e => setTrainingForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const handleTrainingSubmit = async e => {
    e.preventDefault();
    setTrainingError('');
    if (!trainingForm.employeeId || !trainingForm.title || !trainingForm.date) {
      setTrainingError('Employee, Title, and Date are required.');
      return;
    }
    try {
      const method = editingTraining ? 'PUT' : 'POST';
      const url = editingTraining ? `http://localhost:3001/trainings/${trainingForm.id}` : 'http://localhost:3001/trainings';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trainingForm)
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setTrainingError(data.error || 'Failed to save training.');
        return;
      }
      setTrainingForm({ id: null, employeeId: filterEmployee || '', title: '', provider: '', date: '', status: 'Planned', notes: '' });
      setEditingTraining(false);
      fetchTrainings();
    } catch (e) { setTrainingError('Failed to save training.'); }
  };
  const handleTrainingEdit = t => { setTrainingForm(t); setEditingTraining(true); setTrainingError(''); };
  const handleTrainingDelete = async id => {
    if (!window.confirm('Delete this training?')) return;
    try {
      await fetch(`http://localhost:3001/trainings/${id}`, { method: 'DELETE' });
      fetchTrainings();
    } catch (e) { alert('Failed to delete training.'); }
  };
  const handleTrainingCancel = () => { setTrainingForm({ id: null, employeeId: filterEmployee || '', title: '', provider: '', date: '', status: 'Planned', notes: '' }); setEditingTraining(false); setTrainingError(''); };

  // Certification CRUD
  const handleCertChange = e => setCertForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const handleCertSubmit = async e => {
    e.preventDefault();
    setCertError('');
    if (!certForm.employeeId || !certForm.name || !certForm.issueDate) {
      setCertError('Employee, Name, and Issue Date are required.');
      return;
    }
    try {
      const method = editingCert ? 'PUT' : 'POST';
      const url = editingCert ? `http://localhost:3001/certifications/${certForm.id}` : 'http://localhost:3001/certifications';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(certForm)
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setCertError(data.error || 'Failed to save certification.');
        return;
      }
      setCertForm({ id: null, employeeId: filterEmployee || '', name: '', issuedBy: '', issueDate: '', expiryDate: '', notes: '' });
      setEditingCert(false);
      fetchCertifications();
    } catch (e) { setCertError('Failed to save certification.'); }
  };
  const handleCertEdit = c => { setCertForm(c); setEditingCert(true); setCertError(''); };
  const handleCertDelete = async id => {
    if (!window.confirm('Delete this certification?')) return;
    try {
      await fetch(`http://localhost:3001/certifications/${id}`, { method: 'DELETE' });
      fetchCertifications();
    } catch (e) { alert('Failed to delete certification.'); }
  };
  const handleCertCancel = () => { setCertForm({ id: null, employeeId: filterEmployee || '', name: '', issuedBy: '', issueDate: '', expiryDate: '', notes: '' }); setEditingCert(false); setCertError(''); };

  // Skill CRUD
  const handleSkillChange = e => setSkillForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const handleSkillSubmit = async e => {
    e.preventDefault();
    setSkillError('');
    if (!skillForm.employeeId || !skillForm.skill) {
      setSkillError('Employee and Skill are required.');
      return;
    }
    try {
      const method = editingSkill ? 'PUT' : 'POST';
      const url = editingSkill ? `http://localhost:3001/skills/${skillForm.id}` : 'http://localhost:3001/skills';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(skillForm)
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setSkillError(data.error || 'Failed to save skill.');
        return;
      }
      setSkillForm({ id: null, employeeId: filterEmployee || '', skill: '', level: 'Beginner', notes: '' });
      setEditingSkill(false);
      fetchSkills();
    } catch (e) { setSkillError('Failed to save skill.'); }
  };
  const handleSkillEdit = s => { setSkillForm(s); setEditingSkill(true); setSkillError(''); };
  const handleSkillDelete = async id => {
    if (!window.confirm('Delete this skill?')) return;
    try {
      await fetch(`http://localhost:3001/skills/${id}`, { method: 'DELETE' });
      fetchSkills();
    } catch (e) { alert('Failed to delete skill.'); }
  };
  const handleSkillCancel = () => { setSkillForm({ id: null, employeeId: filterEmployee || '', skill: '', level: 'Beginner', notes: '' }); setEditingSkill(false); setSkillError(''); };

  // Tab content renderers
  const renderTrainings = () => (
    <div className="training-section">
      <h2 className="section-header">Trainings</h2>
      <table className="training-table">
        <thead>
          <tr>
            <th>Employee</th>
            <th>Title</th>
            <th>Provider</th>
            <th>Date</th>
            <th>Status</th>
            <th>Notes</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {trainings.length === 0 ? (
            <tr><td colSpan={7}>No trainings found.</td></tr>
          ) : (
            trainings.map(t => (
              <tr key={t.id}>
                <td>{employees.find(e => e.id === t.employeeId)?.name || t.employeeId}</td>
                <td>{t.title}</td>
                <td>{t.provider}</td>
                <td>{t.date}</td>
                <td>{t.status}</td>
                <td>{t.notes}</td>
                <td>
                  <button className="btn btn-secondary btn-sm" onClick={() => handleTrainingEdit(t)}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleTrainingDelete(t.id)}>Delete</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <h3 style={{ marginTop: 24 }}>{editingTraining ? 'Edit Training' : 'Add Training'}</h3>
      <form onSubmit={handleTrainingSubmit} className="training-form">
        <div className="form-group">
          <label>Employee *</label>
          <select name="employeeId" value={trainingForm.employeeId} onChange={handleTrainingChange} required disabled={!!filterEmployee && !editingTraining}>
            <option value="">Select Employee</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.name}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Title *</label>
          <input name="title" value={trainingForm.title} onChange={handleTrainingChange} required />
        </div>
        <div className="form-group">
          <label>Provider</label>
          <input name="provider" value={trainingForm.provider} onChange={handleTrainingChange} />
        </div>
        <div className="form-group">
          <label>Date *</label>
          <input name="date" type="date" value={trainingForm.date} onChange={handleTrainingChange} required />
        </div>
        <div className="form-group">
          <label>Status</label>
          <select name="status" value={trainingForm.status} onChange={handleTrainingChange}>
            <option value="Planned">Planned</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
        <div className="form-group">
          <label>Notes</label>
          <textarea name="notes" value={trainingForm.notes} onChange={handleTrainingChange} />
        </div>
        {trainingError && <div className="form-error">{trainingError}</div>}
        <div className="form-actions">
          <button className="btn btn-primary" type="submit">{editingTraining ? 'Update' : 'Add'}</button>
          {editingTraining && <button className="btn btn-secondary" type="button" onClick={handleTrainingCancel} style={{ marginLeft: 8 }}>Cancel</button>}
        </div>
      </form>
    </div>
  );

  const renderCertifications = () => (
    <div className="training-section">
      <h2 className="section-header">Certifications</h2>
      <table className="training-table">
        <thead>
          <tr>
            <th>Employee</th>
            <th>Name</th>
            <th>Issued By</th>
            <th>Issue Date</th>
            <th>Expiry Date</th>
            <th>Notes</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {certifications.length === 0 ? (
            <tr><td colSpan={7}>No certifications found.</td></tr>
          ) : (
            certifications.map(c => (
              <tr key={c.id}>
                <td>{employees.find(e => e.id === c.employeeId)?.name || c.employeeId}</td>
                <td>{c.name}</td>
                <td>{c.issuedBy}</td>
                <td>{c.issueDate}</td>
                <td>{c.expiryDate || '-'}</td>
                <td>{c.notes}</td>
                <td>
                  <button className="btn btn-secondary btn-sm" onClick={() => handleCertEdit(c)}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleCertDelete(c.id)}>Delete</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <h3 style={{ marginTop: 24 }}>{editingCert ? 'Edit Certification' : 'Add Certification'}</h3>
      <form onSubmit={handleCertSubmit} className="training-form">
        <div className="form-group">
          <label>Employee *</label>
          <select name="employeeId" value={certForm.employeeId} onChange={handleCertChange} required disabled={!!filterEmployee && !editingCert}>
            <option value="">Select Employee</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.name}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Name *</label>
          <input name="name" value={certForm.name} onChange={handleCertChange} required />
        </div>
        <div className="form-group">
          <label>Issued By</label>
          <input name="issuedBy" value={certForm.issuedBy} onChange={handleCertChange} />
        </div>
        <div className="form-group">
          <label>Issue Date *</label>
          <input name="issueDate" type="date" value={certForm.issueDate} onChange={handleCertChange} required />
        </div>
        <div className="form-group">
          <label>Expiry Date</label>
          <input name="expiryDate" type="date" value={certForm.expiryDate} onChange={handleCertChange} />
        </div>
        <div className="form-group">
          <label>Notes</label>
          <textarea name="notes" value={certForm.notes} onChange={handleCertChange} />
        </div>
        {certError && <div className="form-error">{certError}</div>}
        <div className="form-actions">
          <button className="btn btn-primary" type="submit">{editingCert ? 'Update' : 'Add'}</button>
          {editingCert && <button className="btn btn-secondary" type="button" onClick={handleCertCancel} style={{ marginLeft: 8 }}>Cancel</button>}
        </div>
      </form>
    </div>
  );

  const renderSkills = () => (
    <div className="training-section">
      <h2 className="section-header">Skills</h2>
      <table className="training-table">
        <thead>
          <tr>
            <th>Employee</th>
            <th>Skill</th>
            <th>Level</th>
            <th>Notes</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {skills.length === 0 ? (
            <tr><td colSpan={5}>No skills found.</td></tr>
          ) : (
            skills.map(s => (
              <tr key={s.id}>
                <td>{employees.find(e => e.id === s.employeeId)?.name || s.employeeId}</td>
                <td>{s.skill}</td>
                <td>{s.level}</td>
                <td>{s.notes}</td>
                <td>
                  <button className="btn btn-secondary btn-sm" onClick={() => handleSkillEdit(s)}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleSkillDelete(s.id)}>Delete</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <h3 style={{ marginTop: 24 }}>{editingSkill ? 'Edit Skill' : 'Add Skill'}</h3>
      <form onSubmit={handleSkillSubmit} className="training-form">
        <div className="form-group">
          <label>Employee *</label>
          <select name="employeeId" value={skillForm.employeeId} onChange={handleSkillChange} required disabled={!!filterEmployee && !editingSkill}>
            <option value="">Select Employee</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.name}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Skill *</label>
          <input name="skill" value={skillForm.skill} onChange={handleSkillChange} required />
        </div>
        <div className="form-group">
          <label>Level</label>
          <select name="level" value={skillForm.level} onChange={handleSkillChange}>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
            <option value="Expert">Expert</option>
          </select>
        </div>
        <div className="form-group">
          <label>Notes</label>
          <textarea name="notes" value={skillForm.notes} onChange={handleSkillChange} />
        </div>
        {skillError && <div className="form-error">{skillError}</div>}
        <div className="form-actions">
          <button className="btn btn-primary" type="submit">{editingSkill ? 'Update' : 'Add'}</button>
          {editingSkill && <button className="btn btn-secondary" type="button" onClick={handleSkillCancel} style={{ marginLeft: 8 }}>Cancel</button>}
        </div>
      </form>
    </div>
  );

  return (
    <div className="training-bg">
      <div className="training-card">
        <h1 className="training-title">Training & Development</h1>
        <div className="training-tabs">
          {TABS.map(tab => (
            <button key={tab} className={`tab-btn${activeTab === tab ? ' active' : ''}`} onClick={() => setActiveTab(tab)}>{tab}</button>
          ))}
        </div>
        <div className="training-filter">
          <label>Filter by Employee: </label>
          <select value={filterEmployee} onChange={e => setFilterEmployee(e.target.value)}>
            <option value="">All</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.name}</option>
            ))}
          </select>
        </div>
        {activeTab === 'Trainings' && renderTrainings()}
        {activeTab === 'Certifications' && renderCertifications()}
        {activeTab === 'Skills' && renderSkills()}
      </div>
    </div>
  );
};

export default TrainingDevelopment; 