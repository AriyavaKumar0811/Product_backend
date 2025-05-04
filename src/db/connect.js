const mongoose = require('mongoose');

const ENV = require('../config');
const { decrypt, encrypt } = require('../services/common');

const MONGO_URI = decrypt(ENV.MONGO_URI);
console.log("🦐 MONGO_URI", MONGO_URI);

function connectDb() {

    mongoose.connect(
        MONGO_URI,
    )
        .then(() => {
            console.log('Database connected successfully');
        })
        .catch((error) => {
            console.error('Database connection error: ' + error);
        });

};

connectDb();


mongoose.connection.on('connected', () => {
    console.log('Mongoose default connection open to DATE: ' + new Date());
});

// If the connection throws an error

mongoose.connection.on('error', (err) => {
    console.log('Mongoose default connection error: ' + err);
    connectDb();
});

// When the connection is disconnected

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose default connection disconnected', new Date());
    connectDb();
});

// If the Node process ends, close the Mongoose connection

process.on('SIGINT', () => {
    mongoose.connection.close();
    console.log('Mongoose default connection disconnected through app termination');
    process.exit(0);
});


module.exports = mongoose.connection;

