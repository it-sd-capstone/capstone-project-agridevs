const express = require('express');
const router = express.Router();
const pool = require('../db');
const authenticateToken = require('../middleware/auth');

router.get('/calculate/:fieldId', authenticateToken, async (req, res) => {
    const { fieldId } = req.params;

    try {
        // Get costs
        const costResult = await pool.query(
            'SELECT * FROM costs WHERE field_id = $1 ORDER BY created_at DESC LIMIT 1',
            [fieldId]
        );
        const costs = costResult.rows[0];

        // Get yield data
        const yieldResult = await pool.query('SELECT * FROM yield_data WHERE field_id = $1', [fieldId]);
        const yieldData = yieldResult.rows;

        const totalYieldPoints = yieldData.length;
        if (totalYieldPoints === 0) {
            return res.status(400).json({ error: 'No yield data found for this field.' });
        }

        // Calculate profits
        const profits = [];
        for (const data of yieldData) {
            const revenue = data.yield_volume * costs.crop_price;
            const profit = revenue - (costs.total_cost / totalYieldPoints);

            profits.push({
                longitude: data.longitude,
                latitude: data.latitude,
                profit,
            });

            // Insert profit into profits table
            await pool.query(
                'INSERT INTO profits (yield_data_id, profit, created_at) VALUES ($1, $2, NOW())',
                [data.id, profit]
            );
        }

        res.json(profits);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error calculating profits.');
    }
});

module.exports = router;
