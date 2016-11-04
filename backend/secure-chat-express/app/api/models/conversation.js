'use strict';
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var conversationSchema = new Schema({
    conversationID: {type: String, required: true},
    members: [{type: Schema.ObjectId, ref: 'User'}],
    message: [{type: Schema.ObjectId, ref: 'Message'}],
    date: {type: Date}
});

mongoose.model('Conversation', conversationSchema);
