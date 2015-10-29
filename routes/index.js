var express = require('express'),
    path = require('path'),
    util = require('util'),
    fs = require('fs'),
    ejs = require('ejs'),
    router = express.Router(),
    request = require('request'),
    _ = require('underscore'),
    moment = require('moment'),
    thinky = require('./../config/thinky.js'),
    r = thinky.r,
    type = thinky.type,
    Listing = require('./../models/Listing'),
    Farmer = require('./../models/Farmer'),
    orangeAPI = require('./../controllers/orange'),
    secrets = require('./../secrets/secrets'),
    Pusher = require('pusher'),
    passwordless = require('passwordless'),
    RethinkDBStore = require('passwordless-rethinkdbstore');


var pusher = new Pusher({
    appId: secrets.pusher.app_id,
    key:  secrets.pusher.key,
    secret:  secrets.pusher.secret,
    encrypted: true
});

pusher.port = 443;


/* GET home page. */
router.get('/', function(req, res) {
    res.render('index', { title: 'FarmConnecta' });
});

router.post('/orange/smsdr', function(req, res, next) {
    console.log("Request: ", req.body);
    console.log("Response: ", res);
    next();
});

router.get('/orange/smsdr', function(req, res, next) {
    console.log("Request: ", req.body);
    console.log("Response: ", res);
    next();
});

router.get('/orange/ussd', function(req, res, next) {
    console.log("Request: ", req.body);
    //console.log("Response: ", res);
    res.sendFile(path.join(__dirname, '../views/ussd', 'index.html'));
});

router.get('/orange/ussd/subscribe', function(req, res, next) {

    var data = {
        senderAddress: req.headers['user-msisdn'],
        messageId: req.headers['activityid']
    };

    orangeAPI.chargeUser(data, 5, function(res){
        if(res.amountTransaction.transactionOperationStatus === 'Charged'){

            var number = res.amountTransaction.endUserId.substr(7);

            User.findById('number', function(err, _user){
                var user = {};
                if(!_user){
                    user = new User({
                        id: number,
                        number: number,
                        keyword: req.query.response
                    });
                    user.save().then(function(result){
                        console.log(result);
                        res.sendFile(path.join(__dirname, '../orange/ussd', 'end-subscriber.html'));
                    }).error(function(err){
                        console.log({message: err});
                    });
                }

                if(_user){
                    user = {
                        number: number,
                        keyword: req.query.response
                    };

                    user.save().then(function(result){
                        console.log(result);
                        res.sendFile(path.join(__dirname, '../orange/ussd', 'subscribe-success.html'));
                    }).error(function(err){
                        console.log({message: err});
                    });
                }
            });

        } else{
            res.sendFile(path.join(__dirname, '../orange/ussd', 'subscribe-error.html'));
        }
        console.log("Here comes the res from the CB: ", res);
    });

});

router.get('/orange/ussd/matimela', function(req, res, next) {

    orangeAPI.chargeUser(data, 5, function(res){
        if(res.amountTransaction.transactionOperationStatus === 'Charged'){

            var number = req.headers['user-msisdn'].substr(7);

            User.findById('number', function(err, _user){
                var user = {};
                if(!_user){
                    user = new User({
                        id: number,
                        number: number,
                        brand: req.query.response
                    });
                    user.save().then(function(result){
                        console.log(result);
                        res.sendFile(path.join(__dirname, '../orange/ussd', 'end-subscriber.html'));
                    }).error(function(err){
                        console.log({message: err});
                    });
                }

                if(_user){
                    user = {
                        brand: req.query.response
                    };

                    user.save().then(function(result){
                        console.log(result);
                        res.sendFile(path.join(__dirname, '../orange/ussd', 'subscribe-success.html'));
                    }).error(function(err){
                        console.log({message: err});
                    });
                }
            });

        } else{
            res.sendFile(path.join(__dirname, '../orange/ussd', 'subscribe-error.html'));
        }
        console.log("Here comes the res from the CB: ", res)
    });
});

router.get('/orange/ussd/listings', function(req, res, next) {

    var listings;

    r.table("Listing").orderBy(r.desc('date')).run().then(function(listings){
        res.render('listings_ussd', {'listings': listings, 'moment' : moment});
    }).error(function(err){
        console.log(err);
        return res.json({message: err}).status(401);
    });
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

            orangeAPI.chargeUser(data);

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

router.get('/farmers', function(req, res, next) {

        var farmers;

        r.table("Farmer").orderBy(r.desc('dateCreated')).run().then(function(farmers){
            res.json(farmers);
            //res.render('listings', {'listings': fa, 'moment' : moment});
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

router.get('/logout',
    passwordless.logout(),
    function(req, res) {
        res.redirect('/');
    });


module.exports = router;