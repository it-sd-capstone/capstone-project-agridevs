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
/*app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));*/

// app.options('/register', cors());

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



app.post('/register', async (req, res) => {
    const { firstname, lastname, username, password, nameoffarm, fieldid } = req.body;

    try {
        // Hash the password before storing it
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user data into the users table
        const query = `
            INSERT INTO users (firstname, lastname, nameoffarm, fieldid, username, password)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `;

        const values = [firstname, lastname, username, hashedPassword, nameoffarm, fieldid];
        console.log(query, values);

        await pool.query(query, values);

        res.status(201).json({ message: 'Account created successfully!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message || 'Something went wrong, please try again later' });
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

app.get('/profile', async (req, res) => {
    const userId = req.userId; // Extract userId from token or session

    try {
        const result = await pool.query('SELECT * FROM users WHERE userId = $1', [userId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching user data:', err);
        res.status(500).json({ error: 'Internal server error' });
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
