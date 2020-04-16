const Auth = require('../models/auth');
const ApiUsage = require('../models/api_usage');

module.exports = async(req, res, next) => {
    try {
        const auth = await Auth.findOne({ email: req.user.email });
        if (!auth) {
            return res.status(404).json({ status: 'failed', message: 'Invalid user/user doesn\'t exists' });
        }
        req.auth = auth;
        const usage = await ApiUsage.findOne({ user_id: auth._id });
        if (!usage) {
            console.log('Usage is null');
            const newUsage = ApiUsage({
                user_id: auth._id,
                requests_this_month: 1,
                requests_total: 1,
            });
            next();
            await newUsage.save();
            // return { result: true, message: 'API Usage was null, created new document and incremented usage' };
        } else {
            // check if requests limit reached
            if (usage.requests_this_month === usage.requests_limit_per_month) {
                // monthly limit reached
                //return { result: false, message: 'API usage for monthly limit reached, please contact support for more information' };
                return res.status(400).json({ status: 'failed', message: 'API requests limit for this month reached, please contact support for more information' });
            }
            // usage limit not reached
            let currDate = new Date();
            const lastUsedDate = usage.last_request_on;
            if (currDate.getMonth() === lastUsedDate.getMonth() &&
                currDate.getFullYear() === lastUsedDate.getFullYear()
            ) {
                // last api request was made in the same month
                // incrementing the requests of this month
                usage.requests_this_month = usage.requests_this_month + 1;
                usage.lastUsedDate = currDate;
            } else {
                usage.requests_this_month = 1;
                usage.lastUsedDate = currDate;
            }

            // incrementing total requests
            if (usage.requests_total) {
                usage.requests_total = usage.requests_total + 1;
            } else {
                usage.requests_total = 1;
            }
            next();
            await usage.save();
            //            return { result: true, message: 'Successfully incremented API usage' };
        }
        //        next();
    } catch (err) {
        console.log('Unable to increment api usage')
        console.log(err)
    }
}