require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();
const authRoutes = require('./routes/auth');
const uploadRoutes = require('./routes/upload');
const costRoutes = require('./routes/costs');
const profitRoutes = require('./routes/profit');
const fieldRoutes = require('./routes/field');

const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

app.use(
    cors({
        origin: 'https://capstone-project-agridevs.onrender.com',
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization'],
    })
);

// Routes
app.use('/auth', authRoutes);
app.use('/upload', uploadRoutes);
app.use('/costs', costRoutes);
app.use('/profit', profitRoutes);
app.use('/field', fieldRoutes);

// Serve frontend
app.use(express.static(path.join(__dirname, 'build')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});