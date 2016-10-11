"use strict";
var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
    facebookID: {
        Type: String,
        required: true
    },
    name: {
        first_name: {
            Type: String,
            required: true
        },
        last_name: {
            Type: String,
            required: true
        }
    },
    userName: {
        Type: String,
        required: true
    },
    email: {
        Type: String,
        required: true
    }
});

mongoose.model('User', userSchema);
