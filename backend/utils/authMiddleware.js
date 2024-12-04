const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    console.log('authenticateToken middleware called');
    const authHeader = req.headers['authorization'];
    console.log('Authorization Header:', authHeader); // Log the header

    if (!authHeader) {
        console.error('No Authorization header found');
        return res.sendStatus(401); // Unauthorized
    }

    const token = authHeader && authHeader.split(' ')[1];
    console.log('Extracted Token:', token); // Log the token

    if (!token) {
        console.error('No token provided');
        return res.sendStatus(401); // Unauthorized
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.error('Token verification failed:', err);
            return res.sendStatus(403); // Forbidden
        }
        req.user = user;
        next();
    });
}

module.exports = authenticateToken;