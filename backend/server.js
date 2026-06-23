// backend/server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// Initializing the Express app
const app = express();

// Security and Logging Middleware
app.use(helmet()); // Sets various HTTP headers to help protect your app
app.use(cors()); // Enables Cross-Origin Resource Sharing
app.use(express.json()); // Parses incoming JSON requests
app.use(morgan('dev')); // HTTP request logger

// Basic Route for Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Optical ERP Backend is running smoothly.' });
});

// Import Routes
const billingRoutes = require('./routes/billing');
const inventoryRoutes = require('./routes/inventory');
const labRoutes = require('./routes/lab');

// Mount Routes
app.use('/api/billing', billingRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/lab', labRoutes);

// Global Error Handler to prevent sensitive database info from leaking
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Internal Server Error. Please contact support.',
    // Only send the exact error message in development mode
    ...(process.env.NODE_ENV === 'development' && { error: err.message })
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(\`Server is running on port \${PORT}\`);
});
