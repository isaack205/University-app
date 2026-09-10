const jwt = require('jsonwebtoken');
const { User } = require('../models/user');

const optionalAuth = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Allow token to be invalid/expired without throwing for optional routes
            req.user = await User.findById(decoded.id).select('-password');
        } catch (error) {
            // Ignore token errors, treat as guest
            console.warn('Optional auth token error:', error.message);
        }
    }
    
    next();
};

module.exports = optionalAuth;
