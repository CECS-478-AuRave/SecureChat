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
        Type: String
    },
    coverPhotoURL: {
        Type: String,
        required: true
    },
    facebook: Object,
    publicKey: {
        Type: String
    },
    token: {
        Type String,
        require: true
    }
});

mongoose.model('User', userSchema);
