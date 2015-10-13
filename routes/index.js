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
router.get('/', function(req, res) {
  res.render('index', { title: 'FarmConnecta' });
});

router.post('/orange/smsmo', function(req, res) {

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
