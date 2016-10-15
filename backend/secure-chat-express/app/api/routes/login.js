module.exports = function(app, passport) {

    // Route for main page where status response is 200.
    app.get('/', isLoggedIn, function(req, res) {
        res.status(200).end();
    });

    /// Route for login page where respond with status 401.
    app.get('/login', function(req, res) {
        res.status(401).end();
    });

    // Routes for facebook authentication
    app.get('/auth/facebook', passport.authenticate('facebook'));

    // Route for callback handling after facebook authentication
    app.get('/auth/facebook/callback',
        passport.authenticate(
            'facebook', {
                    successRedirect: '/',
                    failureRedirect: '/login',
            }
        )
    );

    // Route for logging out, if the user is already logged in.
    app.get('/logout', isLoggedIn, function(req, res) {
        req.logout();
        res.status(200).redirect('/login');
    });
};

var isLoggedIn = function(req, res, next) {

    // If the user is already authenticated then continue.
    if (req.isAuthenticated()) {
        return next();
    }

    // Redirect to login page if the user isn't logged in
    res.redirect('/login');
}
