const db = require('../db');

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