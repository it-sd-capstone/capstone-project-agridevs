require('dotenv').config();

const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const moment = require('moment-timezone');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const bcrypt = require('bcrypt');
const router = express.Router();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(router);
app.use(cors());

// Setup PostgreSQL connection using DATABASE_URL from environment variables
const connectionString =
    process.env.DATABASE_URL ||
    `postgresql://profitmap_user:XXYQDyPg8AwCH7C9YDLQrpJ0btH1cfqQ@dpg-csm2lcogph6c73abtdm0-a:5432/profitmap`;

const pool = new Pool({
    connectionString,
    ssl: {
        rejectUnauthorized: false, // Needed for Render
    },
});

const upload = multer({ dest: 'uploads/' });

app.use(express.static(path.join(__dirname, 'build')));

// NEW: Profit calculation function
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

// Test connection to the database
app.get('/test-db', async (req, res) => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT NOW()');
        client.release();

        const centralTime = moment(result.rows[0].now).tz('America/Chicago').format('YYYY-MM-DD HH:mm:ss');
        res.send(`Database is connected. Central Time: ${centralTime}`);
    } catch (err) {
        console.error(err);
        res.status(500).send('Database connection failed');
    }
});

// Root endpoint
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});