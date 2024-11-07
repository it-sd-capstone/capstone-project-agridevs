require('dotenv').config();

const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const moment = require('moment-timezone');

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

// Example placeholder for a main route
app.get('/', (req, res) => {
    res.send('Welcome to the Profit Map Web App Backend!');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});