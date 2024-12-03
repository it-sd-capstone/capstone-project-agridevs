const express = require('express');
const router = express.Router();
const pool = require('../db');
const authenticateToken = require('../utils/authMiddleware');

// Calculate profit and return GeoJSON data
router.get('/calculate/:fieldId', authenticateToken, async (req, res) => {
    const { fieldId } = req.params;
    const userId = req.user.userId;

    try {
        // Fetch yield data for the field
        const yieldDataResult = await pool.query(
            'SELECT * FROM yield_data WHERE field_id = $1 AND user_id = $2',
            [fieldId, userId]
        );

        const yieldData = yieldDataResult.rows;

        // Fetch cost data for the field
        const costDataResult = await pool.query(
            'SELECT * FROM costs WHERE field_id = $1',
            [fieldId]
        );

        const costData = costDataResult.rows[0];

        if (!costData) {
            return res.status(400).json({ error: 'Cost data not found for this field.' });
        }

        // Calculate profit for each yield data point
        const profitData = yieldData.map((dataPoint) => {
            const profit =
                (dataPoint.yield_volume * costData.crop_price) -
                (costData.fertilizer_cost +
                    costData.seed_cost +
                    costData.maintenance_cost +
                    costData.misc_cost);

            return {
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [dataPoint.longitude, dataPoint.latitude],
                },
                properties: {
                    profit: profit,
                },
            };
        });

        const geojson = {
            type: 'FeatureCollection',
            features: profitData,
        };

        res.json(geojson);
    } catch (err) {
        console.error('Error calculating profit:', err);
        res.status(500).json({ error: 'Server error during profit calculation.' });
    }
});

module.exports = router;