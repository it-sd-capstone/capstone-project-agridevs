const express = require('express');
const router = express.Router();
const authenticateToken = require('../utils/authMiddleware');
const fieldController = require('../controllers/fieldController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = './uploads';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, 'boundary_' + Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage: storage });

// Get field boundary
router.get('/:fieldId/boundary', authenticateToken, fieldController.getFieldBoundary);

// Get data points with profit
router.get('/:fieldId/data-points', authenticateToken, fieldController.getDataPoints);

// Get field averages
router.get('/:fieldId/averages', authenticateToken, fieldController.getFieldAverages);

// Upload field boundary data
router.post(
    '/boundary',
    authenticateToken,
    upload.single('boundaryFile'),
    fieldController.uploadFieldBoundary
);

module.exports = router;