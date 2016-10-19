var mongoose = require('mongoose');
var User = mongoose.model('User');

module.exports = function(app, passport) {

    // Route for main page where status response is 200.
    // app.get('/', isLoggedIn, function(req, res) {
    //     res.writeHead(200, {'Content-Type': 'application/json'});
    //     res.end('{login:success}');
    // });

    // Route for checking if the user is already logged in the session.
    app.get('/api/v1/login', isLoggedIn, function(req, res) {
        res.status(200).json({'Login': 'Successful'});
    });

    // Route for logging in.
    app.post('/api/v1/login',
        passport.authenticate(['facebook-token']),
        function(req, res) {
            // Check if the user was authenticated
            if (req.user) {
                // Respond with status 200 and JSON
                res.status(200).json({'login': 'Successful',
                                      'user': req.user});
            } else {
                // Respond with Unauthorized access.
                res.status(401).json({'error': 'Access Not Authorized.'});
            }
        });

    /// Route for login page where respond with status 401.
    // app.get('/login', function(req, res) {
    //     res.writeHead(401, {'Content-Type': 'application/json'});
    //     res.end('{login:failure}');
    // });

    // // Routes for facebook authentication
    // app.get('/auth/facebook', passport.authenticate('facebook'));
    //
    // // Route for callback handling after facebook authentication
    // app.get('/auth/facebook/callback',
    //     passport.authenticate(
    //         'facebook', {
    //                 successRedirect: '/',
    //                 failureRedirect: '/login',
    //         }
    //     ));

    // Route for logging out, if the user is already logged in.
    app.get('/api/v1/logout', isLoggedIn,
        passport.authenticate(['facebook-token']),
        function(req, res) {
            req.logout();
        });

    // Route for getting a user's publicKey
    app.get('/api/v1/user/id/:id/publicKey',
        passport.authenticate(['facebook-token']),
        function(req, res) {
            //  Check if the user was authenticated
            if (req.user) {
                res.status(200).json({'auth': 'Successful'});
            } else {
                // Respond with Unauthorized access.
                res.status(401).json({'error': 'Access Not Authorized.'});
            }
        });

    // Route for posting publicKey
    app.put('/api/v1/user/id/:id/publicKey',
        passport.authenticate(['facebook-token']),
        function(req, res) {
            // Check if the user was authenticated
            if (req.user) {
                res.status(200).json({'auth': 'Successful'});
            } else {
                // Respond with Unauthorized access.
                res.status(401).json({'error': 'Access Not Authorized.'});
            }
        });

    // Route for getting user information based on their facebook id.
    app.get('/api/v1/user/id/:id',
        passport.authenticate(['facebook-token']),
        function(req, res) {
            // Check if the user was authenticated
            if (req.user) {
                var facebookID = req.params.id;

                // check if the id was passed in the parameter.
                if (!facebookID) {
                    res.status(404).json({'error': 'ID is required to find user.'});
                    return;
                }

                // Find the user based on their facebookID and return the data
                // stored in the database.
                User.findOne({'facebook.id' : facebookID}, findUser);
            } else {
                res.status(401).json({'error': 'Access Not Authorized.'})
            }
        });

    // Route for getting user information based on their email.
    app.get('/api/v1/user/email/:email',
        passport.authenticate(['facebook-token']),
        function(req, res) {
            // Check if the user was authenticated
            if (req.user) {
                var email = req.params.email;

                // Check if the email was passed in the parameter.
                if (!email) {
                    res.status(404).json({'error': 'Email is required to find user'});
                    return;
                }

                // Find a user based on their email and return that user.
                User.findOne({'email' : email}, findUser);
            } else {
                // Respond with Unauthorized access.
                res.status(401).json({'error': 'Access Not Authorized.'});
            }
        });

    app.put('/api/v1/user/friend/accept',
        passport.authenticate(['facebook-token']),
        function(req, res) {
            // Check if the user was authenticated
            if (req.user) {
                var thisUser = req.user;
                var otherUserID = req.body.otherUserID;

            }
        });

    app.delete('/api/v1/user/friend/decline',
        passport.authenticate(['facebook-token']),
        function(req, res) {
            // Check if the user was authenticated.
            if (req.user) {
                // Get the current user profile.
                var thisUser = req.user;
                // Get the friend's user id passed from the body.
                var otherUserID = req.body.OtherUserID;
                // Check if otherUserID was put in the body.
                if (!otherUserID) {
                    res.status(400).json({'error': 'OtherUserID required in body'});
                    return;
                }
                // Check if the current User has any pending friends.
                if (!thisUser.pendingFriends || thisUser.pendingFriends.length == 0) {
                    res.status(400).json({'error': 'User does not have any pending requests'});
                    return;
                }
                // get the index of the friend based on their id.
                var idIndex = thisUser.pendingFriends.indexOf(otherUserID);
                // remove that friend's id from the pending list.
                thisUser.pendingFriends.slice(idIndex, 1);
                // Save the current user schema.
                thisUser.save(function(err, user) {
                    if (err) {
                        // error with save respond with status 500 and
                        // error information.
                        res.status(500).json(err);
                    } else {
                        // deleting from the user was succesful and respond with
                        // status code 201.
                        res.status(201).json({'message': 'Sucessfully removed pending friend.'});
                    }
                });
            } else {
                // Respond with Unauthorized access.
                res.status(401).json({'error': 'Access Not Authorized.'});
            }
        });

    app.put('/api/v1/user/friend/add',
        passport.authenticate(['facebook-token']),
        function(req, res) {
            // Check if the user was authenticated
            if (req.user) {
                // get the otherUserID from the body.
                var otherUserID = req.body.otherUserID;
                // Check if the authenticated user's facebook id is equal to
                // the given friend's id.
                if (req.user.facebook.id == otherUserID) {
                    // Respond with bad request status code.
                    res.status(400).json('error': 'Cannot add yourself to the friends list.');
                    return;
                }
                // Check if the friend's facebook id was passed in the parameter
                if (!otherUserID) {
                    // Respond with bad request status code.
                    res.status(400).json({'error': 'id is required to add friends'});
                    return;
                }
                // Find user by checking for otherUserID and facebook id.
                User.findOne({'facebook.id':otherUserID}, function(err, user) {
                    if (!user) {
                        // if the user wasn't found respond with status 404
                        // and the information stating User was not found...
                        res.status(404).json({'error': 'User was not found.'});
                    } else if (err) {
                        // if there was an error respond with status 404
                        // and the err information.
                        res.status(404).json(err);
                    } else {
                        // Push the authenticated freind's id to the facebook id.
                        user.pendingFriends.push(req.user.facebook.id);
                        // save the user schema that was found.
                        user.save(function(err, user) {
                            if (err) {
                                // error with save respond with status 500 and
                                // error information.
                                res.status(500).json(err);
                            } else {
                                // saving was successful and respond with status
                                // 201.
                                res.status(201).json('message': 'Successfully added to pending list');
                            }
                        });
                    }
                });
            } else {
                // Respond with Unauthorized access.
                res.status(401).json({'error': 'Access Not Authorized.'});
            }
        });
};

var findUser = function(err, user) {
    if (!user) {
        // if the user wasn't found respond with status 404
        // and the information stating User was not found.
        res.status(404).json({'error': 'User was not found.'});
    } else if (err) {
        // if there was an error respond with status 404
        // and the err information.
        res.status(404).json(err);
    } else {
        // if there wasn't an error and the user was found.
        // respond with status 200 and user's information
        res.status(200).json(user);
    }
};

var isLoggedIn = function(req, res, next) {

    // If the user is already authenticated then continue.
    if (req.isAuthenticated()) {
        return next();
    }

    // Respond with Unauthorized access.
    res.status(401).json({'error': 'Access Not Authorized.'});
}
