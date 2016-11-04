"use strict";

var FacebookTokenStrategy = require('passport-facebook-token');

// load the configuration auth file.
var configAuth = require('./auth');
// load User model using mongoose.
var mongoose = require('mongoose');

var User = mongoose.model('User');

module.exports = function(passport) {
    // Serialization and Deserialization to support login sessions.
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    passport.use(new FacebookTokenStrategy({
        clientID: configAuth.facebookAuth.clientID,
        clientSecret: configAuth.facebookAuth.clientSecret
    },
    // Verify callback for facebook authentication
    function(accessToken, refreshToken, profile, done) {
        User.findOne({'facebook.id' : profile.id}, function(err, user) {
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
                    name: profile.name.givenName + ' ' + profile.name.familyName,
                    email: profile.emails[0].value,
                    profilePhotoURL: 'graph.facebook.com/' + profile.id + '/picture'
                });
                newUser.facebook.id = profile.id;
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
