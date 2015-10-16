var express = require('express'),
    router = express.Router(),
    passwordless = require('passwordless'),
    orangeAPI = require('./../controllers/orange'),
    User = require('./../models/User'),
    RethinkDBStore = require('passwordless-rethinkdbstore');

passwordless.init(new RethinkDBStore({host: '127.0.0.1', port: 28015, db: 'farmconnecta'}));

passwordless.addDelivery(
    function(tokenToSend, uidToSend, recipient, callback) {
        var message = "Access your FarmConnecta account here : http://farmconnecta.com/?token"+ tokenToSend + '&uid=' + encodeURIComponent(uidToSend);
        orangeAPI.sendSMS(recipient, message)
    }, function(err, message){
        if(err) {
            console.log(err);
        }
        console.log(message);
        callback(err);
    });


/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('respond with a resource');
    next();
});

/* POST login details. */
router.post('/sendtoken',
    passwordless.requestToken(
        function(user, delivery, callback, req) {
            User.findByNumber(req.body.user, function(err, user){
                if(user.number === user){
                    return callback(null, user.id)
                }
                callback(null, null)
            });
            //callback(null, user);
        }), { failureRedirect: '/login' } ,
    function(req, res) {
        console.log("Success");
        // success!
        res.send("SMS sent");
    });

module.exports = router;
