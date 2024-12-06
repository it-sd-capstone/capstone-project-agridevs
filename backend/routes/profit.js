const express = require('express');
const router = express.Router();
const pool = require('../db');
const authenticateToken = require('../utils/authMiddleware');

// Calculate and insert profit data
router.post('/calculate/:fieldId', authenticateToken, async (req, res) => {
    const { fieldId } = req.params;

    if (!fieldId) {
        return res.status(400).json({ error: 'Field ID is required.' });
    }

    try {
        const yieldDataResult = await pool.query(
            'SELECT id, yield_volume FROM yield_data WHERE field_id = $1',
            [fieldId]
        );

        const yieldData = yieldDataResult.rows;

        if (yieldData.length === 0) {
            return res.status(404).json({ error: 'No yield data found for the specified field.' });
        }

        const costResult = await pool.query(
            'SELECT * FROM costs WHERE field_id = $1',
            [fieldId]
        );

        const costData = costResult.rows[0];

        if (!costData) {
            return res.status(404).json({ error: 'No cost data found for the specified field.' });
        }

        const totalCost =
            parseFloat(costData.fertilizer_cost) +
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

        res.json({ message: 'Profit data calculated successfully.' });
    } catch (err) {
        console.error('Error calculating profit:', err);
        res.status(500).json({ error: 'Server error during profit calculation.' });
    }
});

module.exports = router;