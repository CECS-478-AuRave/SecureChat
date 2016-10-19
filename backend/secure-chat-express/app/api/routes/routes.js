var mongoose = require('mongoose');
var User = mongoose.model('User');
var Conversation = mongoose.model('Conversation');

module.exports = function(app, passport) {

    // Route for main page where status response is 200.
    // app.get('/', isLoggedIn, function(req, res) {
    //     res.writeHead(200, {'Content-Type': 'application/json'});
    //     res.end('{login:success}');
    // });

    // Route for checking if the user is already logged in the session.
    app.get('/api/v1/login',
        isLoggedIn,
        passport.authenticate(['facebook-token']),
        function(req, res) {
            res.status(200).json({'Login': 'Successful'});
        }
    );

    // Route for logging in.
    app.post('/api/v1/login',
        passport.authenticate(['facebook-token']),
        function(req, res) {
            // Check if the user was authenticated
            if (req.user || req.newUser) {
                var user = req.user ? req.user : req.newUser;
                // Respond with status 200 and JSON
                res.status(200).json({'login': 'Successful',
                                      'user': user});
            } else {
                // Respond with Unauthorized access.
                res.status(401).json({'error': 'Access Not Authorized.'});
            }
        }
    );

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
    app.get('/api/v1/logout',
        isLoggedIn,
        passport.authenticate(['facebook-token']),
        function(req, res) {
            req.logout();
        }
    );

    // Route for getting a user's publicKey
    app.get('/api/v1/user/id/:id/publicKey',
        isLoggedIn,
        passport.authenticate(['facebook-token']),
        function(req, res) {
            //  Check if the user was authenticated
            if (req.user) {
                res.status(200).json({'auth': 'Successful'});
            } else {
                // Respond with Unauthorized access.
                res.status(401).json({'error': 'Access Not Authorized.'});
            }
        }
    );

    // Route for posting publicKey
    app.put('/api/v1/user/id/:id/publicKey',
        isLoggedIn,
        passport.authenticate(['facebook-token']),
        function(req, res) {
            // Check if the user was authenticated
            if (req.user) {
                res.status(200).json({'auth': 'Successful'});
            } else {
                // Respond with Unauthorized access.
                res.status(401).json({'error': 'Access Not Authorized.'});
            }
        }
    );

    // Route for getting user information based on their facebook id.
    app.get('/api/v1/user/id/:id',
        isLoggedIn,
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
        }
    );

    // Route for getting user information based on their email.
    app.get('/api/v1/user/email/:email',
        isLoggedIn,
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
        }
    );

    // Route for accepting a pending friend request.
    app.put('/api/v1/user/friend/accept',
        isLoggedIn,
        passport.authenticate(['facebook-token']),
        function(req, res) {
            // Check if the user was authenticated
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
                User.findOne({'facebook.id':otherUserID}, function(err, otherUser) {
                    if (!user) {
                        // if the user wasn't found respond with status 404
                        // and the information stating User was not found...
                        res.status(404).json({'error': 'Other User was not found.'});
                    } else if (err) {
                        // if there was an error respond with status 404
                        // and the err information.
                        res.status(404).json(err);
                    } else {
                        // Add each users as friends.
                        otherUser.friends.push(thisUser.facebook.id);
                        thisUser.friends.push(otherUserID);
                        // Save other user
                        otherUser.save(function(err, user) {
                            if (err) {
                                // error with save respond with status 500 and
                                // error information.
                                res.status(500).json(err);
                            }
                        });
                        // Save this user
                        thisUser.save(function(err, user) {
                            if (err) {
                                // error with save respond with status 500 and
                                // error information.
                                res.status(500).json(err);
                            } else {
                                // adding friend was successful. resond with
                                // status 201.
                                res.status(201).json({'message': 'Successfully added friends'});
                            }
                        });
                    }
                });
            }
        }
    );


    // Route for declining a pending friend request.
    app.put('/api/v1/user/friend/decline',
        isLoggedIn,
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
        }
    );

    // Route for creating a friend request.
    app.put('/api/v1/user/friend/add',
        isLoggedIn,
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
                    res.status(400).json({'error': 'Cannot add yourself to the friends list.'});
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
                    } else if (user.pendingFriends.indexOf(req.user.facebook.id) == -1) {
                        res.status(400).json({'error': 'Already pending friend request'});
                    } else if (user.friends.indexOf(req.user.facebook.id) == -1) {
                        res.status(400).json({'error': 'User is already a friend.'})
                    }else {
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
                                res.status(201).json({'message': 'Successfully added to pending list'});
                            }
                        });
                    }
                });
            } else {
                // Respond with Unauthorized access.
                res.status(401).json({'error': 'Access Not Authorized.'});
            }
        }
    );

    // Routes for getting all messages for a user.
    app.get('/api/v1/conversation',
        isLoggedIn,
        passport.authenticate(['facebook-token']),
        function(req, res) {
            if (req.user) {
                var thisUserID = req.user.facebook.id;
                Conversation.find({members: {$in: [thisUserID]}}, function(err, conversation) {
                    if (err) {
                        res.status(404).json(err);
                    } else if (!conversation) {
                        res.status(404).json({'error': 'No conversation found for user'});
                    } else {
                        res.status(200).json(conversation);
                    }
                });
            } else {
                // Respond with Unauthorized access.
                res.status(401).json({'error': 'Access Not Authorized.'});
            }
        }
    );

        //     else {
        //        conversation.date = currentTime;
        //        conversation.message.push({
        //            'message': message,
        //            from: thisUser.facebook.id,
        //            date: currentTime
        //        });
        //        conversation.save(saveConversation);
        //    }
        // Routes for posting in existing conversation
    app.put('/api/v1/conversation',
        isLoggedIn,
        passport.authenticate(['facebook-token']),
        function(req, res) {
            if (req.user) {
                var _id = req.body.conversationID;
                var message = req.body.message;
                if (!_id) {
                    res.status(400).json({'error': '_id required in body'});
                    return;
                }
                if (!message) {
                    res.status(400).json({'error': 'message required in body'});
                }
                Conversation.findOne({_id: groupID}, function(err, conversation) {
                    if (err) {
                        res.status(404).json(err);
                    } else if (!conversation) {
                        res.status(404).json({'error': 'Conversation Not Found'});
                    } else {
                        var currentTime = Date.now;
                        conversation.date = currentTime;
                        conversation.message.push({
                            'message': message,
                            from: req.user.name,
                            date: currentTime
                        });
                        conversation.save(saveConversation);
                    }
                });
            } else {
                // Respond with Unauthorized access.
                res.status(401).json({'error': 'Access Not Authorized.'});
            }
        }
    );

    // Routes for creating new conversation
    app.post('/api/v1/conversation',
        isLoggedIn,
        passport.authenticate(['facebook-token']),
        function(req, res) {
            if (req.user) {
                var thisUser = req.user;
                var members = req.body.members.list;
                var message = req.body.message;
                // Check if otherUserID was put in the body.
                if (!members) {
                    res.status(400).json({'error': 'OtherUserID required in body'});
                    return;
                }
                if (!message) {
                    res.status(400).json({'error': 'Message required in body'});
                    return;
                }
                members.push(thisUser.facebook.id);
                var groupID = members.sort().join('');
                var currentTime = Date.now;
                Conversation.findOne({_id: groupID}, function(err, conversation) {
                    if (err) {
                        res.status(404).json(err);
                    } else if (!conversation) {
                        var newConversation = new Conversation({
                            _id: groupID,
                            'members': members,
                            date: currentTime
                        });
                        newConversation.message.push({
                            'message': message,
                            from: thisUser.name,
                            date: currentTime
                        });
                        newConversation.save(saveConversation);
                    } else {
                        res.status(400).json({'error': 'Conversation Already Exists'});
                    }
                });
            } else {
                // Respond with Unauthorized access.
                res.status(401).json({'error': 'Access Not Authorized.'});
            }
        }
    );
};

var saveConversation = function(err, conversation) {
    if (err) {
        res.status(500).json(err);
    } else {
        res.status(201).json(conversation);
    }
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
};
