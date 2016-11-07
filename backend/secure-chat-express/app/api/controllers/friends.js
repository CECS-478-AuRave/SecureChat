var mongoose = require('mongoose');
var User = mongoose.model('User');
var Conversation = mongoose.model('Conversation');

// Controller for adding a friend request.
module.exports.addFriend = function(req, res) {
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
            } else if (user.pendingFriends.indexOf(req.user.facebook.id) != -1) {
                res.status(400).json({'error': 'Already pending friend request'});
            } else if (user.friends.indexOf(req.user.facebook.id) != -1) {
                res.status(400).json({'error': 'User is already a friend.'})
            } else {
                // Push the authenticated friend's id to the facebook id.
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
};

// Controller for declining a friend request.
module.exports.declineFriend = function(req, res) {
    // Check if the user was authenticated.
    if (req.user) {
        // Get the current user profile.
        var thisUser = req.user;
        // Get the friend's user id passed from the body.
        var otherUserID = req.body.otherUserID;
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
        thisUser.pendingFriends.splice(idIndex, 1);
        // Save the current user schema.
        thisUser.save(function(err, user) {
            if (err) {
                // error with save respond with status 500 and
                // error information.
                res.status(500).json(err);
            } else {
                // deleting from the user was succesful and respond with
                // status code 201.
                res.status(201).json({'message': 'Successfully removed pending friend.'});
            }
        });
    } else {
        // Respond with Unauthorized access.
        res.status(401).json({'error': 'Access Not Authorized.'});
    }
};

// Controller for accepting a friend request.
module.exports.acceptFriend = function(req, res) {
    // Check if the user was authenticated
    if (req.user) {
        // Get the current user profile.
        var thisUser = req.user;
        // Get the friend's user id passed from the body.
        var otherUserID = req.body.otherUserID;
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
        thisUser.pendingFriends.splice(idIndex, 1);
        User.findOne({'facebook.id':otherUserID}, function(err, otherUser) {
            if (!otherUser) {
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
                otherUser.save(function(err, otherUser) {
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
};

// Controller for deleting a friend.
module.exports.deleteFriend = function(req, res) {
    if (req.user) {
        var thisUser = req.user;
        var otherUserID = req.body.otherUserID;
        var otherIdIndex = thisUser.friends.indexOf(otherUserID);
        var thisFacebookId = thisUser.facebook.id;
        if (!otherUserID) {
            res.status(400).json({'error' : 'otherUserID required in body'});
            return;
        }
        if (otherIdIndex == -1) {
            res.status(400).json({'error': 'That user is not your friend.'});
            return;
        }
        thisUser.friends.splice(otherIdIndex, 1);
        thisUser.save(function(err, thisUser) {
            if (err) {
                res.status(500).json(err);
            }
        });
        User.findOne({'facebook.id':otherUserID}, function(err, otherUser) {
            if (!otherUser) {
                res.status(404).json({'error':'Other User was not found.'});
            } else if (err) {
                res.status(500).json(err);
            } else {
                var thisIdIndex = otherUser.friends.indexOf(thisFacebookId);
                if (thisIdIndex == -1) {
                    res.status(400).json({'error': 'That user is not your friend.'});
                    return;
                }
                otherUser.friends.splice(thisIdIndex, 1);
                otherUser.save(function(err, otherUser) {
                    if (err) {
                        res.status(500).json(err);
                    } else {
                        res.status(201).json({'message': 'Successfully deleted friend.'});
                    }
                });
            }
        });
    } else {
        // Respond with Unauthorized access
        res.status(401).json({'error': 'Access Not Authorized'});
    }
}
