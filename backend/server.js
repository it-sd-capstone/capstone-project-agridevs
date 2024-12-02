require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();
const pool = require('./db');
const authRoutes = require('./routes/auth');
const uploadRoutes = require('./routes/upload');
const costRoutes = require('./routes/costs');
const profitRoutes = require('./routes/profit');

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/upload', uploadRoutes);
app.use('/costs', costRoutes);
app.use('/profit', profitRoutes);

// Serve frontend
app.use(express.static(path.join(__dirname, 'frontend', 'build')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'build', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
