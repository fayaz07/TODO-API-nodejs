const router = require('express').Router();
const userValidation = require('../validators/auth').userValidation;
const User = require('../models/auth');
const ApiUsage = require('../models/api_usage');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const sendEmail = require('../utils/email/send_email').sendAPIKeyThroughEmail;
require('dotenv').config();

router.post('/login', async(req, res) => {
    try {
        // validating if required details are provided by the user
        // we require `email` for authenticating the user
        //
        // Scenario --
        //  validate user
        //  check if the user is already registered, if registered 
        //       check for existing api keys,
        //       find unexpired api key and send the email
        //       if all api keys are expired, create fresh jwt and send it to user
        //  create a hash of the email 
        //  create a jwt from the hash with expiry time of 1 month
        //  mail the jwt to the user's provided email

        const { validationError } = userValidation(req.body);

        if (validationError) {
            res.status(400).json({
                status: 'failed',
                message: error.details[0].message,
                error: error
            });
            return
        }

        //console.log('email validated and is ok')

        // check if the user is existing
        const existing = await User.findOne({ email: req.body.email });
        let result;
        if (existing && existing.email) {
            //console.log('existing user')
            result = await _login(existing);
        } else {
            //console.log('new user')
            result = await _register(req.body.email)
        }
        if (result) {
            return res.status(200).json({
                status: 'success',
                message: 'Your API Key has been sent to your email, please use that to make further operations',
            })
        } else {
            return res.status(417).json({
                status: 'failed',
                message: 'Something has gone wrong, please try later or contact support',
            })
        }

    } catch (err) {
        console.log('Seems issue with logging user in');
        console.log(err);
        res.status(500).json({ status: 'failed', message: 'Internal server error', error: err });
        return;
    }
});

// existing: User model instance
async function _login(existing) {
    // login
    try {
        // check for existing api keys and check if they are expired, 
        // if expired, create a new key and send email
        let apiUsage = await ApiUsage.findOne({ user_id: existing._id });
        //console.log(apiUsage);
        if (apiUsage) {
            //console.log('api usage is not null')
            // api usage is not null
            const apiKeys = apiUsage.keys;
            if (apiKeys && apiKeys.length > 0) {
                //console.log('found few keys')
                // there are few old api keys
                // fetching last api key
                const lastKey = apiKeys[apiKeys.length - 1];

                // validate last api key
                // if it is invalid/expired, create a new token and store it in db
                // send the key to the end user through email
                try {
                    if (lastKey) {
                        const verified = _validateAPIKey(lastKey);
                        // console.log(verified);
                        if (verified.email === null) {
                            //console.log('Malformed token');
                            // creating a new token and saving it in db
                            apiUsage = await _genAPIKeyAndSaveInDB(apiUsage);
                            // sending the latest key to the end user through email
                            _pickLastKeyAndSendEmail(existing.email, apiUsage);
                        } else {
                            //console.log('valid previous api key')
                            _pickLastKeyAndSendEmail(existing.email, apiUsage);
                        }
                    } else {
                        // key looks in valid or no keys
                        // sending the latest key to the end user through email
                        //console.log('Old key is invalid');
                        apiUsage = await _genAPIKeyAndSaveInDB(apiUsage);
                        // sending the latest key to the end user through email
                        _pickLastKeyAndSendEmail(existing.email, apiUsage);
                    }

                } catch (err) {
                    if (err.name.includes('TokenExpiredError')) {
                        //console.log('API Key expired');
                        apiUsage = await _genAPIKeyAndSaveInDB(apiUsage);
                        _pickLastKeyAndSendEmail(existing.email, apiUsage);
                    }
                    console.log('Some other error here, while validating the jwt');
                    console.log(err);
                }
            }
        } else {
            // console.log('api usage is null')
            // apiUsage is null
            // create a new key and save it in db
            let newAPIUsage = ApiUsage({
                user_id: existing._id
            });
            newAPIUsage = await _genAPIKeyAndSaveInDB(existing.email, newAPIUsage);
            _pickLastKeyAndSendEmail(existing.email, newAPIUsage);
        }
        return true;
    } catch (err) {
        console.log('Caught an exception while logging user in');
        console.log(err);
        return false;
    }
}

function _pickLastKeyAndSendEmail(email, apiUsage) {
    try {
        const lastKey = apiUsage.keys[apiUsage.keys.length - 1];
        // sending email
        sendEmail(email, lastKey);
    } catch (err) {
        console.log('Caught an exception while picking the last key and sending email to the end user');
        console.log(err);
    }
}

async function _createEmailHash(email) {
    const salt = await bcrypt.genSalt(10);
    const hashEmail = await bcrypt.hash(email, salt);
    return hashEmail;
}

async function _genAPIKeyAndSaveInDB(email, apiUsage) {
    try {

        // creating hash of the email
        // const hashedEmail = await _createEmailHash(email);
        // generating api key and saving in db
        const newAPIKey = await _generateNewAPIKey(email);
        // console.log(newAPIKey);
        apiUsage.keys.push(newAPIKey);
        await apiUsage.save();
        return apiUsage;
    } catch (err) {
        console.log('Caught an exception while generating key and saving it in db');
        console.log(err);
    }
}

function _validateAPIKey(token) {
    // console.log(token);
    return jwt.verify(token, process.env.AUTH_TOKEN_SECRET);
}

async function _generateNewAPIKey(hashedEmail) {
    // creating an api key that expires in 30 days
    const apiKey = await jwt.sign({ email: hashedEmail }, process.env.AUTH_TOKEN_SECRET, { expiresIn: '30d' });
    return apiKey;
}

// email
async function _register(email) {
    // register
    try {
        // All good, email looks ok, now proceeding to next step
        // Hash the email

        const newUser = User({
            email: email
        });
        // saving user
        await newUser.save();

        // creating new ApiUsage instance
        let newAPIUsage = ApiUsage({
            user_id: newUser._id
        });

        newAPIUsage = await _genAPIKeyAndSaveInDB(email, newAPIUsage);
        //console.log(newAPIUsage);
        _pickLastKeyAndSendEmail(email, newAPIUsage);
        return true;
    } catch (err) {
        console.log('Caught an exception while registering user');
        console.log(err);
        return false;
    }

}

module.exports = router;