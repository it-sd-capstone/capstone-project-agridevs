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

<<<<<<< HEAD
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

=======
>>>>>>> origin/main
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

<<<<<<< HEAD
// Root endpoint
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

=======
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

    const uploadsDirectory = path.join(__dirname, 'uploads');
    const uploadedFileName = req.file.filename;
    const filePath = path.join(uploadsDirectory, uploadedFileName);

    const results = [];

    try {
        if (!fs.existsSync(uploadsDirectory)) {
            fs.mkdirSync(uploadsDirectory);
        }

        // Move the file to the uploads directory
        fs.renameSync(req.file.path, filePath);

        // Read and parse the CSV file
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
                // Map CSV columns to variables
                const fieldName = row['Field'];
                const location = 'Unknown'; // Provide a default value or adjust as needed
                const area = 0.0; // Provide a default value or calculate if possible
                const yieldValue = parseFloat(row['Yld Mass(Dry)(lb/ac)']);
                const year = new Date(row['Date']).getFullYear();
                const cropType = row['Product'];

                // Validate data
                if (
                    !fieldName ||
                    isNaN(yieldValue) ||
                    !cropType ||
                    isNaN(year)
                ) {
                    console.error('Invalid data in row:', row);
                    continue; // Skip this row
                }

                // Insert into `field` table
                const fieldResult = await client.query(
                    `INSERT INTO field (fieldName, location, area)
                     VALUES ($1, $2, $3)
                         ON CONFLICT (fieldName)
           DO NOTHING
           RETURNING fieldId`,
                    [fieldName, location, area]
                );

                let fieldId;
                if (fieldResult.rows.length > 0) {
                    fieldId = fieldResult.rows[0].fieldid;
                } else {
                    // If the field already exists, retrieve its fieldId
                    const existingField = await client.query(
                        `SELECT fieldId FROM field WHERE fieldName = $1`,
                        [fieldName]
                    );
                    fieldId = existingField.rows[0].fieldid;
                }

                // Insert into `yieldData` table
                await client.query(
                    `INSERT INTO yieldData (yieldData, yieldValue, year, cropType, fieldId)
                     VALUES ($1, $2, $3, $4, $5)`,
                    [0, yieldValue, year, cropType, fieldId]
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
        res.status(500).send('Failed to handle uploaded file');
    } finally {
        // Remove the temporary file after processing
        fs.unlink(filePath, (err) => {
            if (err) console.error('Error deleting uploaded file:', err);
        });
    }
});


// Root endpoint
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

>>>>>>> origin/main
// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});