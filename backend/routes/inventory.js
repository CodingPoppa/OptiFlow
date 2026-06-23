// backend/routes/inventory.js
const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');

// Route to get stock aging report for a specific branch
router.get('/:branchId/aging', inventoryController.getStockAgingReport);

module.exports = router;
