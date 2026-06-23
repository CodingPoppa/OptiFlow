// backend/routes/lab.js
const express = require('express');
const router = express.Router();
const labController = require('../controllers/labController');

// Route to update a lab order's status
router.patch('/:id/status', labController.updateLabOrderStatus);

module.exports = router;
