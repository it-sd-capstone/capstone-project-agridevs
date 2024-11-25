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
const {router} = require("express/lib/application.js");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

// Setup PostgreSQL connection using DATABASE_URL from environment variables
const connectionString =
    process.env.DATABASE_URL ||
    `postgresql://profitmap_user:XXYQDyPg8AwCH7C9YDLQrpJ0btH1cfqQ@dpg-csm2lcogph6c73abtdm0-a:5432/profitmap`;

const pool = new Pool({
    connectionString,
    ssl: {
        rejectUnauthorized: false, // Need for Render
    },
});

const upload = multer({ dest: 'uploads/' });

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

router.post('/register', async (req, res) => {
    const { userName, password, firstName, lastName, nameOfFarm, fieldId } = req.body;

    try {
        // Hash the password before storing it
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user data into the users table
        const query = `
            INSERT INTO users (firstName, lastName, nameOfFarm, fieldId, userName, password)
            VALUES ($1, $2, $3, $4, $5, $6)
        `;
        const values = [firstName, lastName, nameOfFarm, fieldId, userName, hashedPassword];

        await pool.query(query, values);

        res.status(201).json({ message: 'Account created successfully!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Something went wrong, please try again later' });
    }
});

module.exports = router;

// File upload route to handle CSV files uploaded by users
app.post('/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const filePath = req.file.path;
    const results = [];

    // Read and parse the uploaded CSV file
    try {
        await new Promise((resolve, reject) => {
            fs.createReadStream(filePath)
                .pipe(csv())
                .on('data', (data) => results.push(data))
                .on('end', resolve)
                .on('error', reject);
        });

        console.log('CSV File Parsed Successfully:', results);

        // Insert parsed data into the database
        const client = await pool.connect();
        try {
            for (const row of results) {
                const { field_name, yield_data } = row;
                await client.query(
                    'INSERT INTO fields (field_name) VALUES ($1) ON CONFLICT (field_name) DO NOTHING',
                    [field_name]
                );
                await client.query(
                    'INSERT INTO yield_data (field_name, yield_data) VALUES ($1, $2)',
                    [field_name, yield_data]
                );
            }
            res.send('CSV file uploaded and data inserted successfully');
        } catch (error) {
            console.error('Error inserting data:', error);
            res.status(500).send('Error inserting data into the database');
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('Error reading CSV file:', err);
        res.status(500).send('Failed to read and parse CSV file');
    } finally {
        // Remove the temporary file after processing
        fs.unlink(filePath, (err) => {
            if (err) console.error('Error deleting uploaded file:', err);
        });
    }
});

