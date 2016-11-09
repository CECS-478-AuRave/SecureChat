'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var messageSchema = new Schema({
    message: {type: String, required: true},
    from: {type: String, required: true},
    date: {type: Date, required: true},
});

mongoose.model('Message', messageSchema);
