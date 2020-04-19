const sgMail = require('@sendgrid/mail');
const pug = require('pug');
require('dotenv').config();
const path = require('path');

const _senderConfig = {
    email: process.env.SENDGRID_EMAIL,
    name: process.env.SENDGRID_USERNAME
};

class Email {

    constructor() {
        if (!process.env.SENDGRID_API_KEY)
            throw "Sendgrid API Key is not specified. Please specify the API key in your environment variables, as SENDGRID_API_KEY=<your-api-key-here>";
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    }

    sendAPIKey(email, apiKey) {

        const render = pug.renderFile(path.join(__dirname, '../../v1/utils/templates/verify_email.pug'), {
            api_key: apiKey
        });

        const msg = {
            to: email,
            from: _senderConfig,
            subject: 'API Key distribution',
            html: render,
        };

        //ES6
        sgMail
            .send(msg)
            .then(() => {
                console.log('Email sent');
            }, error => {
                console.error(error);

                if (error.response) {
                    console.error(error.response.body)
                }
            });
    }
}


module.exports = Email;