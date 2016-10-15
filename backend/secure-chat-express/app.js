var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var passport = require('passport');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var flash = require('connect-flash');
var session = require('express-session');
// var routes = require('./app/api/routes/index');
// var login = require('./app/api/routes/login');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', routes);
// app.use('/login', login);

// Configuration file for using passport
require('./app/routes/Facebook/passport.js')(passport);

// required for passport sessions
app.use(session({
    secret: process.env.SESSION_SECRET
}));

// initalize passport authentication
app.use(passport.initalize());

// used for persistent login sessions.
app.use(passport.session());
app.use(flash());

// use the routes specified
require('./app/api/routes/login.js')(app, passport);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

//https support
//following: https://jaredreich.com/blog/how-to-create-nodejs-server/
//and https://github.com/RnbWd/ssltest/blob/master/bin/www
var http = require('http');
// var https = require('https');
var fs = require('fs');
// var privateKey = fs.readFileSync('ssl/privkey.pem');
// var certificate = fs.readFileSync('ssl/cert.pem');
// var CACertificate = fs.readFileSync('ssl/chain.pem');
// var credentials = {
// 	key: privateKey,
// 	cert: certificate,
// 	ca: CACertificate
// };

var httpServer = http.createServer(app);
// var httpsServer = https.createServer(credentials, app);

httpServer.listen(4780);
// httpsServer.listen(4781);


module.exports = app;
