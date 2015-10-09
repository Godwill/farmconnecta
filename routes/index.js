var express = require('express');
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
    res.send(JSON.stringify({ res: res, req: req }, null, 3));
});

router.get('/orange', function(req, res, next) {
	res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ res: res, req: req }, null, 3));
});

module.exports = router;
