require('dotenv').config();
const env = process.env.NODE_ENV || dev;
// 'dev' or 'test' or 'prod'

const dev = {
    name: 'dev',
    app: {
        port: 9000
    },
    db: {
        host: 'localhost',
        port: 27017,
        name: 'todo-dev',
        username: '',
        password: ''
    }
};

const test = {
    name: 'test',
    app: {
        port: 9000
    },
    db: {
        host: 'localhost',
        port: 27017,
        name: 'todo-test',
        username: '',
        password: ''
    }
};

const prod = {
    name: 'prod',
    app: {
        port: 9000
    },
    db: {
        host: 'localhost',
        port: 27017,
        name: 'todo',
        username: '',
        password: ''
    }
};

const config = {
    dev,
    test,
    prod
};

function getConnectionString(env) {
    if (!env || !env.db || !env.db.host || !env.db.port || !env.db.name) {
        throw "Passed invalid environment";
    }
    if (env.db.username === '' || env.db.password === '') {
        return `mongodb://${env.db.host}:${env.db.port}/${env.db.name}`;
    }
    return `mongodb://${env.db.username}:${env.db.password}@${env.db.host}:${env.db.port}/${env.db.name}`;
}

module.exports = config[env] || config[dev];
module.exports.dbConn = getConnectionString;