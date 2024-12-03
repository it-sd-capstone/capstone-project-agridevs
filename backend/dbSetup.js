require('dotenv').config();
const pool = require('./db');

const createTables = async () => {
    try {
        // Drop tables if they exist
        await pool.query('DROP TABLE IF EXISTS profits CASCADE;');
        await pool.query('DROP TABLE IF EXISTS costs CASCADE;');
        await pool.query('DROP TABLE IF EXISTS yield_data CASCADE;');
        await pool.query('DROP TABLE IF EXISTS fields CASCADE;');
        await pool.query('DROP TABLE IF EXISTS users CASCADE;');

        // Create users table
        await pool.query(`
            CREATE TABLE users (
                                   id SERIAL PRIMARY KEY,
                                   username VARCHAR(50) UNIQUE NOT NULL,
                                   email VARCHAR(100) UNIQUE NOT NULL,
                                   password VARCHAR(100) NOT NULL,
                                   created_at TIMESTAMP DEFAULT NOW()
            );
        `);

        // Create fields table
        await pool.query(`
      CREATE TABLE fields (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

// Create yield_data table
        await pool.query(`
            CREATE TABLE yield_data (
                                        id SERIAL PRIMARY KEY,
                                        field_id INTEGER REFERENCES fields(id),
                                        user_id INTEGER REFERENCES users(id),
                                        longitude DOUBLE PRECISION NOT NULL,
                                        latitude DOUBLE PRECISION NOT NULL,
                                        yield_volume DOUBLE PRECISION NOT NULL,
                                        date DATE,
                                        created_at TIMESTAMP DEFAULT NOW()
            );
        `);

        // Create costs table
        await pool.query(`
      CREATE TABLE costs (
        id SERIAL PRIMARY KEY,
        field_id INTEGER REFERENCES fields(id),
        fertilizer_cost DOUBLE PRECISION NOT NULL,
        seed_cost DOUBLE PRECISION NOT NULL,
        maintenance_cost DOUBLE PRECISION NOT NULL,
        misc_cost DOUBLE PRECISION NOT NULL,
        crop_price DOUBLE PRECISION NOT NULL,
        total_cost DOUBLE PRECISION NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

        // Create profits table
        await pool.query(`
      CREATE TABLE profits (
        id SERIAL PRIMARY KEY,
        yield_data_id INTEGER REFERENCES yield_data(id),
        profit DOUBLE PRECISION NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

        console.log('All tables created successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Error creating tables', err);
        process.exit(1);
    }
};

createTables();
