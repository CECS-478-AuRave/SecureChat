'use strict';
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var messageSchema = new Schema({
    message: {type: String, required: true},
    from: {type: String, required: true},
    date: {type: Date, required: true}
});

var conversationSchema = new Schema({
    _id: {type: String, required},
    members: [{type: String, required: true}],
    message: [messageSchema],
    date: {type: Date}
});

mongoose.model('Conversation', conversationSchema);
