const express = require('express');
const router = express.Router();
const authenticateToken = require('../utils/authMiddleware');
const fieldController = require('../controllers/fieldController');

// Get data points with profit
router.get('/:fieldId/data-points', authenticateToken, fieldController.getDataPoints);

// Get GeoJSON data for map
router.get('/:fieldId/geojson', authenticateToken, fieldController.getGeoJSONData);

module.exports = router;