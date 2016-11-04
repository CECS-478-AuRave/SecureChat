var mongoose = require('mongoose');
var User = mongoose.model('User');
var Conversation = mongoose.model('Conversation');

var findAndCreateConversation = function(req, res, groupID, members, currentTime, thisUser, message) {
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
            saveAndReturnNewConversation(req, res, newConversation);
        } else {
            // You cannot create another conversation with the same person.
            // So, respond with status 400 and an json object with an error
            // message appended.
            res.status(400).json({'error': 'Conversation Already Exists'});
        }
    });
}

var saveAndReturnNewConversation = function(req, res, newConversation) {
    // We need to save the conversation and return the conversation object.
    newConversation.save(function(err, conversation) {
        if (err) {
            // Error in saving the new conversation
            res.status(500).json(err);
        } else {
            // Find a conversation based on the new conversation's id
            // , populate the members field, and return the
            // conversation.
            Conversation
            .findById(conversation._id)
            .populate('members')
            .exec(function(err, conversation) {
                if (err) {
                    // Respond with internal server error and the err object since
                    // there was an error with the given query.
                    res.status(500).json(err);
                } else {
                    // respond to the client with status 201 and the
                    // convesation object.
                    res.status(201).json(conversation);
                }
            });
        }
    });
}

module.exports.createConversation = function(req, res) {
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
        // GroupID is the sorted facebookID that's joined altogether.
        var groupID = members.sort().join('_');
        var currentTime = Date.now();
        findAndCreateConversation(req, res, groupID, members, currentTime, thisUser, message);
    } else {
    // Respond with Unauthorized access.
    res.status(401).json({'error': 'Access Not Authorized.'});
    }
};
