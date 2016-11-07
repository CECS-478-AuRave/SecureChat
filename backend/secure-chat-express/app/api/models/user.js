"use strict";

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    searchable = require('mongoose-searchable');

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
    friends: [String],
    pendingFriends: [String]
});

// make all string fields searchable.
userSchema.plugin(searchable, {
  language: 'english',
  fields: ['email', 'name']
});

// Compile userSchema into a mongoose model.
mongoose.model('User', userSchema);
