"use strict";

var thinky = require('./../config/thinky.js'),
    r = thinky.r,
    type = thinky.type;

// Create a model - the table is automatically created
var Matimela = thinky.createModel("Matimela", {
    id: type.string(),
    description: type.string(),
    sex: type.string(),
    brand: type.string(),
    location: type.string(),
    dateCreated: type.date().default(r.now()),
    smsSent: type.boolean().default('False')
});


// Attach listing to user
Matimela.ensureIndex("dateCreated");

Matimela.define("findById", function (id, callback) {

    Matimela.get(id).run().then(function (matimela) {
        callback(null, matimela);
    }).error(function (error) {
        callback(error);
    });

});

Matimela.define("findByBrand", function (brand, callback) {

    Matimela.filter({brand: brand}).run().then(function (matimela) {
        callback(null, matimela);
    }).error(function (error) {
        callback(error);
    });

});

module.exports = Matimela;
