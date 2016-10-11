"use strict";
// required
var FacebookStrategy = require('passport-facebook').Strategy;

// load User model using mongoose.
var mongoose = require('mongoose'),
    User = mongoose.model('User');

// load the configuration auth file.
var configAuth = require('./auth');


passport.use(new FacebookStrategy({
        clientID: FACEBOOK_APP_ID,
        clientSecret: FACEBOOK_APP_SECRET,
        callbackURL: "http://localhost:3000/auth/facebook/callback"
    },
    function(accessToken, refreshToken, profile, callback) {

    }
));
