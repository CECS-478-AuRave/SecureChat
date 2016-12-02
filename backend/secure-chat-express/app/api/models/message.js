'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var messageSchema = new Schema({
    message: {type: String, required: true},
    from: {type: Schema.ObjectId, ref: 'User', required: true},
    date: {type: Date, required: true},
    issuedTo: {type: Schema.ObjectId, ref: 'User', required: true},
    messageKey: {type: String, required: true}
});

mongoose.model('Message', messageSchema);
