'use strict';
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var conversationSchema = new Schema({
    conversationID: {type: String, required: true},
    members: [{type: Schema.ObjectId, ref: 'User'}],
    messages: [{
        message: [{type: Schema.ObjectId, ref: 'Message'}]
    }],
    date: {type: Date}
});

// create a model based on the schema provided.
mongoose.model('Conversation', conversationSchema);
