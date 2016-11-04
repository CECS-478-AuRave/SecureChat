'use strict';
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var messageSchema = new Schema({
    message: {type: String, required: true},
    from: {type: String, required: true},
    date: {type: Date, required: true}
});

var conversationSchema = new Schema({
    conversationID: {type: String, required: true},
    members: [{type: Schema.ObjectId, ref: 'User'}],
    message: [messageSchema],
    date: {type: Date}
});

mongoose.model('Conversation', conversationSchema);
