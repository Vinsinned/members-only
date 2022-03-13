var express = require('express');
var router = express.Router();

/* GET messages listing. */
router.get('/', function(req, res, next) {
  return res.render('index', { title: 'Express', user: req.user });
});

module.exports = router;
