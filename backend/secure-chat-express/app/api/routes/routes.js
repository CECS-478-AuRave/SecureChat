var mongoose = require('mongoose');
var User = mongoose.model('User');
var Conversation = mongoose.model('Conversation');
var friendController = require('../controllers/friends');

module.exports = function(app, passport) {

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
    app.get('/api/v1/user/publicKey',
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
    app.put('/api/v1/user/publicKey',
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
    app.get('/api/v1/user/:id',
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
              // Respond with Unauthorized access.
              res.status(401).json({'error': 'Access Not Authorized.'});
            }
        }
    );

    // Route for getting user information based on query.
    app.get('/api/v1/user', passport.authenticate(['facebook-token']), function(req, res) {
      // Check if the user was authenticated
      if (req.user) {
        // set queryString variable to be from the requested query string.
        var queryString = req.query.queryString;
        // Check if queryString was provided
        if (!queryString) {
          res.status(400).json({'error': 'queryString required in query'});
          return;
        }
        // search based on the queryString provided
        User.search(queryString, function(err, result) {
            if (err) {
              // if there was an error respond with status 500
              // and the err information.
              res.status(500).json(err);
            } else if (!result || result.length === 0) {
              // if the result wasn't found respond with status 404
              // and the information stating results were not found.
              res.status(404).json({'error' : 'No Results Found.'});
            } else {
              // the results were found and responding with it as a list of
              // json object.
              res.status(200).json(result);
            }
          });
      } else {
        // Respond with Unauthorized access.
        res.status(401).json({'error': 'Access Not Authorized.'});
      }
    });

    // Route for deleting a friend.
    app.put('/api/v1/user/friend/delete', passport.authenticate(['facebook-token']),
      friendController.deleteFriend);

    // Route for accepting a pending friend request.
    app.put('/api/v1/user/friend/accept', passport.authenticate(['facebook-token']),
      friendController.acceptFriend);

    // Route for declining a pending friend request.
    app.put('/api/v1/user/friend/decline', passport.authenticate(['facebook-token']),
      friendController.declineFriend);

    // Route for creating a friend request.
    app.put('/api/v1/user/friend/add', passport.authenticate(['facebook-token']),
      friendController.addFriend);

    // Routes for getting all messages for a user.
    app.get('/api/v1/conversation',
        passport.authenticate(['facebook-token']),
        function(req, res) {
            // Check if the user was authenticated
            if (req.user) {
                // get the authenticated user's facebook id.
                var thisUserID = req.user._id;
                // console.log(thisUserID);
                // console.log(req.user);

                // Find all conversations containing the current user's facebook id.
                Conversation
                  .find({members: {$in: [thisUserID]}})
                  .populate('members')
                  .exec(function(err, conversation) {
                    // console.log(conversation);
                    if (!conversation || conversation.length == 0) {
                      // Respond with status 404 since no conversation was found for user.
                      res.status(404).json({'error': 'No available conversations for ' + req.user.name});
                    } else if (err) {
                      // Respond with status 500 since there was an error finding conversation.
                      res.status(500).json(err);
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
                Conversation
                  .findOne({'conversationID': _id})
                  .populate('members')
                  .exec(function(err, conversation) {
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
                // get the list of members, the user._id, sent by the JSON object.
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
                members.push(thisUser._id);
                // Add the current user's facebook name to the names since
                // we need to store all the members' name.
                // names.push(thisUser.name);
                // GroupID is the sorted facebookID that's joined altogether.
                var groupID = members.sort().join('_');
                var currentTime = Date.now();
                // Find a group based on the groupID provided.
                Conversation.findOne({conversationID: groupID}, function(err, conversation) {
                    if (err) {
                        // Respond with internal server error and the err object since
                        // there was an error with the given query.
                        res.status(500).json(err);
                    } else if (!conversation) {
                        // Since the conversation didn't exist we need to create a
                        // new conversation.
                        var newConversation = new Conversation({
                            conversationID: groupID,
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
                                Conversation
                                  .findById(conversation._id)
                                  .populate('members')
                                  .exec(function(err, conversation) {
                                    if (err) {
                                      res.status(500).json(err);
                                    } else {
                                      // respond to the client with status 201 and the
                                      // convesation object.
                                      res.status(201).json(conversation);
                                    }
                                  });
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
