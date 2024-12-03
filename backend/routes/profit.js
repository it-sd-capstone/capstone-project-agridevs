// backend/routes/profit.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const authenticateToken = require('../utils/authMiddleware');

router.get('/geojson', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const result = await pool.query(
            `SELECT ST_AsGeoJSON(geom) as geometry, profit
       FROM your_field_table
       WHERE user_id = $1`,
            [userId]
        );

        const features = result.rows.map((row) => ({
            type: 'Feature',
            geometry: JSON.parse(row.geometry),
            properties: {
                profit: row.profit,
            },
        }));

        const geojson = {
            type: 'FeatureCollection',
            features: features,
        };

        res.json(geojson);
    } catch (err) {
        console.error('Error fetching GeoJSON data:', err);
        res.status(500).json({ error: 'Failed to fetch field data.' });
    }
});

module.exports = router;
