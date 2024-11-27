// createTables.js
import pool from './db.js';

const createFieldTable = `
    CREATE TABLE IF NOT EXISTS field (
                                         fieldId SERIAL PRIMARY KEY,
                                         fieldName VARCHAR(50) NOT NULL UNIQUE,
        location VARCHAR(50) NOT NULL,
        area DOUBLE PRECISION NOT NULL
        );
`;

const createUserTable = `
    CREATE TABLE IF NOT EXISTS users (
                                         userId SERIAL PRIMARY KEY,
                                         firstName VARCHAR(25) NOT NULL,
        lastName VARCHAR(50) NOT NULL,
        nameOfFarm VARCHAR(50),
        fieldId INTEGER NOT NULL,
        userName VARCHAR(50) NOT NULL,
        password VARCHAR(100) NOT NULL,
        CONSTRAINT fk_field FOREIGN KEY (fieldId) REFERENCES field(fieldId)
        );
`;

const createCostTable = `
    CREATE TABLE IF NOT EXISTS cost (
                                        costId SERIAL PRIMARY KEY,
                                        rent DOUBLE PRECISION NOT NULL,
                                        seedCost DOUBLE PRECISION NOT NULL,
                                        fertilizerCost DOUBLE PRECISION NOT NULL,
                                        maintenanceCost DOUBLE PRECISION NOT NULL,
                                        miscCost DOUBLE PRECISION NOT NULL,
                                        fieldId INTEGER NOT NULL,
                                        CONSTRAINT fk_field FOREIGN KEY (fieldId) REFERENCES field(fieldId)
        );
`;

const createYieldDataTable = `
    CREATE TABLE IF NOT EXISTS yieldData (
                                             yieldId SERIAL PRIMARY KEY,
                                             yieldData INTEGER NOT NULL,
                                             yieldValue DOUBLE PRECISION NOT NULL,
                                             year INTEGER NOT NULL,
                                             cropType VARCHAR(50) NOT NULL,
        fieldId INTEGER NOT NULL,
        CONSTRAINT fk_field FOREIGN KEY (fieldId) REFERENCES field(fieldId)
        );
`;

const createProfitCalculationTable = `
    CREATE TABLE IF NOT EXISTS profitCalculation (
                                                     profitId SERIAL PRIMARY KEY,
                                                     yieldId INTEGER NOT NULL,
                                                     costId INTEGER NOT NULL,
                                                     commodityValue DOUBLE PRECISION NOT NULL,
                                                     profitValue DOUBLE PRECISION NOT NULL,
                                                     CONSTRAINT fk_yield FOREIGN KEY (yieldId) REFERENCES yieldData(yieldId),
        CONSTRAINT fk_cost FOREIGN KEY (costId) REFERENCES cost(costId)
        );
`;

(async () => {
    try {
        await pool.query(createFieldTable);
        console.log("Successfully created field table");

        await pool.query(createUserTable);
        console.log("Successfully created user table");

        await pool.query(createCostTable);
        console.log("Successfully created cost table");

        await pool.query(createYieldDataTable);
        console.log("Successfully created yieldData table");

        await pool.query(createProfitCalculationTable);
        console.log("Successfully created profitCalculation table");

    } catch (error) {
        console.error('Error creating tables', error);
    } finally {
        await pool.end();
        console.log('Database connection closed.');
    }
})();
