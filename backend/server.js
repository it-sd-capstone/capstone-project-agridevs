// Import required dependencies
require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bodyParser = require('body-parser');
const moment = require('moment-timezone');

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware setup
app.use(express.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

// Setup PostgreSQL connection using DATABASE_URL from environment variables
const connectionString =
    process.env.DATABASE_URL ||
    `postgresql://username:password@host:port/database_name`;

const pool = new Pool({
    connectionString,
    ssl: {
        rejectUnauthorized: false, // Necessary for Render deployment
    },
});

// Test DB connection route
app.get('/test-db', async (req, res) => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT NOW()');
        client.release();

        // Format the time for Central Time Zone (optional)
        const centralTime = moment(result.rows[0].now).tz('America/Chicago').format('YYYY-MM-DD HH:mm:ss');
        res.send(`Database is connected. Central Time: ${centralTime}`);
    } catch (err) {
        console.error('Database connection failed', err);
        res.status(500).send('Database connection failed');
    }
});

// Calculate profit route
app.post('/calculate-profit', async (req, res) => {
    const { fieldId, cropPrice, costPerUnit } = req.body;

    try {
        const client = await pool.connect();

        // Query to retrieve yield data for the specified field
        const yieldDataQuery = `
            SELECT yield_value 
            FROM yield_data 
            WHERE field_id = $1
        `;
        const yieldDataResult = await client.query(yieldDataQuery, [fieldId]);

        if (yieldDataResult.rows.length === 0) {
            res.status(404).json({ error: 'No yield data found for the given field ID' });
            return;
        }

        // Calculate profit for each yield entry
        const profits = yieldDataResult.rows.map((row) => {
            const yieldValue = row.yield_value;
            const profit = (yieldValue * cropPrice) - costPerUnit;
            return { yieldValue, profit };
        });

        // Insert profit results into the database
        const insertProfitQuery = `
            INSERT INTO profits (field_id, yield_value, profit)
            VALUES ($1, $2, $3)
        `;

        for (const profitEntry of profits) {
            await client.query(insertProfitQuery, [
                fieldId,
                profitEntry.yieldValue,
                profitEntry.profit,
            ]);
        }

        client.release();
        res.status(201).json({ message: 'Profit calculated and saved successfully', profits });
    } catch (err) {
        console.error('Error calculating profit:', err);
        res.status(500).json({ error: 'Failed to calculate profit' });
    }
});

// Handle all other routes (optional)
app.get('*', (req, res) => {
    res.send('Welcome to the Profit Calculator API!');
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
