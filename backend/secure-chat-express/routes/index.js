var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', {
		title: 'CECS 478 App. End to End Encryption Messaging. ShushApi'
	});
});

module.exports = router;
