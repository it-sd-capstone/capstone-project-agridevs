require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const moment = require('moment-timezone');
const fs = require('fs'); // File system module to read files
const path = require('path'); // Path module to resolve file paths
const csv = require('csv-parser'); // CSV parsing module

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

// Endpoint to process CSV files
app.get('/import-csv', async (req, res) => {
    const csvDirectory = 'C:\\Users\\msmit\\capstone-project-agridevs\\ExFarmData'; // Path to your ExFarmData directory
    const files = fs.readdirSync(csvDirectory); // Get all files in ExFarmData directory

    try {
        for (const file of files) {
            if (file.endsWith('.csv')) {
                const filePath = path.join(csvDirectory, file); // Full path to the CSV file
                const results = [];

                // Read and parse CSV file
                await new Promise((resolve, reject) => {
                    fs.createReadStream(filePath)
                        .pipe(csv())
                        .on('data', (data) => results.push(data))
                        .on('end', resolve)
                        .on('error', reject);
                });

                console.log(`Processing file: ${file}`);
                // Here, we insert data into the database
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
                    console.log(`Data inserted for ${file}`);
                } catch (error) {
                    console.error(`Error inserting data from ${file}:`, error);
                } finally {
                    client.release();
                }
            }
        }
        res.send('CSV files processed and data inserted into the database.');
    } catch (error) {
        console.error('Error processing CSV files:', error);
        res.status(500).send('Error processing CSV files.');
    }
});

// Example placeholder for a main route
app.get('/', (req, res) => {
    res.send('Welcome to the Profit Map Web App Backend!');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('Server is shutting down...');
    pool.end().then(() => {
        console.log('Database connections closed');
        process.exit();
    });
});


