var mongoose = require('mongoose');
var User = mongoose.model('User');
var Conversation = mongoose.model('Conversation');
var Message = mongoose.model('Message');
var friendController = require('../controllers/friends');
var conversationController = require('../controllers/conversation');

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
    app.get('/api/v1/conversation', passport.authenticate(['facebook-token']),
        conversationController.getConversation);

    // Routes for posting in existing conversation
    app.put('/api/v1/conversation', passport.authenticate(['facebook-token']),
        conversationController.putConversation);

    // Routes for creating new conversation
    app.post('/api/v1/conversation', passport.authenticate(['facebook-token']),
        conversationController.postConversation);
};
