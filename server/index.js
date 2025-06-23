const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();
const port = 3001;

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

// Get all employees
app.get('/employees', (req, res) => {
  db.query('SELECT * FROM employees', (err, results) => {
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

// Update an employee
app.put('/employees/:id', (req, res) => {
  const { id } = req.params;
  const { name, email, position, date_hired } = req.body;
  db.query(
    'UPDATE employees SET name = ?, email = ?, position = ?, date_hired = ? WHERE id = ?',
    [name, email, position, date_hired, id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id, name, email, position, date_hired });
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

app.get('/', (req, res) => {
  res.send('Express server is running!');
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
}); 