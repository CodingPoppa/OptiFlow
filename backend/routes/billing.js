// backend/routes/billing.js
const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billingController');

// Route to create a new POS sale
router.post('/sale', billingController.createSale);

module.exports = router;
