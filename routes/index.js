var express = require('express');
var util = require('util');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'FarmConnecta' });
});

router.get('/login', function(req, res, next) {
  res.render('login', { title: 'Login' });
});

router.post('/orange', function(req, res, next) {
	res.setHeader('Content-Type', 'application/json');
    res.send(util.inspect(res));
});

router.get('/orange', function(req, res, next) {
	res.setHeader('Content-Type', 'application/json');
    res.send(util.inspect(res));
});

module.exports = router;
