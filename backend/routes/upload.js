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
    const fieldName = req.body.field_name || 'Default Field Name';

    console.log('Received request to /upload/yield-data');
    console.log('User ID:', userId);

    try {
        const fieldResult = await pool.query(
            'INSERT INTO fields (user_id, name) VALUES ($1, $2) RETURNING id',
            [userId, fieldName]
        );
        const fieldId = fieldResult.rows[0].id;

        const yieldData = [];
        fs.createReadStream(filePath)
            .pipe(csvParser())
            .on('error', (err) => {
                console.error('Error reading CSV file:', err);
                fs.unlinkSync(filePath);
                res.status(500).json({ error: 'Error reading CSV file.', details: err.message });
            })
            .on('data', (row) => {
                const latitude = parseFloat(row.Latitude || row.latitude);
                const longitude = parseFloat(row.Longitude || row.longitude);
                const yieldVolume = parseFloat(row['Yld Vol(Dry)(bu/ac)']);

                if (!isNaN(latitude) && !isNaN(longitude) && !isNaN(yieldVolume)) {
                    yieldData.push({
                        field_id: fieldId,
                        user_id: userId,
                        latitude: latitude,
                        longitude: longitude,
                        yield_volume: yieldVolume,
                    });
                } else {
                    console.error('Invalid data in CSV row:', row);
                }
            })
            .on('end', async () => {
                try {
                    if (yieldData.length === 0) {
                        fs.unlinkSync(filePath);
                        return res.status(400).json({ error: 'No valid yield data found in the CSV file.' });
                    }

                    const queryText =
                        'INSERT INTO yield_data (field_id, user_id, latitude, longitude, yield_volume) VALUES ' +
                        yieldData.map((_, i) => `($${i * 5 + 1}, $${i * 5 + 2}, $${i * 5 + 3}, $${i * 5 + 4}, $${i * 5 + 5})`).join(', ');

                    const queryValues = yieldData.flatMap((data) => [
                        data.field_id,
                        data.user_id,
                        data.latitude,
                        data.longitude,
                        data.yield_volume,
                    ]);

                    await pool.query(queryText, queryValues);
                    fs.unlinkSync(filePath);

                    res.json({ message: 'Yield data uploaded successfully.', fieldId });
                } catch (err) {
                    console.error('Error inserting yield data into database:', err);
                    fs.unlinkSync(filePath);
                    res.status(500).json({ error: 'Error inserting yield data into database.', details: err.message });
                }
            });
    } catch (err) {
        console.error('Error uploading yield data:', err);
        res.status(500).json({ error: 'Server error during yield data upload.', details: err.message });
    }
});

module.exports = router;