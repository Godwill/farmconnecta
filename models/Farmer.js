"use strict";

var thinky = require('./../config/thinky.js'),
    r = thinky.r,
    type = thinky.type;

// Create a model - the table is automatically created
var Farmer = thinky.createModel("Farmer", {
    id: type.string(),
    number: type.string(),
    brand: type.string(),
    dateCreated: type.date().default(r.now())
});


// Attach listing to user
Farmer.ensureIndex("dateCreated");

Farmer.define("findById", function (id, callback) {

    Farmer.get(id).run().then(function (farmer) {
        callback(null, farmer);
    }).error(function (error) {
        callback(error);
    });

});

Farmer.define("findByBrand", function (brand, callback) {

    Farmer.filter({brand: brand}).run().then(function (farmer) {
        callback(null, farmer);
    }).error(function (error) {
        callback(error);
    });

});

module.exports = Farmer;
