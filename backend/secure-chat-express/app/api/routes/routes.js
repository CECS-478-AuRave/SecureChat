var mongoose = require('mongoose');
var User = mongoose.model('User');

module.exports = function(app, passport) {

    // Route for main page where status response is 200.
    // app.get('/', isLoggedIn, function(req, res) {
    //     res.writeHead(200, {'Content-Type': 'application/json'});
    //     res.end('{login:success}');
    // });

    app.post('/api/v1/login',
        passport.authenticate(['facebook-token']),
        function(req, res) {
            if (req.user) {
                res.status(200).json({'login': 'yes',
                                      'user': req.user});
            } else {
                res.status(401).json({'login': 'no',
                                      'user': 'Hello Darkness My Old Friend'});
            }
        });


    /// Route for login page where respond with status 401.
    // app.get('/login', function(req, res) {
    //     res.writeHead(401, {'Content-Type': 'application/json'});
    //     res.end('{login:failure}');
    // });

    // // Routes for facebook authentication
    // app.get('/auth/facebook', passport.authenticate('facebook'));
    //
    // // Route for callback handling after facebook authentication
    // app.get('/auth/facebook/callback',
    //     passport.authenticate(
    //         'facebook', {
    //                 successRedirect: '/',
    //                 failureRedirect: '/login',
    //         }
    //     ));
    // Route for logging out, if the user is already logged in.
    // app.get('/logout', isLoggedIn, function(req, res) {
    //     req.logout();
    //     res.redirect('/login');
    // });

    // Route for getting user information based on their facebook id.
    app.get('/api/v1/user/id/:id',
        passport.authenticate(['facebook-token']),
        function(req, res) {
            if (req.user) {
                var facebookID = req.params.id;

                // check if the id was passed in the parameter.
                if (!facebookID) {
                    res.status(404).json({'error': 'ID is required to find user.'});
                    return;
                }

                // Find the user based on their facebookID and return the data
                // stored in the database.
                User.findOne({'facebook.id' : facebookID}, findUser);
            } else {
                res.status(401).json({'error': 'Access Not Authorized.'})
            }
        });

    // Route for getting user information based on their email.
    app.get('/api/v1/user/email/:email',
        passport.authenticate(['facebook-token']),
        function(req, res) {
            if (req.user) {
                var email = req.params.email;

                // Check if the email was passed in the parameter.
                if (!email) {
                    res.status(404).json({'error': 'email is required to find user'});
                    return;
                }

                User.findOne({'email' : email}, findUser);
            } else {
                res.status(401).json({'error': 'Access Not Authorized.'});
            }
        });
};

var findUser = function(err, user) {
    if (!user) {
        // if the user wasn't found.
        res.status(404).json({'error': 'User was not found.'});
    } else if (err) {
        // if there was an error.
        res.status(404).json(err);
    } else {
        // if there wasn't an error and the user was found.
        res.status(200).json(user);
    }
};
// var isLoggedIn = function(req, res, next) {
//
//     // If the user is already authenticated then continue.
//     if (req.isAuthenticated()) {
//         return next();
//     }
//
//     // Redirect to login page if the user isn't logged in
//     res.redirect('/login');
// }
