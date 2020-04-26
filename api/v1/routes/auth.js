const router = require('express').Router();
const userValidation = require('../validators/auth').userValidation;
const Auth = require('../models/auth');
const ApiUsage = require('../models/api_usage');
const bcrypt = require('bcrypt');
require('dotenv').config();
const jwt = require('../core/jwt');
const JWTHandler = new jwt();
const https = require('https');
const User = require('../models/user');

// ---------------------------------- start google auth ------------------------------------------
router.post('/google', async(req, res) => {
    try {
        // invalid token
        if (!req.body.id_token)
            return res.status(400).json({
                status: 'failed',
                message: 'Invalid id token'
            });
        _validateGoogleIdToken(req, res);
    } catch (err) {
        console.log('Unable to authenticate using Google')
        console.log(err);
        return res.status(500)
            .json({
                status: 'failed',
                message: 'Internal server error',
                error: err
            });
    }
})

async function _validateGoogleIdToken(req, res) {
    try {
        https.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${req.body.id_token}`,
            (resp) => {
                var arr = [];
                resp.on('data', d => {
                    arr.push(d)
                }).on('end', async() => {
                    const buffer = Buffer.concat(arr);
                    const response = JSON.parse(buffer.toString('utf-8'));
                    // console.log(response);
                    _checkForUsersExistence(response, res);
                })
            }
        );
    } catch (err) {
        console.log('Unable to validate google id token');
        throw err;
    }
}

async function _checkForUsersExistence(googleAuthResposne, res) {
    try {
        if (googleAuthResposne.error) {
            return res.status(400)
                .json({
                    status: 'failed',
                    message: `Failed to authenticate using Google ${googleAuthResposne.error_description}`
                });
        } else {
            // proper access token detected
            // checking if user already exists
            const authData = await Auth.findOne({ email: googleAuthResposne.email });
            if (authData) {
                // existing user
                _loginWithGoogle(authData, googleAuthResposne, res);
            } else {
                // signing up user 
                _registerWithGoogle(googleAuthResposne, res);
            }
        }
    } catch (err) {
        console.log('Unable to check users existance - Google auth id');
        throw err;
    }
}

async function _loginWithGoogle(authData, response, res) {
    try {
        // checking if the email used is with fb auth otherwise throwing error
        if (authData.provider.includes("email")) {
            // if used with other type of signin return error
            return res.status(409).json({
                status: 'failed',
                message: 'This email is already being used with other type of signin'
            });
        } else {
            // email used here is not used for other signin type
            // no issues now, create access token and login the user
            // Create and assign a token
            // logging in user
            const refresh_token = await JWTHandler.genRefreshToken(authData._id);
            const auth_token = await JWTHandler.genAccessToken(response.email);
            authData.refresh_token = refresh_token;

            authData.save();

            const userData = User.findOne({ email: response.email });

            Promise.all([
                    userData
                ])
                .then(d => {
                    return res
                        .header('access-token', auth_token)
                        .header('refresh-token', refresh_token)
                        .status(200)
                        .json({
                            status: 'success',
                            message: 'Successfully logged in with Google',
                            user: d[0],
                        });
                })
        }
    } catch (err) {
        console.log('Failed to login user using Google');
        throw err;
    }
}

async function _registerWithGoogle(response, res) {
    try {
        const authData = new Auth({
            email: response.email,
            provider: 'google'
        });

        const refresh_token = await JWTHandler.genRefreshToken(authData._id);
        const auth_token = await JWTHandler.genAccessToken(response.email);
        authData.refresh_token = refresh_token;

        var names = [];
        if (response.name) {
            names = response.name.split(/\s+/);
            //            console.log(names);
        }

        const userData = new User({
            user_id: authData._id,
            email: response.email,
            first_name: names[0],
            last_name: names[1],
            pp: response.picture,
        });

        // Creating user in database
        Promise.all([
            authData.save(),
            userData.save()
        ]).then(d => {
            return res
                .header('access-token', auth_token)
                .header('refresh-token', refresh_token)
                .status(201)
                .json({
                    status: 'success',
                    message: 'Successfully registered using Google',
                    user: userData,
                });
        });
    } catch (err) {
        console.log('Failed to register user using Google');
        throw err;
    }
}
// ---------------------------------- end google auth ---------------------------------------------



// ---------------------------------- start token -------------------------------------------------

router.post('/token', async(req, res) => {

    try {
        const refresh_token = req.header('refresh-token');

        if (!refresh_token) {
            res.status(400).json({ status: 'failed', message: 'Invalid refresh-token' });
            return;
        }

        // verifying refresh-token
        const verify = await JWTHandler.verifyRefreshToken(refresh_token);
        // console.log(verify);
        if (!verify.valid) {
            return res.status(400).json({ status: 'failed', message: 'Invalid/tampered refresh-token' });
        }
        const authUser = await Auth.findOne({ _id: verify.data.user_id });
        if (authUser.refresh_token === refresh_token) {
            const accessToken = await JWTHandler.genAccessToken(authUser.email);
            return res.header('access-token', accessToken)
                .header('refresh-token', refresh_token)
                .status(200)
                .json({ status: 'success', message: 'Auth-token regenerated' });
        } else {
            console.log(authUser.refresh_token);
            console.log(refresh_token);
            res.status(400).json({ status: 'failed', message: 'Tokens doesn\'t match' });
            return;
        }
    } catch (err) {
        console.log('Unable to generate auth-token');
        console.log(err);
        return res.status(500).json({ status: 'failed', message: 'Internal server error' });
    }

});

// ---------------------------------- end token ---------------------------------------------------


// -------------------------------- start email login ---------------------------------------------
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
        const existing = await Auth.findOne({ email: req.body.email });
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
                        const verified = await JWTHandler.verifyAccessToken(lastKey);
                        // console.log(verified);
                        if (!verified.valid) {
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

async function _genAPIKeyAndSaveInDB(email, apiUsage) {
    try {
        // generating api key and saving in db
        const newAPIKey = await JWTHandler.genAccessToken(email);
        // console.log(newAPIKey);
        apiUsage.keys.push(newAPIKey);
        await apiUsage.save();
        return apiUsage;
    } catch (err) {
        console.log('Caught an exception while generating key and saving it in db');
        console.log(err);
    }
}

// email
async function _register(email) {
    // register
    try {
        // All good, email looks ok, now proceeding to next step
        // Hash the email

        const newUser = Auth({
            email: email,
            provider: 'email'
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
// ----------------------------------------- end email auth ---------------------------------------



// ----------------------------------------- helper methods ----------------------------------------
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

async function _encryptData(data) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(data, salt);
}
// --------------------------------------- end helper methods --------------------------------------

module.exports = router;