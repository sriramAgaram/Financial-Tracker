const cronMiddleware = (req, res, next) => {
    const cronKey = req.headers['x-cron-api-key'] || req.query.key;
    
    if (!cronKey || cronKey !== process.env.CRON_SECRET) {
        return res.status(403).json({ 
            status: false, 
            msg: 'Forbidden: Invalid or missing Cron API Key' 
        });
    }
    
    next();
};

module.exports = cronMiddleware;
