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
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get Field Averages
exports.getFieldAverages = async (req, res) => {
    const userId = req.user.id;
    const fieldId = parseInt(req.params.fieldId, 10);

    if (isNaN(fieldId)) {
        console.error('Invalid fieldId provided:', req.params.fieldId);
        return res.status(400).json({ error: 'Invalid fieldId provided.' });
    }

    try {
        const result = await db.query(
            `
                SELECT
                    AVG(yd.yield_volume) AS average_yield,
                    AVG(p.profit) AS average_profit
                FROM yield_data yd
                         INNER JOIN profits p ON yd.id = p.yield_data_id
                WHERE yd.user_id = $1 AND yd.field_id = $2;
            `,
            [userId, fieldId]
        );

        if (!result.rows.length) {
            console.warn(`No field averages found for fieldId: ${fieldId}, userId: ${userId}`);
            return res.status(404).json({ error: 'No averages found for the specified field.' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching field averages:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};