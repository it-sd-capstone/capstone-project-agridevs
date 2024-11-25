import pkg from 'pg';
const { Pool } = pkg;


// Create a new connection pool
const pool = new Pool({
    user: 'profitmap_user',
    host: 'dpg-csm2lcogph6c73abtdm0-a.ohio-postgres.render.com',
    database: 'profitmap',
    password: 'XXYQDyPg8AwCH7C9YDLQrpJ0btH1cfqQ',
    port: 5432,
    ssl: {
        rejectUnauthorized: false,
    },
});

// Function to execute queries
const query = (text, params) => pool.query(text, params);

// Export pool object
export default pool;
