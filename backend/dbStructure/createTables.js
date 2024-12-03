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

const alterFieldTable = `
    ALTER TABLE  field 
        ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
        ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
    
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

const alterUsersTable = `
    ALTER TABLE users ALTER COLUMN fieldId DROP NOT NULL;
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

const alterYieldDataTable = `
ALTER TABLE yieldData 
    DROP COLUMN IF EXISTS yieldData;

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

const dropExtraProfitCalculationTable = `
    DROP TABLE IF EXISTS profitcalculation;
`;

const dropExtraYieldDataTable = `
    DROP TABLE IF EXISTS yielddata;
`;

(async () => {
    try {
        await pool.query(createFieldTable);
        console.log("Successfully created field table");

        await pool.query(alterFieldTable);
        console.log('field table altered successfully.');

        await pool.query(createUserTable);
        console.log("Successfully created user table");

        await pool.query(alterUsersTable);
        console.log("Successfully altered user table");

        await pool.query(createCostTable);
        console.log("Successfully created cost table");

        await pool.query(createYieldDataTable);
        console.log("Successfully created yieldData table");

        await pool.query(alterYieldDataTable);
        console.log('yieldData table altered successfully.');

        await pool.query(createProfitCalculationTable);
        console.log("Successfully created profitCalculation table");

        await pool.query(dropExtraProfitCalculationTable);
        console.log("Successfully dropped extra profitcalculation table");

        await pool.query(dropExtraYieldDataTable);
        console.log("Successfully dropped extra yieldData table");


    } catch (error) {
        console.error('Error creating or altering tables', error);
    } finally {
        await pool.end();
        console.log('Database connection closed.');
    }
})();
