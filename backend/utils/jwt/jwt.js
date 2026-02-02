const jwt = require('jsonwebtoken');
const supabase = require('../../config/supabase.js');

const authenticateJWT = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authentication token required' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { data: user, error } = await supabase.from('users').select('*').eq('user_id', decoded.userId).single();
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }
        req.user = {
            userId: decoded.userId,
            username: decoded.username,
        };
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(403).json({ message: 'Token expired' });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(403).json({ message: 'Invalid token' });
        }
        console.error('JWT verification error:', error);
        return res.status(500).json({ message: 'Server error during authentication', error: error.message });
    }
};

module.exports = { authenticateJWT };
