const jwt = require('jsonwebtoken');

module.exports = {
    verifyToken: (req, res, next) => {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Extract 'Bearer <token>'

        if (!token) {
            return res.status(401).json({ error: 'Access Denied: Missing Authorization Token.' });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded; // Appending decoded payload (id, role) to the request object
            next();
        } catch (err) {
            res.status(403).json({ error: 'Forbidden: Invalid or Expired Token.' });
        }
    }
};