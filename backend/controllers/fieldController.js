const db = require('../db');
const csvParser = require('csv-parser'); // Install this package
const fs = require('fs');

exports.getFieldBoundary = async (req, res) => {
    const userId = req.user.id;
    const fieldId = req.params.fieldId;

    try {
        const result = await db.query(
            `
            SELECT latitude, longitude
            FROM field_boundary
            WHERE user_id = $1 AND field_id = $2
            ORDER BY point_order;
            `,
            [userId, fieldId]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching field boundary:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getDataPoints = async (req, res) => {
    const userId = req.user.id;
    const fieldId = req.params.fieldId;

    try {
        const result = await db.query(
            `
                SELECT yd.latitude, yd.longitude, p.profit
                FROM yield_data yd
                         INNER JOIN profits p ON yd.id = p.yield_data_id
                WHERE yd.user_id = $1 AND yd.field_id = $2;
            `,
            [userId, fieldId]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching data points:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getFieldAverages = async (req, res) => {
    const userId = req.user.id;
    const fieldId = req.params.fieldId;

    try {
        const result = await db.query(
            `
                SELECT
                    AVG(yd.yield_volume) AS average_yield,
                    AVG(p.profit) AS average_profit
                FROM
                    yield_data yd
                        INNER JOIN profits p ON yd.id = p.yield_data_id
                WHERE yd.user_id = $1 AND yd.field_id = $2;
            `,
            [userId, fieldId]
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching field averages:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.uploadFieldBoundary = async (req, res) => {
    const userId = req.user.id;
    const fieldId = req.body.fieldId;

    if (!req.files || !req.files.boundaryFile) {
        return res.status(400).json({ error: 'No boundary file uploaded.' });
    }

    const boundaryFile = req.files.boundaryFile;
    const filePath = `./uploads/${boundaryFile.name}`;

    // Save the file temporarily
    await boundaryFile.mv(filePath);

    const boundaryPoints = [];

    try {
        fs.createReadStream(filePath)
            .pipe(csvParser())
            .on('data', (row) => {
                const latitude = parseFloat(row.latitude || row.Latitude);
                const longitude = parseFloat(row.longitude || row.Longitude);
                boundaryPoints.push({ latitude, longitude });
            })
            .on('end', async () => {
                // Insert boundary points into the database
                for (let i = 0; i < boundaryPoints.length; i++) {
                    const { latitude, longitude } = boundaryPoints[i];
                    const point_order = i + 1;

                    await db.query(
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

                // Delete the temporary file
                fs.unlinkSync(filePath);

                res.status(200).json({ message: 'Field boundary data uploaded successfully.' });
            });
    } catch (error) {
        console.error('Error uploading field boundary data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};