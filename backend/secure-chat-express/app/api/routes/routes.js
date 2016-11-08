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
    app.get('/api/v1/user/:id/publicKey',
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
