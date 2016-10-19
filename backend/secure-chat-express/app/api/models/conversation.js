'use strict';
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var messageSchema = new Schema({
    message: {type: String, required: true, maxlength: 240},
    from: {type: String, required: true},
    date: {type: Date, default: Date.now}
});

var conversationSchema = new Schema({
    members: [{type: String, required: true}],
    message: [messageSchema];
});

mongoose.model('Conversation', conversationSchema);
