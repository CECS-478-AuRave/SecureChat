// expose configuration directly using module.exports.

module.exports = {
    'facebookAuth': {
        'clientID': process.env.FACEBOOK_CLIENT_ID,
        'clientSecret': process.env.FACEBOOK_CLIENT_SECRET,
        'callbackURL': process.env.FACEBOOK_CALLBACK_URL
    }
}
