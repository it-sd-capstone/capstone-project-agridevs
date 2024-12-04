const express = require('express');
const router = express.Router();
const pool = require('../db');
const authenticateToken = require('../utils/authMiddleware');

// Calculate profit for a specific field and insert into profits table
router.post('/calculate-profit', authenticateToken, async (req, res) => {
    try {
        const { fieldId } = req.body;

        // Get all yield data for the specified field
        const yieldDataResult = await pool.query('SELECT * FROM yield_data WHERE field_id = $1', [fieldId]);
        const yieldData = yieldDataResult.rows;

        // Get the cost data for the specified field
        const costDataResult = await pool.query('SELECT * FROM costs WHERE field_id = $1', [fieldId]);
        const costData = costDataResult.rows[0];

        if (!yieldData.length || !costData) {
            throw new Error('No data found for profit calculation.');
        }

        const totalCost = costData.total_cost;
        const cropPrice = costData.crop_price;

        // Calculate profit for each yield data entry
        const profitResults = yieldData.map(yieldEntry => {
            const revenue = yieldEntry.yield_volume * cropPrice;
            const profit = revenue - totalCost;

            return {
                field_id: fieldId,
                yield_data_id: yieldEntry.id,
                profit
            };
        });

        // Insert calculated profits into the `profits` table
        const insertPromises = profitResults.map(profitData =>
            pool.query(
                'INSERT INTO profits (field_id, yield_data_id, profit, created_at) VALUES ($1, $2, $3, NOW())',
                [profitData.field_id, profitData.yield_data_id, profitData.profit]
            )
        );

        await Promise.all(insertPromises);

        res.status(200).json({ message: 'Profit calculated and saved successfully.' });
    } catch (err) {
        console.error('Error calculating profit:', err);
        res.status(500).json({ error: 'Error calculating profit.' });
    }
});

module.exports = router;
