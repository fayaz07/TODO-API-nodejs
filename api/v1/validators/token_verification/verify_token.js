const JWTHandler = require('../../core/jwt');
const jwt = new JWTHandler();

module.exports = async function(req, res, next) {
    const token = req.header('access-token');
    if (!token) {
        return res.status(401).json({ status: 'failed', message: 'Access Denied' });
    }

    try {
        const verified = await jwt.verifyAccessToken(token);
        // console.log(verified);
        if (verified.valid) {
            if (!verified.data.email) {
                res.status(401).json({ status: 'failed', message: 'Tampered token' });
                return;
            }
            req.user = verified.data;
            next();
            return;
        }
        return res.status(401).json({ status: 'failed', message: verified.error });
    } catch (err) {
        return res.status(500).json({ status: 'failed', message: 'Internal server error', error: err });
    }
}