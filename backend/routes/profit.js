const express = require('express');
const router = express.Router();
const pool = require('../db');
const authenticateToken = require('../utils/authMiddleware');

// Calculate and insert profit data
router.post('/calculate/:fieldId', authenticateToken, async (req, res) => {
    const { fieldId } = req.params;
    const userId = req.user.userId;

    try {
        // Fetch yield data for the specified field
        const yieldDataResult = await pool.query(
            'SELECT id, yield_volume FROM yield_data WHERE field_id = $1',
            [fieldId]
        );

        const yieldData = yieldDataResult.rows;

        if (yieldData.length === 0) {
            throw new Error('No yield data found for the specified field');
        }

        // Fetch cost data for the specified field
        const costResult = await pool.query(
            'SELECT * FROM costs WHERE field_id = $1',
            [fieldId]
        );

        const costData = costResult.rows[0];

        if (!costData) {
            throw new Error('No cost data found for the specified field');
        }

        // Calculate profit for each yield data entry
        const profitInsertPromises = yieldData.map(async (data) => {
            const revenue = data.yield_volume * costData.crop_price;
            const totalCost = costData.fertilizer_cost + costData.seed_cost +
                costData.maintenance_cost + costData.misc_cost;
            const profit = revenue - totalCost;

            // Insert profit into the profits table
            await pool.query(
                'INSERT INTO profits (yield_data_id, profit, created_at) VALUES ($1, $2, NOW())',
                [data.id, profit]
            );
        });

        // Wait for all insert operations to complete
        await Promise.all(profitInsertPromises);

        res.json({ message: 'Profit data calculated and saved successfully.' });
    } catch (err) {
        console.error('Error calculating profit:', err);
        res.status(500).json({ error: 'Server error during profit calculation.' });
    }
});

module.exports = router;
