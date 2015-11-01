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
    User = require('./../models/User'),
    orangeAPI = require('./../controllers/orange'),
    methods = require('./../controllers/index'),
    secrets = require('./../secrets/secrets'),
    Pusher = require('pusher'),
    _ = require('underscore'),
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

router.post('/orange/smsdr/', function(req, res, next) {
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

    orangeAPI.chargeUser(data, 5, function(body) {
        console.log("The body: ", body);

        if(body.requestError) {
            res.sendFile(path.join(__dirname, '../views/ussd', 'subscribe-error.html'));
        }

        if(body.amountTransaction){
            if(body.amountTransaction.transactionOperationStatus === 'Charged'){

                var number = body.amountTransaction.endUserId.substr(7);

                r.table("User").get(number).run().then(function(result){
                    var user = {};
                    console.log("The user response: ", result);
                    if(result){
                        user = {
                            keyword: req.query.response,
                            dateUpdated: Date.now()
                        };

                        r.table("User").get(number).update(user).run().then(function(result){
                            console.log(result);
                            res.sendFile(path.join(__dirname, '../views/ussd', 'subscribe-success.html'));
                        }).error(function(err){
                            console.log({message: err});
                        });
                    }

                    if(!result){
                        user = new User({
                            id: number,
                            number: number,
                            keyword: req.query.response
                        });
                        user.save().then(function(result){
                            console.log(result);
                            res.sendFile(path.join(__dirname, '../views/ussd', 'subscribe-success.html'));
                        }).error(function(err){
                            console.log({message: err});
                        });
                    }

                });

            } else{
                res.sendFile(path.join(__dirname, '../views/ussd', 'subscribe-error.html'));
            }
        }

    });

});

router.get('/orange/ussd/matimela', function(req, res, next) {

    var headers = req.headers;

    var data = {
        senderAddress: headers['user-msisdn'],
        messageId: headers['activityid']
    };

    orangeAPI.chargeUser(data, 5, function(body){

        if(body.requestError) {
            res.sendFile(path.join(__dirname, '../views/ussd', 'subscribe-error.html'));
        }

        if(body.amountTransaction){
            if(body.amountTransaction.transactionOperationStatus === 'Charged'){

                var number = body.amountTransaction.endUserId.substr(7);
                r.table("User").get(number).run().then(function(result){
                    var user = {};
                    console.log("The user response: ", result);
                    if(result){
                        user = {
                            brand: req.query.response,
                            dateUpdated: Date.now()
                        };

                        r.table("User").get(number).update(user).run().then(function(result){
                            console.log(result);
                            res.sendFile(path.join(__dirname, '../views/ussd', 'subscribe-success.html'));
                        }).error(function(err){
                            console.log({message: err});
                        });
                    }

                    if(!result){
                        user = new User({
                            id: number,
                            number: number,
                            brand: req.query.response
                        });
                        user.save().then(function(result){
                            console.log(result);
                            res.sendFile(path.join(__dirname, '../views/ussd', 'subscribe-success.html'));
                        }).error(function(err){
                            console.log({message: err});
                        });
                    }

                });

            } else{
                res.sendFile(path.join(__dirname, '../views/ussd', 'subscribe-error.html'));
            }
        }

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

router.get('/notifications/matimela', function(req, res, next) {

        _.intersectionObjects = _.intersect = function(array) {
            var slice = Array.prototype.slice;
            var rest = slice.call(arguments, 1);
            return _.filter(_.uniq(array), function(item) {
                return _.every(rest, function(other) {
                    //return _.indexOf(other, item) >= 0;
                    return _.any(other, function(element) { return _.isEqual(element, item); });
                });
            });
        };

        var matimela = function(cb){
            r.table("Matimela").orderBy(r.desc('dateCreated')).run().then(function(results){
                //res.json(results);
                //console.log(obj.matimela);
                //console.log(results);
                return cb(results);
            }).error(function(err){
                console.log(err);
                return res.json({message: err}).status(401);
            });
        };

        var users = function(cb){
            r.table("User").orderBy(r.desc('date')).run().then(function(results){
                return cb(results);
            }).error(function(err){
                console.log(err);
                return res.json({message: err}).status(401);
            });
        };

        var notify = function(){
            //var to_notify = [];
            users(function(users){
                matimela(function(matimela){
                    _.map(users, function(user){
                        if(user.brand){
                            _.map(matimela, function(letimela){
                                if(user.brand === letimela.Brand && letimela.notified !== true){
                                    letimela.notified = true;
                                    var message = "Livestock belonging to you has been reported in " + letimela.Location + ". ";
                                    orangeAPI.sendSMS(user.number, message);
                                    r.table("Matimela").get(letimela.id).update(letimela).run().then(function(result){
                                    }).error(function(err){
                                        console.log({message: err});
                                    });
                                    console.log("Found a match ", letimela.Brand + "!");
                                }
                            });
                        }

                    });
                    var result = _.intersectionObjects(users, matimela);
                    console.log(result);
                });

            });

        };

        notify();

});

router.get('/notifications/subscribe', function(req, res, next) {

        _.intersectionObjects = _.intersect = function(array) {
            var slice = Array.prototype.slice;
            var rest = slice.call(arguments, 1);
            return _.filter(_.uniq(array), function(item) {
                return _.every(rest, function(other) {
                    //return _.indexOf(other, item) >= 0;
                    return _.any(other, function(element) { return _.isEqual(element, item); });
                });
            });
        };

        var listings = function(cb){
            r.table("Listing").orderBy(r.desc('dateCreated')).run().then(function(results){
                //res.json(results);
                //console.log(obj.matimela);
                //console.log(results);
                return cb(results);
            }).error(function(err){
                console.log(err);
                return res.json({message: err}).status(401);
            });
        };

        var users = function(cb){
            r.table("User").orderBy(r.desc('date')).run().then(function(results){
                return cb(results);
            }).error(function(err){
                console.log(err);
                return res.json({message: err}).status(401);
            });
        };

        var notify = function(){
            //var to_notify = [];
            users(function(users){
                listings(function(listings){
                    _.map(users, function(user){
                        if(user.brand){
                            _.map(listings, function(listing){
                                if(listing.message.indexOf(user.keyword) > -1){
                                    console.log( listing.message + " contains " + user.keyword);
                                    var message = "Someone has posted with a keyword you had asked to be notified about. The keyword is " + user.keyword + ". ";
                                    orangeAPI.sendSMS(user.number, message);
                                }
                            });
                        }

                    });
                });

            });

        };

        notify();

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

            methods.notification(data.message);

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

router.get('/users', function(req, res, next) {

    var users;

    r.table("User").orderBy(r.desc('dateCreated')).run().then(function(users){
        res.json(users);
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
