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
    secrets = require('./../secrets/secrets'),
    Pusher = require('pusher'),
    _ = require('underscore'),
    passwordless = require('passwordless'),
    RethinkDBStore = require('passwordless-rethinkdbstore');

var methods = {

     notification : function (data) {

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
                _.map(users, function(user){
                    var keyword = user.keyword;
                    if(data.indexOf(keyword.toLowerCase()) > -1){
                        console.log( data + " contains " + user.keyword);
                        var message = "Someone has posted with a keyword you had asked to be notified about. The keyword is " + user.keyword + ". ";
                        orangeAPI.sendSMS(user.number, message);
                    }
                });
            });
        };

        notify();
    }

};

module.exports = methods;