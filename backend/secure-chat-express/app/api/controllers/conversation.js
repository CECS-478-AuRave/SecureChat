var mongoose = require('mongoose');

var User = mongoose.model('User');
var Conversation = mongoose.model('Conversation');
var Message = mongoose.model('Message');

var findAndCreateConversation = function(req, res, members, message, thisUser) {
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
            // Create the new Message.
            var newMessage = createMessage(message, thisUser, currentTime);
            // Create new Conversation.
            createConversation(req, res, groupID, members, currentTime, newMessage);
        } else {
            // You cannot create another conversation with the same person.
            // So, respond with status 400 and an json object with an error
            // message appended.
            res.status(400).json({'error': 'Conversation Already Exists'});
        }
    });
}

var createMessage = function(message, thisUser, currentTime) {
    var newMessage = new Message({
        'message' : message,
        from : thisUser.name,
        date : currentTime
    });
    newMessage.save(function(err, message) {
        if (err) {
            res.status(500).json(err);
        }
    });
    return newMessage;
}

var createConversation = function(req, res, groupID, members, currentTime, newMessage) {
    // Since the conversation didn't exist we need to create a
    // new conversation.
    var newConversation = new Conversation({
        conversationID : groupID,
        'members' : members,
        date : currentTime,
        message : [newMessage._id]
    });
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
            .populate('members message')
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
            }
          );
        }
    });
}

// Controller logic to post a new conversation.
module.exports.postConversation = function(req, res) {
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
        findAndCreateConversation(req, res, members, message, thisUser);
    } else {
        // Respond with Unauthorized access.
        res.status(401).json({'error': 'Access Not Authorized.'});
    }
};

var addNewMessage = function(req, res, message, user, conversation) {
    var currentTime = Date.now();
    // Change the conversation date to be the current time
    // since it's the latest time that the message was sent.
    conversation.date = currentTime;
    // Creates a new message to put into the conversation.
    var newMessage = createMessage(message, user, currentTime);
    // append the message to the conversation.
    conversation.message.push(newMessage._id);
    // Save the conversation schema
    conversation.save(function(err, conversation) {
        if (err) {
            // Server error when saving the conversation,
            // respond with status 500 and the error object.
            res.status(500).json(err);
        } else {
            // Succfully saved the conversation. Respond with the populated
            // members and message field having an _id of the updated
            // conversation _id.
            Conversation
                .findById(conversation._id)
                .populate('members message')
                .exec(function(err, conversation) {
                    if (err) {
                        // Server error when saving the conversation,
                        // respond with status 500 and the error object.
                        res.status(500).json(err);
                    } else {
                        // respond with the updated conversation document.
                        res.status(201).json(conversation);
                    }
                }
            );
        }
    });
}

// Controller for putting a new Message in a Conversation.
module.exports.putConversation = function(req, res) {
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
                    addNewMessage(req, res, message, req.user, conversation);
                }
            }
        );
    } else {
        // Respond with Unauthorized access.
        res.status(401).json({'error': 'Access Not Authorized.'});
    }
};

// Controller to get all Conversations.
module.exports.getConversation = function(req, res) {
    // Check if the user was authenticated
    if (req.user) {
        // get the authenticated user's facebook id.
        var thisUserID = req.user._id;
        // Find all conversations containing the current user's facebook id.
        Conversation
          .find({members: {$in: [thisUserID]}})
          .populate('members message')
          .exec(function(err, conversation) {
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
};
