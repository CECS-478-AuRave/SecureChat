var express = require('express'),
    router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', {
        title: 'CECS 478 App. End to End Encryption Messaging. ShushApi'
    });
});

router.get('/auth/facebook', passport.authenticate('facebook'));

router.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
        successRedirect: '/',
        failureRedirect: '/login'
    }));

module.exports = router;
