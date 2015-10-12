"use strict";

var thinky = require('./../config/thinky.js'),
    r = thinky.r,
    type = thinky.type;

// Create a model - the table is automatically created
var Listing = thinky.createModel("Listing", {
    id: type.string(),
    sender: type.string(),
    destination: type.string(),
    date: type.date().default(r.now()),
    messageId: type.string(),
    message: type.string()
});


// Attach listing to user
Listing.ensureIndex("date");

Listing.define("findById", function(id, callback){

    Listing.get(id).run().then(function(listing){
        callback(null, listing);
    }).error(function(error){
        callback(error);
    });

});

module.exports = Listing;
