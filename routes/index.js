var express = require('express'),
    util = require('util'),
    router = express.Router(),
    request = require('request'),
    _ = require('underscore'),
    moment = require('moment'),
    thinky = require('./../config/thinky.js'),
    r = thinky.r,
    type = thinky.type,
    Listing = require('./../models/Listing'),
    secrets = require('./../secrets/secrets'),
    Pusher = require('pusher');


var pusher = new Pusher({
    appId: secrets.pusher.app_id,
    key:  secrets.pusher.key,
    secret:  secrets.pusher.secret,
    encrypted: true
});

pusher.port = 443;

var chargeUser = function(data){

    var usernum = data.senderAddress.substr(7);

    var data = {
        "endUserId":"tel:+99" + usernum,
        "transactionOperationStatus":"Charged",
        "chargingInformation":{
            "description":"Test chargeAmount for the challenge documentation",
            "amount":5,
            "currency":"XOF"
        },
        chargingMetaData:{
            "serviceID":"Test ServiceID #1",
            "productID":"Test ProductID #1"
        },
        "referenceCode":"REF-TestReference" + data.messageId,
        "clientCorrelator":"TestReference"  + data.messageId
    };

    request({
        method: 'POST',
        uri: 'https://api.sdp.orange.com/payment/v1/tel%3A%2B' + usernum + '/transactions/amount',
        headers: {
            'Authorization': 'Bearer ' + secrets.orange.token,
            'content-type': 'application/json'
        },
        json : data
    }, function (error, response, body) {
        if(response.statusCode == 201){
            console.log("The response: ", response)
        } else {
            console.log('error: '+ response.statusCode)
            console.log(body)
        }
    })
};


/* GET home page. */
router.get('/', function(req, res) {
    res.render('index', { title: 'FarmConnecta' });
});

router.post('/orange/smsmo', function(req, res, next) {

    var data = req.body.inboundSMSMessageNotification.inboundSMSMessage;

    var listing = new Listing({
        sender: data.senderAddress,
        destination: data.destinationAddress,
        messageId: data.messageId,
        message: data.message
    });

    if(_.isEmpty(data) === false){

        var subscribe = 'subscribe';

        if(data.message.toUpperCase() === subscribe.toUpperCase()){

            console.log("Going in, the message contains ", data.message);

            chargeUser(data);

        }

        if(data.message.toUpperCase() !== subscribe.toUpperCase()){

            console.log("Going in, the message does not contains ", data.message);

            listing.save().then(function(result){

                pusher.trigger('sms_channel', 'new_sms', {
                    result: result
                });

                console.log(result);
                res.status(200)
                    .send({ success: true}
                );

            }).error(function(err){
                console.log({message: err});
            });
        }
    }

    next();

});

router.get('/listings', function(req, res, next) {

    var listings;

    r.table("Listing").orderBy(r.desc('date')).run().then(function(listings){
        res.render('listings', {'listings': listings, 'moment' : moment});
    }).error(function(err){
        console.log(err);
        return res.json({message: err}).status(401);
    });
});

router.get('/api/listings', function(req, res, next) {

    r.table("Listing").orderBy(r.desc('date')).run().then(function(listings){
        return res.json(listings);
    }).error(function(err){
        return res.json({message: err}).status(401);
    });

});

router.get('/login', function(req, res) {
    res.render('login', { title: 'Login' });
});

router.get('/about', function(req, res) {
    res.render('about', { title: 'About' });
});

router.get('/logout', function(req, res) {
    console.log("I am being probed");
});


module.exports = router;
