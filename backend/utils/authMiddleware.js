const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    console.log('authenticateToken middleware called');
    const authHeader = req.headers['authorization'];
    console.log('Authorization Header:', authHeader);

    if (!authHeader) {
        console.error('No Authorization header found');
        return res.sendStatus(401); // Unauthorized
    }

    const token = authHeader.split(' ')[1];
    console.log('Extracted Token:', token);

    if (!token) {
        console.error('No token provided');
        return res.sendStatus(401); // Unauthorized
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.error('Token verification failed:', err);
            return res.sendStatus(403); // Forbidden
        }
        console.log('Decoded User:', user);
        req.user = user;
        next();
    });
}

module.exports = authenticateToken;