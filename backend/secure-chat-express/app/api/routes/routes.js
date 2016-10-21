var mongoose = require('mongoose');
var User = mongoose.model('User');
var Conversation = mongoose.model('Conversation');

module.exports = function(app, passport) {

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
                res.status(200).json({'Session': 'True','user': user});
            } else {
                // Respond with Unauthorized access.
                res.status(401).json({'error': 'Access Not Authorized.'});
            }
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
                User.findOne({'facebook.id' : facebookID}, function(err, user) {
                    if (!user) {
                        // if the user wasn't found respond with status 404
                        // and the information stating User was not found.
                        res.status(404).json({'error': 'User was not found.'});
                    } else if (err) {
                        // if there was an error respond with status 500
                        // and the err information.
                        res.status(500).json(err);
                    } else {
                        // if there wasn't an error and the user was found.
                        // respond with status 200 and user's information
                        res.status(200).json(user);
                    }
                });
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
                User.findOne({'email' : email}, function(err, user) {
                    if (!user) {
                        // if the user wasn't found respond with status 404
                        // and the information stating User was not found.
                        res.status(404).json({'error': 'User was not found.'});
                    } else if (err) {
                        // if there was an error respond with status 500
                        // and the err information.
                        res.status(500).json(err);
                    } else {
                        // if there wasn't an error and the user was found.
                        // respond with status 200 and user's information
                        res.status(200).json(user);
                    }
                });
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
                        // if there was an error respond with status 500
                        // and the err information.
                        res.status(500).json(err);
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
            } else {
                // Respond with Unauthorized access.
                res.status(401).json({'error': 'Access Not Authorized.'});
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
                        // if there was an error respond with status 500
                        // and the err information.
                        res.status(500).json(err);
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
            // Check if the user was authenticated
            if (req.user) {
                // get the authenticated user's facebook id.
                var thisUserID = req.user.facebook.id;
                // console.log(thisUserID);
                // console.log(req.user);

                // Find all conversations containing the current user's facebook id.
                Conversation.find({members: {$in: [thisUserID]}}, function(err, conversation) {
                    // console.log(conversation);
                    if (err) {
                        // Respond with status 500 since there was an error finding conversation.
                        res.status(500).json(err);
                    } else if (!conversation || conversation.length == 0) {
                        // Respond with status 404 since no conversation was found for user.
                        res.status(404).json({'error': 'No available conversations for ' + req.user.name});
                    } else {
                        // Respond with status 200 and the whole conversation as a json object.
                        res.status(200).json(conversation);
                    }
                });
            } else {
                // Respond with Unauthorized access.
                res.status(401).json({'error': 'Access Not Authorized.'});
            }
        }
    );

    // Routes for posting in existing conversation
    app.put('/api/v1/conversation',
        isLoggedIn,
        passport.authenticate(['facebook-token']),
        function(req, res) {
            // Check if the user was authenticated.
            if (req.user) {
                // Get the _id for the conversationID since we are going to use
                // it for finding the conversation.
                var _id = req.body.conversationID;
                // Get the message from the body so we can append it to the
                // found conversation.
                var message = req.body.message;
                // Check if the _id was passed into the body
                if (!_id) {
                    // Respond with bad request status and an error json message
                    // since the conversationID was not found in the body.
                    res.status(400).json({'error': '_id required in body'});
                    return;
                }
                // Check if the message was passed into the body
                if (!message) {
                    // Respond with bad request status and an error json message
                    // since the message was not found in the body.
                    res.status(400).json({'error': 'message required in body'});
                }
                // Find a conversation based on the conversation ID
                Conversation.findOne({'_id': _id}, function(err, conversation) {
                    if (err) {
                        // Server error in finding a single conversation based on
                        // the id. Respond with status 500 and the err object.
                        res.status(500).json(err);
                    } else if (!conversation) {
                        // Conversation was not found. Respond with 404 and
                        // an message stating the conversation was not found.
                        res.status(404).json({'error': 'Conversation Not Found'});
                    } else {
                        var currentTime = Date.now();
                        // Change the conversation date to be the current time
                        // since it's the latest time that the message was sent.
                        conversation.date = currentTime;
                        // append the message to the conversation.
                        conversation.message.push({
                            'message': message,
                            from: req.user.name,
                            date: currentTime
                        });
                        // Save the conversation schema
                        conversation.save(function(err, conversation) {
                            if (err) {
                                // Server error when saving the conversation,
                                // respond with status 500 and the error object.
                                res.status(500).json(err);
                            } else {
                                // Succfully saved the conversation. respond with
                                // status 201 and the conversation object.
                                res.status(201).json(conversation);
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

    // Routes for creating new conversation
    app.post('/api/v1/conversation',
        isLoggedIn,
        passport.authenticate(['facebook-token']),
        function(req, res) {
            // Check if the user was authenticated.
            if (req.user) {
                // Get the authenticated user.
                var thisUser = req.user;
                // Get the message json object from the body.
                var jsonObject = req.body;
                // Check if the json object was given.
                if (!jsonObject) {
                    res.status(400).json({'error': 'JSON message required.'});
                }
                // get the list of members sent by the JSON object.
                var members = jsonObject.members;
                // get the message sent by the Json Object
                var message = jsonObject.message;

                // Check if members exists from the json object.
                if (!members || members.length == 0) {
                    res.status(400).json({'error': 'Member value required.'});
                    return;
                }
                // Check if the message exists from the json object.
                if (!message || message.length == 0) {
                    res.status(400).json({'error': 'Message value required.'});
                    return;
                }
                // Add the current user's facebook id to the members since
                // we will be using it as the groupID.
                members.push(thisUser.facebook.id);
                // GroupID is the sorted facebookID that's joined altogether.
                var groupID = members.sort().join('');
                var currentTime = Date.now();
                // Find a group based on the groupID provided.
                Conversation.findOne({_id: groupID}, function(err, conversation) {
                    if (err) {
                        // Respond with internal server error and the err object since
                        // there was an error with the given query.
                        res.status(500).json(err);
                    } else if (!conversation) {
                        // Since the conversation didn't exist we need to create a
                        // new conversation.
                        var newConversation = new Conversation({
                            _id: groupID,
                            'members': members,
                            date: currentTime
                        });
                        // We append the message to the new conversation.
                        newConversation.message.push({
                            'message': message,
                            from: thisUser.name,
                            date: currentTime
                        });
                        // We need to save the conversation and return the conversation object.
                        newConversation.save(function(err, conversation) {
                            if (err) {
                                // Error in saving the new conversation
                                res.status(500).json(err);
                            } else {
                                // respond to the client with status 201 and the
                                // convesation object.
                                res.status(201).json(conversation);
                            }
                        });
                    } else {
                        // You cannot create another conversation with the same person.
                        // So, respond with status 400 and an json object with an error
                        // message appended.
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

// Function to check if the user session is active.
var isLoggedIn = function(req, res, next) {
    console.log("Hey Arron I'm here");
    // If the user is already authenticated then continue.
    if (req.isAuthenticated()) {
        return next();
    }

    console.log("I'm responding with 401k and errors");
    // Respond with Unauthorized access.
    res.status(401).json({'error': 'Access Not Authorized.'});
};
