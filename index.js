const express = require('express');
const app = express();
const mongoose = require('mongoose');
require('dotenv').config();

// import routes
const userRoute = require('./routes/user');


const port = process.env.PORT || 9000;

// body parser
app.use(express.json());

// logging requests
app.use((req, res, next) => {
    console.log(`Request: ${req.method} ${req.url} ${Date.now()}`);
    next();
});

app.use('/api/v1/user', userRoute);

// connect to db
mongoose.connect(process.env.DB_CONNECT, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
        useCreateIndex: true
    },
    (error) => {
        if (error) {
            console.log('Unable to connect to db');
            console.log(error);
        } else {
            console.log(`connected to db: ${process.env.DB_CONNECT}`);
        }
    });

// listen to the requests
app.listen(port, (err) => {
    if (err) {
        console.log(`Failed to listen on port ${port}`)
    } else {
        console.log(`Listening on port ${port}`);
    }
})

// const sendEmail = require('./utils/email/send_email').sendAPIKeyThroughEmail;

// sendEmail('fayazfz07@gmail.com', 'hello');