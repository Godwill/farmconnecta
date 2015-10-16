var express = require('express'),
    router = express.Router(),
    passwordless = require('passwordless'),
    orangeAPI = require('./../controllers/orange'),
    User = require('./../models/User'),
    RethinkDBStore = require('passwordless-rethinkdbstore');

passwordless.init(new RethinkDBStore({host: '127.0.0.1', port: 28015, db: 'farmconnecta'}));

passwordless.addDelivery(
    function(tokenToSend, uidToSend, recipient, callback) {
        var message = "Access your FarmConnecta account here : http://farmconnecta.com/?token"+ tokenToSend + '&uid='
            + encodeURIComponent(uidToSend);

        orangeAPI.sendSMS(recipient, message)
    });


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

/* POST login details. */
router.post('/sendToken',
    passwordless.requestToken(
        function(user, delivery, callback, req) {
            User.findByNumber(number, function(err, user){
                if(user){
                    callback(null, user.id);
                } else{
                    callback(null, null)
                }
            });
        }),
    function(req, res) {
        // success!
        res.render('sent');
    });

module.exports = router;
