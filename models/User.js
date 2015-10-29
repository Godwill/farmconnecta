"use strict";

var thinky = require('./../config/thinky.js'),
    r = thinky.r,
    type = thinky.type;


// Create User model
var User = thinky.createModel("User", {
    id: type.string(),
    number: type.string(),
    brand: type.string(),
    keyword: type.string(),
    dateCreated: type.date().default(r.now())
});

User.ensureIndex("number");
User.ensureIndex("dateCreated");

User.defineStatic("pluckPassword", function() {
    return this.without('password');
});

User.defineStatic("findByNumber", function(number, callback) {
    User.filter({number: number}).run().then(function(user){
        console.log("In the models function: ", number);

        return callback(null, user[0]);
    }).error(function(error){
        return callback(error);
    });
});

User.defineStatic("findById", function(id, callback) {

    User.filter({id: id}).run().then(function(user){
        return callback(null, user[0]);
    }).error(function(error){
        return callback(error);
    });
});


User.define("findByBrand", function (brand, callback) {

    User.filter({brand: brand}).run().then(function (user) {
        callback(null, user);
    }).error(function (error) {
        callback(error);
    });

});

module.exports = User;
