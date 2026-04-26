const rateLimit = require('express-rate-limit');

// 1. Burst rate limiter: Stops bots making many requests in a few seconds
const burstLimiter = rateLimit({
    windowMs: 10 * 1000, // 10 seconds
    max: 15, // Limit each IP to 15 requests every 10 seconds
    message: {
        status: false,
        msg: 'Too many requests too fast. Please slow down.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// 2. Global rate limiter: Allows human users to work long-term
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 1000 requests per 15 minutes
    message: {
        status: false,
        msg: 'You have reached your 15-minute request limit. Please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// 3. Strict rate limiter: For auth routes (Login/Signup)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // Limit each IP to 20 requests per 15 minutes for auth
    message: {
        status: false,
        msg: 'Too many login/signup attempts from this IP, please try again after 15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    globalLimiter,
    burstLimiter,
    authLimiter
};
