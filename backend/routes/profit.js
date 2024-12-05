const express = require('express');
const router = express.Router();
const pool = require('../db');
const authenticateToken = require('../utils/authMiddleware');

// Calculate and insert profit data
router.post('/calculate/:fieldId', authenticateToken, async (req, res) => {
    const { fieldId } = req.params;
    const userId = req.user.id; // Corrected to use req.user.id

    try {
        // Fetch yield data for the specified field
        const yieldDataResult = await pool.query(
            'SELECT id, yield_volume FROM yield_data WHERE field_id = $1 AND user_id = $2',
            [fieldId, userId]
        );

        const yieldData = yieldDataResult.rows;

        if (yieldData.length === 0) {
            return res.status(404).json({ error: 'No yield data found for the specified field.' });
        }

        // Fetch cost data for the specified field
        const costResult = await pool.query(
            'SELECT * FROM costs WHERE field_id = $1 AND user_id = $2',
            [fieldId, userId]
        );

        const costData = costResult.rows[0];

        if (!costData) {
            return res.status(404).json({ error: 'No cost data found for the specified field.' });
        }

        // Calculate total cost
        const totalCost =
            parseFloat(costData.fertilizer_cost) +
            parseFloat(costData.seed_cost) +
            parseFloat(costData.maintenance_cost) +
            parseFloat(costData.misc_cost);

        // Calculate profit for each yield data entry
        const profitInsertPromises = yieldData.map(async (data) => {
            try {
                const revenue = data.yield_volume * parseFloat(costData.crop_price);
                const profit = revenue - totalCost;

                // Insert profit into the profits table
                await pool.query(
                    'INSERT INTO profits (yield_data_id, profit, created_at) VALUES ($1, $2, NOW())',
                    [data.id, profit]
                );
            } catch (err) {
                console.error(`Error inserting profit for yield data ID ${data.id}:`, err);
                throw err; // Rethrow the error to be caught by the outer catch
            }
        });

        // Wait for all insert operations to complete
        await Promise.all(profitInsertPromises);

        res.json({ message: 'Profit data calculated and saved successfully.' });
    } catch (err) {
        console.error('Error calculating profit:', err);
        res.status(500).json({ error: 'Server error during profit calculation.', details: err.message });
    }
});

module.exports = router;