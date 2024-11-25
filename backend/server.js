require('dotenv').config();

const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const moment = require('moment-timezone');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

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
        rejectUnauthorized: false, // Needed for Render
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

// Endpoint to create database tables
app.get('/create-tables', async (req, res) => {
    const createFieldsTable = `
        CREATE TABLE IF NOT EXISTS fields (
                                              id SERIAL PRIMARY KEY,
                                              field_name VARCHAR(255) NOT NULL UNIQUE,
            longitude FLOAT,
            latitude FLOAT
            );
    `;

    const createYieldDataTable = `
        CREATE TABLE IF NOT EXISTS yield_data (
                                                  id SERIAL PRIMARY KEY,
                                                  field_id INT NOT NULL,
                                                  yield_value FLOAT NOT NULL,
                                                  FOREIGN KEY (field_id) REFERENCES fields (id)
            );
    `;

    try {
        const client = await pool.connect();
        await client.query(createFieldsTable);
        await client.query(createYieldDataTable);
        client.release();
        res.send('Tables created successfully');
    } catch (err) {
        console.error('Error creating tables:', err);
        res.status(500).send('Failed to create tables');
    }
});

// File upload route to handle CSV files uploaded by users
app.post('/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const filePath = req.file.path;
    const results = [];

    // Validate the uploaded CSV file structure
    const requiredColumns = ['field_name', 'longitude', 'latitude', 'yield_value'];
    let isValid = true;

    try {
        // Read and validate the CSV file
        await new Promise((resolve, reject) => {
            fs.createReadStream(filePath)
                .pipe(csv())
                .on('headers', (headers) => {
                    // Check if all required columns are present
                    const missingColumns = requiredColumns.filter(column => !headers.includes(column));
                    if (missingColumns.length > 0) {
                        isValid = false;
                        reject(new Error(`Missing required columns: ${missingColumns.join(', ')}`));
                    }
                })
                .on('data', (data) => results.push(data))
                .on('end', resolve)
                .on('error', reject);
        });

        if (!isValid) {
            return res.status(400).send('Invalid CSV format. Please include all required columns.');
        }

        console.log('CSV File Parsed Successfully:', results);

        // Insert parsed data into the database
        const client = await pool.connect();
        try {
            for (const row of results) {
                const { field_name, longitude, latitude, yield_value } = row;

                // Insert into `fields` table or update existing record
                const fieldResult = await client.query(
                    `INSERT INTO fields (field_name, longitude, latitude)
                     VALUES ($1, $2, $3)
                         ON CONFLICT (field_name) 
                     DO UPDATE SET longitude = EXCLUDED.longitude, latitude = EXCLUDED.latitude
                                                     RETURNING id`,
                    [field_name, longitude, latitude]
                );
                const fieldId = fieldResult.rows[0].id;

                // Insert into `yield_data` table with the `field_id`
                await client.query(
                    'INSERT INTO yield_data (field_id, yield_value) VALUES ($1, $2)',
                    [fieldId, yield_value]
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
        console.error('Error handling file:', err);
        res.status(400).send(`Failed to handle uploaded file: ${err.message}`);
    } finally {
        // Remove the temporary file after processing
        fs.unlink(filePath, (err) => {
            if (err) console.error('Error deleting uploaded file:', err);
        });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
