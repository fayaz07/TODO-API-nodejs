const router = require('express').Router();
const verify_token = require('../validators/token_verification/verify_token');
const ApiUsage = require('../models/api_usage');
const Auth = require('../models/auth');
const dateTimeModule = require('date-and-time');


// get usage
router.get('/', verify_token, async(req, res) => {

    try {
        const auth = await Auth.findOne({ email: req.user.email });
        if (!auth) {
            return res.status(404).json({ status: 'failed', message: 'Invalid user' });
        }
        const usage = await ApiUsage.findOne({ user_id: auth._id }, { keys: 0 });
        if (!usage) {
            const newUsage = ApiUsage({
                user_id: auth._id,
            });
            await newUsage.save();
            return res.status(200).json({
                status: 'success',
                message: 'Successfully fetched api usage details',
                usage: newUsage
            });
        }
        return res.status(200).json({
            status: 'success',
            message: 'Successfully fetched api usage details for user',
            usage: usage
        });
    } catch (err) {
        console.log('Unable to fetch api usage details of user');
        console.log(err);
        return res.status(500).json({
            status: 'failed',
            message: 'Internal server error',
            error: err
        });
    }

});

module.exports = router;