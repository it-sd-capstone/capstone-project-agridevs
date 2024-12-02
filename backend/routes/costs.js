const express = require('express');
const router = express.Router();
const pool = require('../db');
const authenticateToken = require('../middleware/auth');

router.post('/submit', authenticateToken, async (req, res) => {
    const { fieldId, fertilizerCost, seedCost, maintenanceCost, miscCost, cropPrice } = req.body;

    // Validate input
    if (!fieldId || !fertilizerCost || !seedCost || !maintenanceCost || !miscCost || !cropPrice) {
        return res.status(400).json({ error: 'Please provide all cost fields.' });
    }

    const totalCost = parseFloat(fertilizerCost) + parseFloat(seedCost) + parseFloat(maintenanceCost) + parseFloat(miscCost);

    try {
        await pool.query(
            'INSERT INTO costs (field_id, fertilizer_cost, seed_cost, maintenance_cost, misc_cost, crop_price, total_cost, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())',
            [fieldId, fertilizerCost, seedCost, maintenanceCost, miscCost, cropPrice, totalCost]
        );

        res.send('Costs submitted successfully.');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error submitting costs.');
    }
});

module.exports = router;
