// importing app components
const express = require('express');
const app = express();
const mongoose = require('mongoose');
require('dotenv').config();

// this will have the environment and configuration for the application
const appConfig = require('./config');
const dbConnString = require('./config').dbConn;

// import routes
const authRoute = require('./api/v1/routes/auth');
const apiUsageRoute = require('./api/v1/routes/api_usage');
const todoRoute = require('./api/v1/routes/todo');

// body parser
app.use(express.json());

app.use(express.static(__dirname + '/docs'));

// logging requests to console
app.use((req, res, next) => {
    console.log(`Request: ${req.method} ${req.url} - ${new Date().toString()}`);
    next();
});

// setting routes----------------------------------
// user auth route
app.use('/api/v1/auth', authRoute);

// api usage route
app.use('/api/v1/usage', apiUsageRoute);

// todo route
app.use('/api/v1/todo', todoRoute);


// handling 404 routes
app.use(function(req, res, next) {
    res.status(404);

    // respond with html page
    if (req.accepts('html')) {
        res.send('<h2> 404 Not found</h2>');
        return;
    }

    // respond with json
    if (req.accepts('json')) {
        res.send({ error: 'Not found' });
        return;
    }

    // default to plain-text. send()
    res.type('txt').send('Not found');
});

_connectToDB();

// connecting to db
function _connectToDB() {
    console.log('Connecting to db...');
    mongoose.connect(
        dbConnString(appConfig), {
            useUnifiedTopology: true,
            useNewUrlParser: true,
            useCreateIndex: true
        },
        (error) => {
            if (error) {
                console.log('Unable to connect to db');
                console.log(error);
            } else {
                console.log(`Connected to db successfully`);
                _startServer();
            }
        });
}

// listen to the port
function _startServer() {
    console.log('Starting server...');
    app.listen(appConfig.app.port, (err) => {
        if (err) {
            console.log(`Failed to listen on port ${appConfig.app.port}`)
            console.log(err);
        } else {
            console.log(`Listening on port ${appConfig.app.port}`);
            _printRunningEnvironment();
        }
    })
}

// prints the environment the app is running currently along with the Local network IP
function _printRunningEnvironment() {
    // importing modules
    const os = require('os');
    const ifaces = os.networkInterfaces();

    let _lanIP;
    Object.keys(ifaces).forEach(function(ifname) {
        var alias = 0;

        ifaces[ifname].forEach(function(iface) {
            if ('IPv4' !== iface.family || iface.internal !== false) {
                // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
                return;
            }

            if (alias >= 1) {
                // this single interface has multiple ipv4 addresses
                // console.log(ifname + ':' + alias, iface.address);
                _lanIP = iface.address;
            } else {
                // this interface has only one ipv4 adress
                // console.log(ifname, iface.address);
                _lanIP = iface.address;
            }
            ++alias;
        });
    });
    console.log(`App running on ${appConfig.name} environment`);
    console.log(`Run app on local machine http://127.0.0.1:${appConfig.app.port}`);
    console.log(`Run app over local network http://${_lanIP}:${appConfig.app.port}`);
}