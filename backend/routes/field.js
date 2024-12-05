const express = require('express');
const router = express.Router();
const authenticateToken = require('../utils/authMiddleware');
const fieldController = require('../controllers/fieldController');

// Get data points with profit
router.get('/:fieldId/data-points', authenticateToken, fieldController.getDataPoints);

// Get field averages
router.get('/:fieldId/averages', authenticateToken, fieldController.getFieldAverages);

module.exports = router;