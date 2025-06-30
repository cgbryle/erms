# Employee and Document Management System (ERMS)

A comprehensive web application for managing employees and their associated documents with real-time status tracking and alerts.

## Features

### Employee Management
- ✅ Add, edit, and delete employees
- ✅ Employee search and filtering by department
- ✅ Employee status tracking (Active, Inactive, On Leave)
- ✅ Emergency contact information
- ✅ Department and position management
- ✅ Employee statistics dashboard

### Document Management
- ✅ Upload and manage employee documents
- ✅ Document type categorization (Contract, ID, Certification, Training, Performance, Other)
- ✅ Expiry date tracking with automatic status updates
- ✅ Document status indicators (Valid, Expiring Soon, Expired)
- ✅ File size and upload date tracking
- ✅ Document search and filtering

### Integrated Features
- ✅ **Employee-Document Connection**: View documents directly from employee profiles
- ✅ **Document Alerts**: Real-time notifications for expiring and expired documents
- ✅ **Document Statistics**: Overview of document status across the organization
- ✅ **Employee Document Summary**: Quick view of document status for each employee
- ✅ **Cross-Navigation**: Easy navigation between employee and document views

## Technology Stack

- **Frontend**: React.js with modern CSS
- **Backend**: Node.js with Express.js
- **Database**: MySQL
- **Icons**: Lucide React
- **Styling**: Custom CSS with responsive design

## Installation and Setup

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### Database Setup
1. Create a MySQL database named `cgbryle`
2. Run the database setup script:
   ```sql
   mysql -u root -p cgbryle < database_setup.sql
   ```

### Backend Setup
1. Navigate to the server directory:
   ```bash
   cd erms-main/server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Update database connection in `index.js`:
   ```javascript
   const db = mysql.createConnection({
     host: 'localhost',
     user: 'your_username',
     password: 'your_password',
     database: 'cgbryle',
   });
   ```

4. Start the server:
   ```bash
   node index.js
   ```
   The server will run on `http://localhost:3001`

### Frontend Setup
1. Navigate to the project root:
   ```bash
   cd erms-main
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```
   The application will run on `http://localhost:3000`

## API Endpoints

### Employee Management
- `GET /employees` - Get all employees
- `POST /employees` - Add new employee
- `PUT /employees/:id` - Update employee
- `DELETE /employees/:id` - Delete employee

### Document Management
- `GET /documents` - Get all documents with employee info
- `GET /employees/:id/documents` - Get documents for specific employee
- `POST /documents` - Upload new document
- `PUT /documents/:id` - Update document
- `DELETE /documents/:id` - Delete document
- `GET /documents/stats` - Get document statistics

## Key Features Explained

### Document Status Tracking
The system automatically calculates document status based on expiry dates:
- **Valid**: Document is not expiring within 30 days
- **Expiring Soon**: Document expires within 30 days
- **Expired**: Document has passed its expiry date

### Employee-Document Integration
- Each employee can have multiple documents
- Documents are automatically linked to employees via foreign key relationships
- When an employee is deleted, all associated documents are also deleted (cascade delete)
- Document status is displayed directly in the employee list for quick overview

### Real-time Alerts
- Expiring and expired documents are highlighted with warning icons
- Document alerts section shows all documents requiring attention
- Color-coded status indicators for easy identification

### Search and Filtering
- Search employees by name, email, or department
- Search documents by employee name, title, or document type
- Filter documents by type and employee
- Filter employees by department

## Database Schema

### Employees Table
- `id` (Primary Key)
- `name`, `email`, `phone`, `address`
- `department`, `position`, `date_hired`, `salary`
- `status` (Active/Inactive/On Leave)
- Emergency contact information
- Timestamps

### Documents Table
- `id` (Primary Key)
- `employeeId` (Foreign Key to employees.id)
- `documentType`, `title`, `fileName`
- `uploadDate`, `expiryDate`, `fileSize`
- `status` (Valid/Expiring Soon/Expired)
- `filePath` (for future file storage implementation)
- Timestamps

## Future Enhancements

- [ ] File upload functionality with cloud storage
- [ ] Document versioning
- [ ] Bulk document operations
- [ ] Email notifications for expiring documents
- [ ] Document approval workflows
- [ ] Advanced reporting and analytics
- [ ] User authentication and role-based access
- [ ] Document templates
- [ ] Mobile responsive design improvements

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.