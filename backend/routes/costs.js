const express = require('express');
const router = express.Router();
const pool = require('../db');
const authenticateToken = require('../utils/authMiddleware');

// Submit Costs
router.post('/submit', authenticateToken, async (req, res) => {
    const userId = req.user.id; // Retrieve user ID from the decoded JWT token

    const {
        fieldId,
        fertilizer_cost,
        seed_cost,
        maintenance_cost,
        misc_cost,
        crop_price,
    } = req.body;

    // Validate that all required fields are provided
    if (
        !fieldId ||
        fertilizer_cost === undefined ||
        seed_cost === undefined ||
        maintenance_cost === undefined ||
        misc_cost === undefined ||
        crop_price === undefined
    ) {
        return res.status(400).json({ error: 'Please provide all cost fields.' });
    }

    try {
        // Check if the cost entry for the field already exists
        const existingCost = await pool.query(
            `SELECT * FROM costs WHERE field_id = $1 AND user_id = $2`,
            [fieldId, userId]
        );

        if (existingCost.rows.length > 0) {
            // Update the existing cost record
            await pool.query(
                `UPDATE costs
                 SET fertilizer_cost = $1,
                     seed_cost = $2,
                     maintenance_cost = $3,
                     misc_cost = $4,
                     crop_price = $5
                 WHERE field_id = $6 AND user_id = $7`,
                [
                    parseFloat(fertilizer_cost),
                    parseFloat(seed_cost),
                    parseFloat(maintenance_cost),
                    parseFloat(misc_cost),
                    parseFloat(crop_price),
                    fieldId,
                    userId,
                ]
            );
            return res.json({ message: 'Cost data updated successfully.' });
        }

        // Insert a new cost record if no entry exists
        await pool.query(
            `INSERT INTO costs (field_id, user_id, fertilizer_cost, seed_cost, maintenance_cost, misc_cost, crop_price, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
            [
                fieldId,
                userId,
                parseFloat(fertilizer_cost),
                parseFloat(seed_cost),
                parseFloat(maintenance_cost),
                parseFloat(misc_cost),
                parseFloat(crop_price),
            ]
        );

        res.json({ message: 'Cost data submitted successfully.' });
    } catch (err) {
        console.error('Error submitting cost data:', err);
        res.status(500).json({
            error: 'Server error during cost data submission.',
            details: err.message,
        });
    }
});

module.exports = router;