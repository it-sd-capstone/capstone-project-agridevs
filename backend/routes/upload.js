const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const pool = require('../db');
const authenticateToken = require('../utils/authMiddleware');

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

router.post('/yield-data', authenticateToken, upload.single('file'), async (req, res) => {
    // Ensure a file was uploaded
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const results = [];

    // Parse CSV file
    fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            try {
                // Get the user ID from the authenticated token
                const userId = req.user.userId;

                // Extract the field name from the first row
                const fieldName = results[0]['Field'] || 'Unknown Field';

                // Check if the field already exists for this user
                let fieldResult = await pool.query(
                    'SELECT id FROM fields WHERE name = $1 AND user_id = $2',
                    [fieldName, userId]
                );

                let fieldId;
                if (fieldResult.rows.length > 0) {
                    fieldId = fieldResult.rows[0].id;
                } else {
                    // Insert new field
                    fieldResult = await pool.query(
                        'INSERT INTO fields (user_id, name, created_at) VALUES ($1, $2, NOW()) RETURNING id',
                        [userId, fieldName]
                    );
                    fieldId = fieldResult.rows[0].id;
                }

                // Prepare the insert statement for yield data
                const insertYieldDataQuery = `
          INSERT INTO yield_data (field_id, longitude, latitude, yield_volume, date, created_at)
          VALUES ($1, $2, $3, $4, $5, NOW())
        `;

                // Iterate over the results and insert data
                for (const row of results) {
                    // Extract and parse data
                    const longitude = parseFloat(row['Longitude']);
                    const latitude = parseFloat(row['Latitude']);
                    const yieldVolume = parseFloat(row['Yld Vol(Dry)(bu/ac)']);
                    const dateStr = row['Date'];
                    const date = new Date(dateStr);

                    // Validate the data
                    if (
                        isNaN(longitude) ||
                        isNaN(latitude) ||
                        isNaN(yieldVolume) ||
                        isNaN(date.getTime())
                    ) {
                        console.warn('Invalid data in row:', row);
                        continue; // Skip invalid rows
                    }

                    // Insert data into yield_data table
                    await pool.query(insertYieldDataQuery, [fieldId, longitude, latitude, yieldVolume, date]);
                }

                res.json({ message: 'Yield data uploaded successfully.', fieldId });
            } catch (err) {
                console.error(err);
                res.status(500).send('Error processing yield data.');
            } finally {
                // Delete the temporary file
                fs.unlink(req.file.path, (err) => {
                    if (err) console.error(err);
                });
            }
        });
});

module.exports = router;
