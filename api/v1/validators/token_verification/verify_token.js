const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
    const token = req.header('auth-token');
    if (!token) {
        return res.status(401).json({ status: 'failed', message: 'Access Denied' });
    }

    try {
        const verified = jwt.verify(token, process.env.AUTH_TOKEN_SECRET);
        if (verified.email == null) {
            res.status(403).json({ status: 'failed', message: 'Invalid token' });
            return;
        }
        req.user = verified;
        next();
    } catch (err) {
        if (err.name.includes('TokenExpiredError')) {
            res.status(401).json({ status: 'failed', message: 'Access-Token Expired' });
            return;
        }
        console.log(err);
        res.status(500).json({ status: 'failed', message: 'Internal server error', error: err });
    }
}