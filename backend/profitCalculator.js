const csvParser = require('csv-parser');
const fs = require('fs');
const db = require('./dbStructure/db');

async function calculateProfit(filePath, cropPrice, costs) {
    // Validate the file path before proceeding
    if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
    }

    console.log('Starting file processing:', filePath);

    // Process the CSV file
    const results = [];
    try {
        await new Promise((resolve, reject) => {
            fs.createReadStream(filePath)
                .pipe(csvParser())
                .on('data', async (row) => {
                    try {
                        // Ensure the required columns exist
                        if (!row['Coordinates'] || !row['Yield']) {
                            console.error('Missing required columns in row:', row);
                            return;
                        }

                        const coordinates = row['Coordinates'];
                        const yieldValue = parseFloat(row['Yield']);
                        const profit = (yieldValue * cropPrice) - costs;

                        // Save to database row-by-row to avoid memory overhead
                        await db.query(
                            'INSERT INTO Profits (coordinates, profit) VALUES ($1, $2)',
                            [coordinates, profit]
                        );

                        console.log(`Row saved: Coordinates=${coordinates}, Profit=${profit}`);
                    } catch (err) {
                        console.error('Error processing row:', row, err);
                    }
                })
                .on('error', (err) => {
                    console.error('Error reading CSV file:', err);
                    reject(err);
                })
                .on('end', () => {
                    console.log('CSV file successfully processed.');
                    resolve();
                });
        });
    } catch (err) {
        console.error('Error during file processing:', err);
        throw err; // Re-throw to ensure calling function is aware
    }

    console.log('All rows processed and saved successfully.');
}

module.exports = {
    calculateProfit,
};