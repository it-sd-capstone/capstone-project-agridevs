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
    const fieldName = req.body.field_name || 'Default Field Name'; // Get the field name from the request

    console.log('Received request to /upload/yield-data');
    console.log('User ID:', userId);

    try {
        // Insert new field record with the provided name
        const fieldResult = await pool.query(
            'INSERT INTO fields (user_id, name) VALUES ($1, $2) RETURNING id',
            [userId, fieldName]
        );

        const fieldId = fieldResult.rows[0].id;

        // Parse CSV file and insert yield data
        const yieldData = [];
        fs.createReadStream(filePath)
            .pipe(csvParser())
            .on('error', (err) => {
                console.error('Error reading CSV file:', err);
                fs.unlinkSync(filePath); // Delete the file if there is an error
                res.status(500).json({ error: 'Error reading CSV file.', details: err.message });
            })
            .on('data', (row) => {
                // Validate and parse data
                const latitude = parseFloat(row.latitude);
                const longitude = parseFloat(row.longitude);
                const yieldVolume = parseFloat(row.yield_volume);

                if (isNaN(latitude) || isNaN(longitude) || isNaN(yieldVolume)) {
                    console.error('Invalid data in CSV row:', row);
                } else {
                    yieldData.push({
                        field_id: fieldId,
                        user_id: userId,
                        latitude: latitude,
                        longitude: longitude,
                        yield_volume: yieldVolume,
                    });
                }
            })
            .on('end', async () => {
                try {
                    // Insert yield data into the database
                    const insertPromises = yieldData.map((data) =>
                        pool.query(
                            'INSERT INTO yield_data (field_id, user_id, latitude, longitude, yield_volume) VALUES ($1, $2, $3, $4, $5)',
                            [data.field_id, data.user_id, data.latitude, data.longitude, data.yield_volume]
                        )
                    );

                    await Promise.all(insertPromises);

                    // Delete the uploaded file
                    fs.unlinkSync(filePath);

                    res.json({ message: 'Yield data uploaded successfully.', fieldId });
                } catch (err) {
                    console.error('Error inserting yield data into database:', err);
                    fs.unlinkSync(filePath);
                    res
                        .status(500)
                        .json({ error: 'Error inserting yield data into database.', details: err.message });
                }
            });
    } catch (err) {
        console.error('Error uploading yield data:', err);
        res
            .status(500)
            .json({ error: 'Server error during yield data upload.', details: err.message });
    }
});

module.exports = router;