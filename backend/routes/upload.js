const express = require('express');
const router = express.Router();
const multer = require('multer');
const pool = require('../db');
const authenticateToken = require('../utils/authMiddleware');
const path = require('path');
const csvParser = require('csv-parser');
const fs = require('fs');

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: function (req, file, cb) {
        cb(null, 'yield_data_' + Date.now() + path.extname(file.originalname));
    },
});
const upload = multer({ storage: storage });

// Upload yield data CSV file
router.post('/yield-data', authenticateToken, upload.single('file'), async (req, res) => {
    const userId = req.user.userId;
    const filePath = req.file.path;

    try {
        // Insert new field record
        const fieldResult = await pool.query(
            'INSERT INTO fields (user_id, name) VALUES ($1, $2) RETURNING id',
            [userId, 'New Field']
        );

        const fieldId = fieldResult.rows[0].id;

        // Parse CSV file and insert yield data
        const yieldData = [];
        fs.createReadStream(filePath)
            .pipe(csvParser())
            .on('data', (row) => {
                // Extract necessary fields from the CSV
                if (
                    row['Longitude'] &&
                    row['Latitude'] &&
                    row['Yld Vol(Dry)(bu/ac)']
                ) {
                    yieldData.push({
                        field_id: fieldId,
                        user_id: userId,
                        latitude: parseFloat(row['Latitude']),
                        longitude: parseFloat(row['Longitude']),
                        yield_volume: parseFloat(row['Yld Vol(Dry)(bu/ac)']),
                    });
                }
            })
            .on('end', async () => {
                try {
                    if (yieldData.length === 0) {
                        throw new Error('No valid data found in the CSV file');
                    }

                    // Insert yield data into the database
                    const insertPromises = yieldData.map((data) =>
                        pool.query(
                            'INSERT INTO yield_data (field_id, user_id, latitude, longitude, yield_volume, date) VALUES ($1, $2, $3, $4, $5, NOW())',
                            [data.field_id, data.user_id, data.latitude, data.longitude, data.yield_volume]
                        )
                    );

                    await Promise.all(insertPromises);

                    // Delete the uploaded file
                    fs.unlinkSync(filePath);

                    res.json({ message: 'Yield data uploaded successfully.', fieldId });
                } catch (err) {
                    console.error('Error inserting yield data:', err);
                    res.status(500).json({ error: 'Server error during yield data insertion.' });
                }
            })
            .on('error', (err) => {
                console.error('Error reading CSV file:', err);
                res.status(500).json({ error: 'Error processing CSV file.' });
            });
    } catch (err) {
        console.error('Error uploading yield data:', err);
        res.status(500).json({ error: 'Server error during yield data upload.' });
    }
});

module.exports = router;