const express = require('express');
const router = express.Router();
const pool = require('../db');
const authenticateToken = require('../utils/authMiddleware');

// Calculate and insert profit data (unchanged from previous logic)
router.post('/calculate/:fieldId', authenticateToken, async (req, res) => {
    const { fieldId } = req.params;
    const userId = req.user.userId;

    try {
        const yieldDataResult = await pool.query(
            'SELECT id, yield_volume FROM yield_data WHERE field_id = $1 AND user_id = $2',
            [fieldId, userId]
        );

        const yieldData = yieldDataResult.rows;
        if (yieldData.length === 0) {
            return res.status(404).json({ error: 'No yield data found for the specified field.' });
        }

        const costResult = await pool.query(
            'SELECT * FROM costs WHERE field_id = $1 AND user_id = $2',
            [fieldId, userId]
        );

        const costData = costResult.rows[0];
        if (!costData) {
            return res.status(404).json({ error: 'No cost data found for the specified field.' });
        }

        const totalCost = parseFloat(costData.fertilizer_cost) +
            parseFloat(costData.seed_cost) +
            parseFloat(costData.maintenance_cost) +
            parseFloat(costData.misc_cost);

        const profitInsertPromises = yieldData.map(async (data) => {
            const revenue = data.yield_volume * parseFloat(costData.crop_price);
            const profit = revenue - totalCost;
            await pool.query(
                'INSERT INTO profits (yield_data_id, profit, created_at) VALUES ($1, $2, NOW())',
                [data.id, profit]
            );
        });

        await Promise.all(profitInsertPromises);

        res.json({ message: 'Profit data calculated and saved successfully.' });
    } catch (err) {
        console.error('Error calculating profit:', err);
        res.status(500).json({ error: 'Server error during profit calculation.', details: err.message });
    }
});

// Get GeoJSON data for the map, with optional fieldId
router.get('/geojson/:fieldId?', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    const { fieldId } = req.params;

    try {
        let query;
        let values;
        let avgProfit = null;
        let title = 'Your Farm';

        if (fieldId) {
            // Specific field
            query = `
                SELECT yd.latitude, yd.longitude, p.profit, f.name AS field_name
                FROM yield_data yd
                         INNER JOIN profits p ON yd.id = p.yield_data_id
                         INNER JOIN fields f ON yd.field_id = f.id
                WHERE yd.user_id = $1 AND yd.field_id = $2
            `;
            values = [userId, fieldId];

            const avgResult = await pool.query(`
                SELECT AVG(p.profit) as avg_profit, f.name as field_name
                FROM profits p
                         JOIN yield_data yd ON p.yield_data_id = yd.id
                         JOIN fields f ON yd.field_id = f.id
                WHERE yd.field_id = $1 AND yd.user_id = $2
            `, [fieldId, userId]);

            avgProfit = parseFloat(avgResult.rows[0].avg_profit);
            title = avgResult.rows[0].field_name;
        } else {
            // Entire farm
            query = `
                SELECT yd.latitude, yd.longitude, p.profit, f.name AS field_name
                FROM yield_data yd
                         INNER JOIN profits p ON yd.id = p.yield_data_id
                         INNER JOIN fields f ON yd.field_id = f.id
                WHERE yd.user_id = $1
            `;
            values = [userId];

            const avgResult = await pool.query(`
                SELECT AVG(p.profit) as avg_profit
                FROM profits p
                         JOIN yield_data yd ON p.yield_data_id = yd.id
                WHERE yd.user_id = $1
            `, [userId]);

            avgProfit = parseFloat(avgResult.rows[0].avg_profit);
        }

        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'No profit data found.' });
        }

        const features = result.rows.map((row) => ({
            type: 'Feature',
            properties: {
                profit: parseFloat(row.profit),
                fieldName: row.field_name || 'Your Farm',
            },
            geometry: {
                type: 'Point',
                coordinates: [parseFloat(row.longitude), parseFloat(row.latitude)],
            },
        }));

        const geojson = {
            type: 'FeatureCollection',
            features: features,
            avgProfit,
            title
        };

        res.json(geojson);
    } catch (err) {
        console.error('Error fetching GeoJSON data:', err);
        res.status(500).json({ error: 'Failed to fetch GeoJSON data.', details: err.message });
    }
});

module.exports = router;