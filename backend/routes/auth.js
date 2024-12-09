const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');

// Register User
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    // Basic validation
    if (!username || !email || !password) {
        return res.status(400).json({ error: 'Please enter all fields.' });
    }

    try {
        // Check if user exists
        const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ error: 'User already exists.' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user into database
        const newUser = await pool.query(
            'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email',
            [username, email, hashedPassword]
        );

        // Create JWT token
        const token = jwt.sign({ userId: newUser.rows[0].id }, process.env.JWT_SECRET, {
            expiresIn: '24h',
        });

        res.json({ token, user: { id: newUser.id, username: newUser.username, email: newUser.email } });
    } catch (err) {
        console.error('Error during registration:', err);
        res.status(500).json({ error: 'Server error during registration.', details: err.message });
    }
});

// Login User
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
        return res.status(400).json({ error: 'Please enter all fields.' });
    }

    try {
        // Check if user exists
        const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userResult.rows.length === 0) {
            return res.status(400).json({ error: 'User does not exist.' });
        }

        const user = userResult.rows[0];

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials.' });
        }

        // Create JWT token
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
            expiresIn: '24h',
        });

        res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({ error: 'Server error during login.', details: err.message });
    }
});

module.exports = router;