"use strict";

var mongoose = require('mongoose');

var User = mongoose.model('User');

// Controller logic for searching a user based on a query string.
module.exports.findUserByQuery = function(req, res) {
    // Check if the user was authenticated
    if (req.user) {
        // set queryString variable to be from the requested query string.
        var queryString = req.query.queryString;
        // Check if queryString was provided
        if (!queryString) {
          res.status(400).json({'error': 'queryString required in query'});
          return;
        }
        // search based on the queryString provided
        User.search(queryString, function(err, result) {
            if (err) {
              // if there was an error respond with status 500
              // and the err information.
              res.status(500).json(err);
            } else if (!result || result.length === 0) {
              // if the result wasn't found respond with status 404
              // and the information stating results were not found.
              res.status(404).json({'error' : 'No Results Found.'});
            } else {
              // the results were found and responding with it as a list of
              // json object.
              res.status(200).json(result);
            }
          });
        } else {
        // Respond with Unauthorized access.
        res.status(401).json({'error': 'Access Not Authorized.'});
    }
};

// Controller logic for finding a user by their facebook Id
module.exports.findUserById = function(req, res) {
    // Check if the user was authenticated
    if (req.user) {
        var facebookID = req.params.id;

        // check if the id was passed in the parameter.
        if (!facebookID) {
            res.status(404).json({'error': 'ID is required to find user.'});
            return;
        }

        // Find the user based on their facebookID and return the data
        // stored in the database.
        User.findOne({'facebook.id' : facebookID}, function(err, user) {
            if (!user) {
                // if the user wasn't found respond with status 404
                // and the information stating User was not found.
                res.status(404).json({'error': 'User was not found.'});
            } else if (err) {
                // if there was an error respond with status 500
                // and the err information.
                res.status(500).json(err);
            } else {
                // if there wasn't an error and the user was found.
                // respond with status 200 and user's information
                res.status(200).json(user);
            }
        });
    } else {
        // Respond with Unauthorized access.
        res.status(401).json({'error': 'Access Not Authorized.'});
    }
};
