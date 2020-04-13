const sgMail = require('@sendgrid/mail');
const pug = require('pug');
require('dotenv').config();

const _fromEmail = {
    email: 'fayazfz07@gmail.com',
    name: 'Fayaz'
};

function sendAPIKeyThroughEmail(email, apiKey) {

    console.log(apiKey);

    //console.log(__dirname);
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);


    const render = pug.renderFile(__dirname.replace("email", "") + '/templates/verify_email.pug', {
        api_key: apiKey
    });

    const msg = {
        to: email,
        from: _fromEmail,
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

module.exports.sendAPIKeyThroughEmail = sendAPIKeyThroughEmail;