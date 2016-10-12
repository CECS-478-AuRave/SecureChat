"use strict";
// required
var FacebookStrategy = require('passport-facebook').Strategy;

// load User model using mongoose.
var mongoose = require('mongoose'),
    User = mongoose.model('User');

// load the configuration auth file.
var configAuth = require('./auth');

module.exports = function(passport) {
    // Serialization and Deserialization to support login sessions.
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });
    passport.deserializeUser(function(id, done) {
        User.findById({facebook.id : id}, function(err, user) {
            done(err, user);
        });
    });

    passport.use(new FacebookStrategy({
        clientID: configAuth.facebookAuth.clientID,
        clientSecret: configAuth.facebookAuth.clientSecret,
        callbackURl: configAuth.facebookAuth.callbackURL
    },
    // Verify callback for facebook authentication
    function(accessToken, refreshToken, profile, done) {
        User.findOne({facebook.id : profile.id}, function(err, user) {
            var newUser;
            // Error occurred making query.
            if (err) {
              return done(err);
            }
            // user already exists in database.
            if (user) {
                return done(null, user); // returning the user.
            } else {
                // Creating new user since it doesn't exist in database.
                newUser = new User({
                    name: profile.name,
                    email: profile.email,
                    coverPhotoURL: profile.cover.source,
                    facebook.id: profile.id,
                    token: accessToken
                });
                // Saving the User to the database
                newUser.save(function(err) {
                    if (err) {
                        done(err);
                    }
                    return done(null, newUser)
                });
            }
        });
    }));
}
