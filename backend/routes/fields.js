const express = require('express');
const router = express.Router();
const pool = require('../db');
const authenticateToken = require('../utils/authMiddleware');

router.get('/user-fields', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    try {
        const result = await pool.query('SELECT id, name FROM fields WHERE user_id = $1', [userId]);
        res.json({ fields: result.rows });
    } catch (err) {
        console.error('Error fetching user fields:', err);
        res.status(500).json({ error: 'Failed to fetch user fields.' });
    }
});

module.exports = router;