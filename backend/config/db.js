const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'myqrcode_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test the connection
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('MySQL connected');
    connection.release();
  } catch (error) {
    console.error('Error connecting to MySQL database:');
    console.error(`- Error Code: ${error.code}`);
    console.error(`- Message: ${error.message}`);
    console.warn('\nTip: Make sure MySQL is running and the database "qrcode_db" exists.');
    console.warn('You can create it by running: CREATE DATABASE qrcode_db;\n');
  }
})();

module.exports = pool;
