var mongoose = require('mongoose');
var User = mongoose.model('User');
var Conversation = mongoose.model('Conversation');
var Message = mongoose.model('Message');

var respondWithConversation = function(res, conversation, status) {
    // Respond with status 200 and the whole conversation as a json object.
    Conversation.populate(conversation, {
        path : 'messages.message.from messages.message.issuedTo',
        select : 'name profilePhotoURL',
        model : 'User'
    }, function(err, conversation) {
        if (err) {
            // Respond with status 500 since there was an error populating conversation.
            res.status(500).json(err);
        }
        res.status(status).json(conversation);
    });
}

var findAndCreateConversation = function(res, members, messages, thisUser) {
    // GroupID is the sorted facebookID that's joined altogether.
    var groupID = members.sort().join('_');
    // sets currentTime variable
    var currentTime = Date.now();
    // Array to hold messages.
    var newMessages = [];
    // Find a group based on the groupID provided.
    Conversation.findOne({conversationID: groupID}, function(err, conversation) {
        if (err) {
            // Respond with internal server error and the err object since
            // there was an error with the given query.
            res.status(500).json(err);
        } else if (!conversation) {
            // Create the new Message.
            for (let i = 0; i < members.length; i++) {
                otherUserId = members[i];
                // object containing information for a given message.
                var messageInformation = {
                    message: messages[otherUserId].message,
                    thisUser: thisUser,
                    currentTime: currentTime,
                    otherUserId: otherUserId,
                    messageKey: messages[otherUserId].messageKey
                };
                // Create new Conversation.
                newMessages.push(createMessage(res, messageInformation));
                if (i == members.length - 1) {
                    createConversation(res, groupID, members, currentTime, newMessages);
                    return;
                }
            }
        } else {
            // You cannot create another conversation with the same person.
            // So, respond with status 400 and an json object with an error
            // message appended.
            res.status(409).json({'error': 'Conversation Already Exists'});
        }
    });
}

var createMessage = function(res, messageInformation) {
    var newMessage = new Message({
        'message' : messageInformation.message,
        from : messageInformation.thisUser._id,
        date : messageInformation.currentTime,
        issuedTo: messageInformation.otherUserId,
        messageKey: messageInformation.messageKey
    });
    // save the new message that's been created.
    newMessage.save(function(err, message) {
        if (err) {
            res.status(500).json(err);
        }
    });
    return newMessage;
}

var createConversation = function(res, groupID, members, currentTime, newMessage) {
    // Since the conversation didn't exist we need to create a
    // new conversation.
    var newConversation = new Conversation({
        conversationID : groupID,
        'members' : members,
        date : currentTime,
        messages : []
    });
    // add the new message to the conversation.
    newConversation.messages.push({
        message : newMessage
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
            .populate('messages.message')
            .exec(function(err, conversation) {
              if (err) {
                // Respond with internal server error and the err object since
                // there was an error with the given query.
                res.status(500).json(err);
              } else {
                // respond to the client with status 201 and the
                // convesation object.
                // res.status(201).json(conversation);
                respondWithConversation(res, conversation, 201);
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
        var messages = jsonObject.messages;

        // Check if members exists from the json object.
        if (!members || members.length == 0) {
            res.status(400).json({'error': 'Member value required.'});
            return;
        }
        // Check if the message exists from the json object.
        if (!messages || messages.length == 0) {
            res.status(400).json({'error': 'Message value required.'});
            return;
        }
        // Add the current user's facebook id to the members since
        // we will be using it as the groupID.
        members.push(thisUser._id);
        findAndCreateConversation(res, members, messages, thisUser);
    } else {
        // Respond with Unauthorized access.
        res.status(401).json({'error': 'Access Not Authorized.'});
    }
};

var addNewMessage = function(res, jsonInformation, conversation) {
    // Change the conversation date to be the current time
    // since it's the latest time that the message was sent.
    conversation.date = jsonInformation.currentTime;
    var newMessages = [];
    // Creates a new message to put into the conversation.
    for (let i = 0; i < conversation.members.length; i++) {
        // object containing information for a given message.
        //otherUserId = conversation.members[i]
        var messageInformation = {
            message: messages[conversation.members[i]].message,
            thisUser: thisUser,
            currentTime: currentTime,
            otherUserId: conversation.members[i],
            messageKey: messages[conversation.members[i]].messageKey
        };
        newMessages.push(createMessage(res, messageInformation));
        if (i === conversation.members.length - 1) {
            // append the message to the conversation.
            conversation.messages.push({
                message: newMessages
            });
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
                        .populate('messages.message')
                        .exec(function(err, conversation) {
                            if (err) {
                                // Server error when saving the conversation,
                                // respond with status 500 and the error object.
                                res.status(500).json(err);
                            } else {
                                // respond with the updated conversation document.
                                respondWithConversation(res, conversation, 201);
                            }
                        }
                    );
                }
            });
        }
    }
}

module.exports.putConversation = function(req, res) {
    // Check if the user was authenticated.
    if (req.user) {
        // Get the message json object from the body.
        var jsonObject = req.body;
        // Get the authenticated user.
        jsonObject['thisUser'] = req.user;
        // Set the currentTime to the jsonObject
        jsonObject['currentTime'] = Date.now();
        // Check if the message was passed into the body.
        if (!jsonObject.messages) {
            res.status(400).json({'error' : 'messages required in body'});
        }
        // Check if the conversationID was passed into the body.
        if (!jsonObject.conversationID && jsonObject.conversationID.length === 0) {
            res.status(400).json({'error' : 'conversationID required in body'});
        }
        // Find a conversation based on the conversation ID
        Conversation
            .findOne({'conversationID': jsonObject.conversationID})
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
                    // jsonObject has ['messages', 'conversationID', 'thisUser']
                    addNewMessage(res, jsonObject, conversation);
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
        // Find all conversations containing the current user's id.
        Conversation
        .find({members: {$in: [thisUserID]}})
        .populate('messages.message members')
        .exec(function(err, conversation) {
            if (!conversation || conversation.length == 0) {
                // Respond with status 200 and an empty array.
                res.status(200).json([]);
            } else if (err) {
                // Respond with status 500 since there was an error finding conversation.
                res.status(500).json(err);
            } else {
                respondWithConversation(res, conversation, 200);
            }
        });
    } else {
        // Respond with Unauthorized access.
        res.status(401).json({'error': 'Access Not Authorized.'});
    }
};
