"use strict";
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var userSchema = new Schema({
    name: {
        Type: String,
        required: true
    },
    email: {
        Type: String,
        required: true
    },
    username: {
        Type: String,
        required: true
    },
    dateAccessed: {
        Type: Date,
        default: Date.now
    },
    coverPhotoURL: {
        Type: String,
        required: true
    }
    facebook: Object,
    publicKey: {
        Type: String
    },
    token: {
        Type String
    }
});

mongoose.model('User', userSchema);
