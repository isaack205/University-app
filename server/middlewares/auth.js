// Imports
const JWT = require('jsonwebtoken');

// Load env variables
const JWT_SECRET = process.env.JWT_SECRET

// Verify if token is valid and is there
exports.protect = (req, res, next) => {

    // Get the authheader
    const authHeader = req.headers.authorization;
    
    if( !authHeader || !authHeader.startsWith('Bearer')) {
        return res.status(401).json({message: "No token"})
    }
 
    const token = authHeader.split(' ')[1];
    try {
        const decoded = JWT.verify(token, JWT_SECRET)
        req.user = decoded;
        next();
    } catch (error) {
        res.status(403).json({message: "Invalid token", error: error.message})
    }
};

exports.authorize = (roles) => {
    return (req, res, next) => {
        if(!req.user || !req.user.role) {
            return res.status(401).json({message: "User not authenticated or invalid role"})
        }

        // Check if a role is included
        if(!roles.includes(req.user.role)) {
            return res.status(403).json({ message: "Forbidden insufficient permissions" })
        }

        // Proceed to next middleware if successful
        next();
    }
};