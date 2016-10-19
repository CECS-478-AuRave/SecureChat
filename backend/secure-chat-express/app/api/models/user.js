"use strict";
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String
    },
    profilePhotoURL: {
        type: String,
        required: true
    },
    facebook: {
        id: String
    },
    publicKey: {
        type: String
    },
    friends: [id: {type: String}],
    pendingFriends: [id: {type: String}]
});

mongoose.model('User', userSchema);
