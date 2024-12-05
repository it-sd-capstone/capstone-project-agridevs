const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../utils/authMiddleware');
const fieldController = require('../controllers/fieldController');

// Get field boundary
router.get('/:fieldId/boundary', authenticateToken, fieldController.getFieldBoundary);

// Get data points with profit
router.get('/:fieldId/data-points', authenticateToken, fieldController.getDataPoints);

// Get field averages
router.get('/:fieldId/averages', authenticateToken, fieldController.getFieldAverages);

// Upload field boundary data
router.post('/boundary', authenticateToken, fieldController.uploadFieldBoundary);

module.exports = router;