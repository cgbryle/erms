const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 3001;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '_' + file.originalname);
  }
});
const upload = multer({ storage });

// Serve uploaded files statically
app.use('/uploads', express.static(uploadsDir));

// MySQL connection setup
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'cgbryle',
  database: 'cgbryle',
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database!');
});

app.use(express.json());
app.use(cors());

// Get all employees (with pagination)
app.get('/employees', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;
  db.query('SELECT * FROM employees LIMIT ? OFFSET ?', [limit, offset], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Add a new employee
app.post('/employees', (req, res) => {
  const { name, email, position, date_hired } = req.body;
  db.query(
    'INSERT INTO employees (name, email, position, date_hired) VALUES (?, ?, ?, ?)',
    [name, email, position, date_hired],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: result.insertId, name, email, position, date_hired });
    }
  );
});

// Update an employee (all fields)
app.put('/employees/:id', (req, res) => {
  const { id } = req.params;
  const {
    name, email, phone, address, department, position, date_hired, salary, status,
    emergencyContact
  } = req.body;

  // Flatten emergencyContact if present
  const emergency_contact_name = emergencyContact?.name || null;
  const emergency_contact_phone = emergencyContact?.phone || null;
  const emergency_contact_relationship = emergencyContact?.relationship || null;

  db.query(
    `UPDATE employees SET
      name = ?, email = ?, phone = ?, address = ?, department = ?, position = ?,
      date_hired = ?, salary = ?, status = ?,
      emergency_contact_name = ?, emergency_contact_phone = ?, emergency_contact_relationship = ?
      WHERE id = ?`,
    [
      name, email, phone, address, department, position,
      date_hired, salary, status,
      emergency_contact_name, emergency_contact_phone, emergency_contact_relationship,
      id
    ],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({
        id, name, email, phone, address, department, position, date_hired, salary, status,
        emergency_contact_name, emergency_contact_phone, emergency_contact_relationship
      });
    }
  );
});

// Delete an employee
app.delete('/employees/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM employees WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Employee deleted', id });
  });
});

// Document Management APIs

// Get all documents with employee information (with pagination)
app.get('/documents', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;
  const query = `
    SELECT d.*, e.name as employeeName 
    FROM documents d 
    LEFT JOIN employees e ON d.employeeId = e.id 
    ORDER BY d.uploadDate DESC
    LIMIT ? OFFSET ?
  `;
  db.query(query, [limit, offset], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Get documents by employee ID
app.get('/employees/:id/documents', (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT d.*, e.name as employeeName 
    FROM documents d 
    LEFT JOIN employees e ON d.employeeId = e.id 
    WHERE d.employeeId = ?
    ORDER BY d.uploadDate DESC
  `;
  db.query(query, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Add a new document (with file upload)
app.post('/documents', upload.single('file'), (req, res) => {
  const { employeeId, documentType, title, uploadDate, expiryDate } = req.body;
  const fileName = req.file ? req.file.filename : null;
  const fileSize = req.file ? (req.file.size / (1024 * 1024)).toFixed(1) + ' MB' : null;
  const filePath = req.file ? `/uploads/${fileName}` : null;

  // Calculate status based on expiry date
  const today = new Date();
  const expiry = expiryDate ? new Date(expiryDate) : null;
  let status = 'Valid';
  if (expiry) {
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    if (daysUntilExpiry < 0) {
      status = 'Expired';
    } else if (daysUntilExpiry <= 30) {
      status = 'Expiring Soon';
    }
  }

  const query = `
    INSERT INTO documents (employeeId, documentType, title, fileName, uploadDate, expiryDate, fileSize, status, filePath)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  // Insert into DB, including filePath
  req.app.get('db')?.query || db.query(
    query,
    [employeeId, documentType, title, fileName, uploadDate, expiryDate, fileSize, status, filePath],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ 
        id: result.insertId, 
        employeeId, 
        documentType, 
        title, 
        fileName, 
        uploadDate, 
        expiryDate, 
        fileSize, 
        status,
        filePath
      });
    }
  );
});

// Update a document
app.put('/documents/:id', (req, res) => {
  const { id } = req.params;
  const { employeeId, documentType, title, fileName, uploadDate, expiryDate, fileSize } = req.body;
  
  // Calculate status based on expiry date
  const today = new Date();
  const expiry = new Date(expiryDate);
  const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
  
  let status = 'Valid';
  if (daysUntilExpiry < 0) {
    status = 'Expired';
  } else if (daysUntilExpiry <= 30) {
    status = 'Expiring Soon';
  }

  const query = `
    UPDATE documents 
    SET employeeId = ?, documentType = ?, title = ?, fileName = ?, uploadDate = ?, expiryDate = ?, fileSize = ?, status = ?
    WHERE id = ?
  `;
  
  db.query(
    query,
    [employeeId, documentType, title, fileName, uploadDate, expiryDate, fileSize, status, id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id, employeeId, documentType, title, fileName, uploadDate, expiryDate, fileSize, status });
    }
  );
});

// Delete a document
app.delete('/documents/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM documents WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Document deleted', id });
  });
});

// Get document statistics
app.get('/documents/stats', (req, res) => {
  const query = `
    SELECT 
      COUNT(*) as totalDocuments,
      SUM(CASE WHEN status = 'Valid' THEN 1 ELSE 0 END) as validDocuments,
      SUM(CASE WHEN status = 'Expiring Soon' THEN 1 ELSE 0 END) as expiringSoon,
      SUM(CASE WHEN status = 'Expired' THEN 1 ELSE 0 END) as expiredDocuments
    FROM documents
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results[0]);
  });
});

// Attendance APIs
// Log clock in
app.post('/attendance/clockin', (req, res) => {
  const { employeeId } = req.body;
  const today = new Date().toISOString().split('T')[0];
  const now = new Date().toTimeString().split(' ')[0];
  const query = `INSERT INTO attendance (employeeId, date, clockIn, status) VALUES (?, ?, ?, 'Present') ON DUPLICATE KEY UPDATE clockIn = VALUES(clockIn), status = 'Present'`;
  db.query(query, [employeeId, today, now], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Clocked in', employeeId, date: today, clockIn: now });
  });
});
// Log clock out
app.post('/attendance/clockout', (req, res) => {
  const { employeeId } = req.body;
  const today = new Date().toISOString().split('T')[0];
  const now = new Date().toTimeString().split(' ')[0];
  const query = `UPDATE attendance SET clockOut = ? WHERE employeeId = ? AND date = ?`;
  db.query(query, [now, employeeId, today], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Clocked out', employeeId, date: today, clockOut: now });
  });
});
// Mark absent
app.post('/attendance/absent', (req, res) => {
  const { employeeId } = req.body;
  const today = new Date().toISOString().split('T')[0];
  const query = `INSERT INTO attendance (employeeId, date, status) VALUES (?, ?, 'Absent') ON DUPLICATE KEY UPDATE status = 'Absent'`;
  db.query(query, [employeeId, today], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Marked absent', employeeId, date: today });
  });
});
// Get today's attendance for all employees
app.get('/attendance/today', (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  db.query('SELECT * FROM attendance WHERE date = ?', [today], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});
// Get attendance for an employee
app.get('/attendance/:employeeId', (req, res) => {
  const { employeeId } = req.params;
  db.query('SELECT * FROM attendance WHERE employeeId = ? ORDER BY date DESC', [employeeId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});
// Get attendance for a specific date
app.get('/attendance/date/:date', (req, res) => {
  const { date } = req.params;
  const { employeeId, status } = req.query;
  let query = 'SELECT * FROM attendance WHERE date = ?';
  const params = [date];
  if (employeeId) {
    query += ' AND employeeId = ?';
    params.push(employeeId);
  }
  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }
  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Leave Requests APIs
// Submit leave request
app.post('/leave-requests', (req, res) => {
  const { employeeId, type, startDate, endDate, reason } = req.body;
  const query = `INSERT INTO leave_requests (employeeId, type, startDate, endDate, reason) VALUES (?, ?, ?, ?, ?)`;
  db.query(query, [employeeId, type, startDate, endDate, reason], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Leave request submitted', id: result.insertId });
  });
});
// Get leave requests for an employee
app.get('/leave-requests/:employeeId', (req, res) => {
  const { employeeId } = req.params;
  db.query('SELECT * FROM leave_requests WHERE employeeId = ? ORDER BY startDate DESC', [employeeId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});
// Get all leave requests
app.get('/leave-requests', (req, res) => {
  const { status, employeeId } = req.query;
  let query = 'SELECT * FROM leave_requests';
  const params = [];
  const filters = [];
  if (status) {
    filters.push('status = ?');
    params.push(status);
  }
  if (employeeId) {
    filters.push('employeeId = ?');
    params.push(employeeId);
  }
  if (filters.length > 0) {
    query += ' WHERE ' + filters.join(' AND ');
  }
  query += ' ORDER BY created_at DESC';
  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});
// Update leave request status (approve/deny) with comment
app.put('/leave-requests/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, comment } = req.body;
  if (!['Approved', 'Denied'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  db.query('UPDATE leave_requests SET status = ?, comment = ? WHERE id = ?', [status, comment || null, id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Status updated', id, status, comment });
  });
});

// Performance Reviews CRUD APIs
// Get all performance reviews (optionally filter by employeeId)
app.get('/performance-reviews', (req, res) => {
  const { employeeId } = req.query;
  let query = 'SELECT * FROM performance_reviews';
  const params = [];
  if (employeeId) {
    query += ' WHERE employeeId = ?';
    params.push(employeeId);
  }
  query += ' ORDER BY reviewDate DESC';
  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});
// Create a new performance review
app.post('/performance-reviews', (req, res) => {
  const { employeeId, reviewer, reviewDate, rating, comments } = req.body;
  console.log('Attempting to insert review:', { employeeId, reviewer, reviewDate, rating, comments });
  db.query(
    'INSERT INTO performance_reviews (employeeId, reviewer, reviewDate, rating, comments) VALUES (?, ?, ?, ?, ?)',
    [employeeId, reviewer, reviewDate, rating, comments],
    (err, result) => {
      if (err) {
        console.error('Performance review insert error:', err);
        return res.status(500).json({ error: err.message });
      }
      res.json({ id: result.insertId, employeeId, reviewer, reviewDate, rating, comments });
    }
  );
});
// Update a performance review
app.put('/performance-reviews/:id', (req, res) => {
  const { id } = req.params;
  const { employeeId, reviewer, reviewDate, rating, comments } = req.body;
  db.query(
    'UPDATE performance_reviews SET employeeId = ?, reviewer = ?, reviewDate = ?, rating = ?, comments = ? WHERE id = ?',
    [employeeId, reviewer, reviewDate, rating, comments, id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id, employeeId, reviewer, reviewDate, rating, comments });
    }
  );
});
// Delete a performance review
app.delete('/performance-reviews/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM performance_reviews WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Performance review deleted', id });
  });
});

// Trainings CRUD
app.get('/trainings', (req, res) => {
  const { employeeId } = req.query;
  let query = 'SELECT * FROM trainings';
  const params = [];
  if (employeeId) {
    query += ' WHERE employeeId = ?';
    params.push(employeeId);
  }
  query += ' ORDER BY date DESC';
  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});
app.post('/trainings', (req, res) => {
  const { employeeId, title, provider, date, status, notes } = req.body;
  db.query(
    'INSERT INTO trainings (employeeId, title, provider, date, status, notes) VALUES (?, ?, ?, ?, ?, ?)',
    [employeeId, title, provider, date, status, notes],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: result.insertId, employeeId, title, provider, date, status, notes });
    }
  );
});
app.put('/trainings/:id', (req, res) => {
  const { id } = req.params;
  const { employeeId, title, provider, date, status, notes } = req.body;
  db.query(
    'UPDATE trainings SET employeeId = ?, title = ?, provider = ?, date = ?, status = ?, notes = ? WHERE id = ?',
    [employeeId, title, provider, date, status, notes, id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id, employeeId, title, provider, date, status, notes });
    }
  );
});
app.delete('/trainings/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM trainings WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Training deleted', id });
  });
});
// Certifications CRUD
app.get('/certifications', (req, res) => {
  const { employeeId } = req.query;
  let query = 'SELECT * FROM certifications';
  const params = [];
  if (employeeId) {
    query += ' WHERE employeeId = ?';
    params.push(employeeId);
  }
  query += ' ORDER BY issueDate DESC';
  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});
app.post('/certifications', (req, res) => {
  const { employeeId, name, issuedBy, issueDate, expiryDate, notes } = req.body;
  db.query(
    'INSERT INTO certifications (employeeId, name, issuedBy, issueDate, expiryDate, notes) VALUES (?, ?, ?, ?, ?, ?)',
    [employeeId, name, issuedBy, issueDate, expiryDate, notes],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: result.insertId, employeeId, name, issuedBy, issueDate, expiryDate, notes });
    }
  );
});
app.put('/certifications/:id', (req, res) => {
  const { id } = req.params;
  const { employeeId, name, issuedBy, issueDate, expiryDate, notes } = req.body;
  db.query(
    'UPDATE certifications SET employeeId = ?, name = ?, issuedBy = ?, issueDate = ?, expiryDate = ?, notes = ? WHERE id = ?',
    [employeeId, name, issuedBy, issueDate, expiryDate, notes, id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id, employeeId, name, issuedBy, issueDate, expiryDate, notes });
    }
  );
});
app.delete('/certifications/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM certifications WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Certification deleted', id });
  });
});
// Skills CRUD
app.get('/skills', (req, res) => {
  const { employeeId } = req.query;
  let query = 'SELECT * FROM skills';
  const params = [];
  if (employeeId) {
    query += ' WHERE employeeId = ?';
    params.push(employeeId);
  }
  query += ' ORDER BY skill ASC';
  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});
app.post('/skills', (req, res) => {
  const { employeeId, skill, level, notes } = req.body;
  db.query(
    'INSERT INTO skills (employeeId, skill, level, notes) VALUES (?, ?, ?, ?)',
    [employeeId, skill, level, notes],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: result.insertId, employeeId, skill, level, notes });
    }
  );
});
app.put('/skills/:id', (req, res) => {
  const { id } = req.params;
  const { employeeId, skill, level, notes } = req.body;
  db.query(
    'UPDATE skills SET employeeId = ?, skill = ?, level = ?, notes = ? WHERE id = ?',
    [employeeId, skill, level, notes, id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id, employeeId, skill, level, notes });
    }
  );
});
app.delete('/skills/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM skills WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Skill deleted', id });
  });
});

// Add this endpoint to return all attendance records
app.get('/attendance', (req, res) => {
  db.query('SELECT * FROM attendance', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.get('/', (req, res) => {
  res.send('Express server is running!');
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
}); 