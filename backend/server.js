const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const qrRoutes = require('./routes/qrRoutes');
const requestLogger = require('./middleware/requestLogger');

// Load environment variables from .env file
dotenv.config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for cross-origin frontend connection (React)
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

// Request logger middleware
app.use(requestLogger);

// Main QR Code API routes
app.use('/api/qr', qrRoutes);

// Base route for API health check or welcoming
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to the QR Code Generator Backend API!',
    version: '1.0.0',
    endpoints: {
      getAllQRCodes: 'GET /api/qr',
      createQRCode: 'POST /api/qr',
      deleteQRCode: 'DELETE /api/qr/:id'
    }
  });
});

// 404 Route handler for unrecognized paths
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Resource not found: ${req.method} ${req.url}`
  });
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    message: 'An unexpected error occurred on the server',
    error: process.env.NODE_ENV === 'production' ? null : err.message
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`  QR Code Backend Server is active!`);
  console.log(`  Listening on: http://localhost:${PORT}`);
  console.log(`  API Base:     http://localhost:${PORT}/api/qr`);
  console.log(`=========================================`);
});
