var express = require('express'),
    util = require('util'),
    router = express.Router(),
    _ = require('underscore'),
    moment = require('moment'),
    thinky = require('./../config/thinky.js'),
    r = thinky.r,
    type = thinky.type,
    Listing = require('./../models/Listing');


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'FarmConnecta' });
  next();
});

router.get('/login', function(req, res, next) {
  res.render('login', { title: 'Login' });
  next();
});

router.get('/about', function(req, res, next) {
    res.render('about', { title: 'About' });
    next();
});

router.get('/logout', function(req, res, next) {
    console.log("I am being probed");
    next();
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
        listing.save().then(function(result){
            console.log(result);
            res.status(200)
                .send({ success: true}
            );

        }).error(function(err){
            console.log({message: err});
        });
    }else{
        res.json({message: error});
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


module.exports = router;
