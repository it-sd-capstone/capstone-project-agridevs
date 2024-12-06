const db = require('../db');

// Get Data Points for a Field
exports.getDataPoints = async (req, res) => {
    const userId = req.user.id;
    const fieldId = parseInt(req.params.fieldId, 10);

    if (isNaN(fieldId)) {
        console.error('Invalid fieldId provided:', req.params.fieldId);
        return res.status(400).json({ error: 'Invalid fieldId provided.' });
    }

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

        if (result.rows.length === 0) {
            console.warn(`No data points found for fieldId: ${fieldId}, userId: ${userId}`);
            return res.status(404).json({ error: 'No data points found for the specified field.' });
        }

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching data points:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

// Fetch GeoJSON Data for Map
exports.getGeoJSONData = async (req, res) => {
    const userId = req.user.id;
    const fieldId = parseInt(req.params.fieldId, 10);

    if (isNaN(fieldId)) {
        console.error('Invalid fieldId provided:', req.params.fieldId);
        return res.status(400).json({ error: 'Invalid fieldId provided.' });
    }

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

        if (result.rows.length === 0) {
            console.warn(`No GeoJSON data found for fieldId: ${fieldId}, userId: ${userId}`);
            return res.status(404).json({ error: 'No GeoJSON data found for the specified field.' });
        }

        const features = result.rows.map((row) => ({
            type: 'Feature',
            properties: { profit: parseFloat(row.profit) },
            geometry: {
                type: 'Point',
                coordinates: [parseFloat(row.longitude), parseFloat(row.latitude)],
            },
        }));

        res.json({
            type: 'FeatureCollection',
            features,
        });
    } catch (error) {
        console.error('Error fetching GeoJSON data:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};