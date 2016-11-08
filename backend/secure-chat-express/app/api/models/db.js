'use strict';

require('./conversation');
require('./message');
require('./user');

var mongoose = require('mongoose');
const process = require('process');

// Database connection string
var dbURI = 'mongodb://localhost/chat';
// Connect to the given connection string
mongoose.connect(dbURI);
// notifies console on db connection and disconnection
mongoose.connection.on('connected', function() {
    console.log('Mongoose connected to ' + dbURI);
});
mongoose.connection.on('disconnected', function() {
    console.log('Mongoose disconnected through ');
});

// reusable function to close connection
var shutdown = function(msg, callback) {
    mongoose.connection.close(function() {
        console.log('Mongoose disconnected through ' + msg);
        callback();
    });
};

// Listening to node processes for termination and/or restart signals.
process.once('SIGUSR2', function() {
    shutdown('nodemon restart', function() {
        process.kill(process.pid, 'SIGUSR2');
    });
});

process.on('SIGINT', function() {
    shutdown('app termination', function() {
        process.exit(0);
    });
});
