-- ERMS Database Setup Script
-- This script creates the necessary tables for the Employee and Document Management System

-- Create employees table (if not exists)
CREATE TABLE IF NOT EXISTS employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    department VARCHAR(100),
    position VARCHAR(100),
    date_hired DATE,
    salary DECIMAL(10,2),
    status ENUM('Active', 'Inactive', 'On Leave') DEFAULT 'Active',
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(50),
    emergency_contact_relationship VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employeeId INT NOT NULL,
    documentType VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    fileName VARCHAR(255),
    uploadDate DATE NOT NULL,
    expiryDate DATE,
    fileSize VARCHAR(50),
    status ENUM('Valid', 'Expiring Soon', 'Expired') DEFAULT 'Valid',
    filePath VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE
);

-- Attendance table
CREATE TABLE IF NOT EXISTS attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employeeId INT NOT NULL,
    date DATE NOT NULL,
    clockIn TIME,
    clockOut TIME,
    status ENUM('Present', 'Absent') DEFAULT 'Present',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE,
    UNIQUE KEY unique_attendance (employeeId, date)
);

-- Leave requests table
CREATE TABLE IF NOT EXISTS leave_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employeeId INT NOT NULL,
    type ENUM('Vacation', 'Sick', 'Personal', 'Other') NOT NULL,
    startDate DATE NOT NULL,
    endDate DATE NOT NULL,
    reason TEXT,
    status ENUM('Pending', 'Approved', 'Denied') DEFAULT 'Pending',
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE
);

-- Table for performance reviews
CREATE TABLE IF NOT EXISTS performance_reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employeeId INT NOT NULL,
  reviewer VARCHAR(100) NOT NULL,
  reviewDate DATE NOT NULL,
  rating INT NOT NULL,
  comments TEXT,
  FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE
);

-- Table for trainings
CREATE TABLE IF NOT EXISTS trainings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employeeId INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  provider VARCHAR(255),
  date DATE NOT NULL,
  status ENUM('Completed', 'In Progress', 'Planned') DEFAULT 'Planned',
  notes TEXT,
  FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_training_employeeId ON trainings(employeeId);

-- Table for certifications
CREATE TABLE IF NOT EXISTS certifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employeeId INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  issuedBy VARCHAR(255),
  issueDate DATE NOT NULL,
  expiryDate DATE,
  notes TEXT,
  FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_cert_employeeId ON certifications(employeeId);

-- Table for skills
CREATE TABLE IF NOT EXISTS skills (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employeeId INT NOT NULL,
  skill VARCHAR(255) NOT NULL,
  level ENUM('Beginner', 'Intermediate', 'Advanced', 'Expert') DEFAULT 'Beginner',
  notes TEXT,
  FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_skill_employeeId ON skills(employeeId);

-- Create users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employeeId INT NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('employee', 'admin') DEFAULT 'employee',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_employee_department ON employees(department);
CREATE INDEX idx_employee_status ON employees(status);
CREATE INDEX idx_document_employee ON documents(employeeId);
CREATE INDEX idx_document_type ON documents(documentType);
CREATE INDEX idx_document_status ON documents(status);
CREATE INDEX idx_document_expiry ON documents(expiryDate);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_department ON employees(department);
CREATE INDEX IF NOT EXISTS idx_employeeId_documents ON documents(employeeId);
CREATE INDEX IF NOT EXISTS idx_employeeId_date_attendance ON attendance(employeeId, date);
CREATE INDEX IF NOT EXISTS idx_performance_employeeId ON performance_reviews(employeeId);

-- Insert sample employees (optional)
INSERT INTO employees (name, email, phone, department, position, date_hired, salary, status) VALUES
('John Doe', 'john.doe@company.com', '+1-555-0101', 'Engineering', 'Software Engineer', '2022-01-15', 75000.00, 'Active'),
('Jane Smith', 'jane.smith@company.com', '+1-555-0102', 'Marketing', 'Marketing Manager', '2021-03-20', 65000.00, 'Active'),
('Mike Johnson', 'mike.johnson@company.com', '+1-555-0103', 'Sales', 'Sales Representative', '2023-03-10', 55000.00, 'Active'),
('Sarah Wilson', 'sarah.wilson@company.com', '+1-555-0104', 'HR', 'HR Specialist', '2022-06-01', 60000.00, 'Active'),
('David Brown', 'david.brown@company.com', '+1-555-0105', 'Finance', 'Financial Analyst', '2021-09-15', 70000.00, 'Active')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Insert sample documents (optional)
INSERT INTO documents (employeeId, documentType, title, fileName, uploadDate, expiryDate, fileSize, status) VALUES
(1, 'Contract', 'Employment Contract', 'contract_john_doe.pdf', '2022-01-15', '2025-01-15', '2.5 MB', 'Valid'),
(1, 'ID', 'Driver License', 'license_john_doe.pdf', '2022-01-15', '2024-06-15', '1.2 MB', 'Expiring Soon'),
(2, 'Certification', 'Project Management Certification', 'pmp_cert_jane_smith.pdf', '2023-03-20', '2026-03-20', '3.1 MB', 'Valid'),
(3, 'Contract', 'Employment Contract', 'contract_mike_johnson.pdf', '2023-03-10', '2024-03-10', '2.8 MB', 'Expired'),
(4, 'Training', 'HR Compliance Training', 'hr_training_sarah_wilson.pdf', '2023-01-10', '2025-01-10', '1.5 MB', 'Valid'),
(5, 'Performance', 'Annual Performance Review', 'performance_david_brown_2023.pdf', '2023-12-01', NULL, '0.8 MB', 'Valid')
ON DUPLICATE KEY UPDATE title = VALUES(title);

-- Create a view for employee document summary
CREATE OR REPLACE VIEW employee_document_summary AS
SELECT 
    e.id as employeeId,
    e.name as employeeName,
    e.department,
    COUNT(d.id) as totalDocuments,
    SUM(CASE WHEN d.status = 'Valid' THEN 1 ELSE 0 END) as validDocuments,
    SUM(CASE WHEN d.status = 'Expiring Soon' THEN 1 ELSE 0 END) as expiringSoon,
    SUM(CASE WHEN d.status = 'Expired' THEN 1 ELSE 0 END) as expiredDocuments
FROM employees e
LEFT JOIN documents d ON e.id = d.employeeId
GROUP BY e.id, e.name, e.department;

-- Create a view for document alerts
CREATE OR REPLACE VIEW document_alerts AS
SELECT 
    d.id,
    d.employeeId,
    e.name as employeeName,
    d.title,
    d.documentType,
    d.expiryDate,
    d.status,
    DATEDIFF(d.expiryDate, CURDATE()) as daysUntilExpiry
FROM documents d
JOIN employees e ON d.employeeId = e.id
WHERE d.expiryDate IS NOT NULL 
AND (d.status = 'Expiring Soon' OR d.status = 'Expired')
ORDER BY d.expiryDate ASC; 