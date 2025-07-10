const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const uploadsDir = path.join(__dirname, 'uploads'); // Adjust path if needed

async function main() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'cgbryle', // use your password
    database: 'cgbryle'
  });

  // Get all files in uploads directory
  const files = fs.readdirSync(uploadsDir);

  for (const file of files) {
    const filePath = path.join(uploadsDir, file);
    const stats = fs.statSync(filePath);
    const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(1) + ' MB';

    // Update fileSize for documents with this fileName
    const [rows] = await connection.execute(
      'SELECT id FROM documents WHERE fileName = ?',
      [file]
    );
    if (rows.length > 0) {
      for (const row of rows) {
        await connection.execute(
          'UPDATE documents SET fileSize = ? WHERE id = ?',
          [fileSizeMB, row.id]
        );
        console.log(`Updated document ID ${row.id} with fileSize ${fileSizeMB}`);
      }
    }
  }

  await connection.end();
}

main().catch(console.error); 