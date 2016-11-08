var mongoose = require('mongoose');
var User = mongoose.model('User');
var Conversation = mongoose.model('Conversation');
var Message = mongoose.model('Message');
var friendController = require('../controllers/friends');
var conversationController = require('../controllers/conversation');
var userController = require('../controllers/user');

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
    app.get('/api/v1/user/publicKey/:id',
        passport.authenticate(['facebook-token']),
        function(req, res) {
            //  Check if the user was authenticated
            if (req.user) {
                var otherUserId = req.params.id;
                if (!otherUserId) {
                    res.status(400).json({'error': 'OtherUserID required in parameter.'});
                    return;
                }
                User.findOne({'facebook.id': otherUserId}, function(err, user) {
                    var publicKey = user.publicKey;
                    if (err) {
                        res.status(500).json(err);
                    } else if (!publicKey) {
                        res.status(404).json({'error' : 'Public key not set for the queried user.'});
                    } else {
                        res.status(200).json({'publicKey' : publicKey});
                    }
                });
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
                var thisUser = req.user;
                var publicKey = req.body.publicKey;
                if (!publicKey) {
                    res.status(400).json({'error' : 'publicKey required in body.'});
                    return;
                }
                thisUser.publicKey = publicKey;
                thisUser.save(function(err, user) {
                    if (err) {
                        res.status(500).json(err);
                    } else {
                        res.status(201).json(user);
                    }
                });
            } else {
                // Respond with Unauthorized access.
                res.status(401).json({'error': 'Access Not Authorized.'});
            }
        }
    );

    // Route for getting user information based on their facebook id.
    app.get('/api/v1/user/:id', passport.authenticate(['facebook-token']),
        userController.findUserById);

    // Route for getting user information based on query.
    app.get('/api/v1/user', passport.authenticate(['facebook-token']),
        userController.findUserByQuery);

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
