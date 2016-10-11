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
    DateAccessed: {
        Type: Date,
        default: Date.now
    },
    CoverPhotoURL: {
        Type: String,
        required: true
    }
    facebook: Object
});

mongoose.model('User', userSchema);
