const express = require('express');
const router = express.Router();
const pool = require('../db');
const authenticateToken = require('../utils/authMiddleware');

// Submit Costs
router.post('/submit', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    const {
        fieldId,
        fertilizer_cost,
        seed_cost,
        maintenance_cost,
        misc_cost,
        crop_price,
    } = req.body;

    // Basic validation
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
        // Insert cost data into database
        await pool.query(
            `INSERT INTO costs (field_id, user_id, fertilizer_cost, seed_cost, maintenance_cost, misc_cost, crop_price)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
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
        res.status(500).json({ error: 'Server error during cost data submission.', details: err.message });
    }
});

module.exports = router;