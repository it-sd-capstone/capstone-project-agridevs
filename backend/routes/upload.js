const express = require('express');
const router = express.Router();
const multer = require('multer');
const pool = require('../db');
const authenticateToken = require('../utils/authMiddleware');
const path = require('path');
const csvParser = require('csv-parser');
const fs = require('fs');
const convexHull = require('convex-hull'); // Install this package

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = './uploads';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, 'yield_data_' + Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage: storage });

// Upload yield data CSV file
router.post('/yield-data', authenticateToken, upload.single('file'), async (req, res) => {
    const userId = req.user.id; // Corrected to use req.user.id
    const filePath = req.file.path;
    const fieldName = req.body.field_name || 'Default Field Name';

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
                const latitude = parseFloat(row.Latitude || row.latitude);
                const longitude = parseFloat(row.Longitude || row.longitude);
                const yieldVolume = parseFloat(row['Yld Vol(Dry)(bu/ac)'] || row.yield_volume);

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
                    if (yieldData.length === 0) {
                        fs.unlinkSync(filePath);
                        return res.status(400).json({ error: 'No valid yield data found in the CSV file.' });
                    }

                    // Prepare a bulk insert query
                    const values = [];
                    const placeholders = [];
                    yieldData.forEach((data, index) => {
                        const idx = index * 5;
                        placeholders.push(`($${idx + 1}, $${idx + 2}, $${idx + 3}, $${idx + 4}, $${idx + 5})`);
                        values.push(
                            data.field_id,
                            data.user_id,
                            data.latitude,
                            data.longitude,
                            data.yield_volume
                        );
                    });

                    const queryText = `
                        INSERT INTO yield_data (field_id, user_id, latitude, longitude, yield_volume)
                        VALUES ${placeholders.join(', ')}
                    `;

                    await pool.query(queryText, values);

                    // Compute field boundary using convex hull
                    const points = yieldData.map(data => [data.longitude, data.latitude]);
                    const hullIndices = convexHull(points);

                    const boundaryPoints = hullIndices.map(hull => points[hull[0]]);

                    // Insert boundary points into the database
                    for (let i = 0; i < boundaryPoints.length; i++) {
                        const [longitude, latitude] = boundaryPoints[i];
                        const point_order = i + 1;

                        await pool.query(
                            `
                            INSERT INTO field_boundary (field_id, user_id, latitude, longitude, point_order)
                            VALUES ($1, $2, $3, $4, $5)
                            ON CONFLICT (field_id, point_order) DO UPDATE
                            SET latitude = EXCLUDED.latitude,
                                longitude = EXCLUDED.longitude;
                            `,
                            [fieldId, userId, latitude, longitude, point_order]
                        );
                    }

                    // Delete the uploaded file
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