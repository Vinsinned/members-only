var express = require('express');
var router = express.Router();
const { body, validationResult, check } = require('express-validator');
var bcrypt = require('bcryptjs');

var User = require('../models/user');
var async = require('async')

var mongoose = require('mongoose');
var mongoDB = 'mongodb+srv://vinson:a@cluster0.if6je.mongodb.net/MembersOnly?retryWrites=true&w=majority';
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

/* GET users listing. */
router.get('/sign-up', function(req, res, next) {
  res.render('sign_up', { title: 'Sign Up' });
});

router.post("/sign-up", [
  body('firstName').trim().isLength({ min: 1 }).escape().withMessage('First name must be specified.')
    .isAlphanumeric().withMessage('First name has non-alphanumeric characters.'),
  body('lastName').trim().isLength({ min: 1 }).escape().withMessage('Last name must be specified.')
    .isAlphanumeric().withMessage('Last name has non-alphanumeric characters.'),
  check('email').normalizeEmail().isEmail(),
  check('password').exists(),
  check(
    'confirmPassword',
    'Password confirmation field must have the same value as the password field',
  )
  .exists()
  .custom((value, { req }) => value === req.body.password),

  (req, res, next) => { 

    const errors = validationResult(req);

    //Call bcrypt first to avoid having a undefined password!
    bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
      if (err) { return next(err) }

      const user = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        memberStatus: 'No',
        password: hashedPassword
      })

      if (!errors.isEmpty()) {
        // There are errors. Render form again with sanitized values/errors messages.
        res.render('sign_up', { title: 'Sign Up', user: user, errors: errors.array() });
        return;
      }
      else {
        // Data from form is valid.

        // Save author.
        user.save(function (err) {
          if (err) { return next(err); }
          // Successful - redirect to new author record.
          //res.redirect(user.url);
          res.redirect('/');
        });
      }
    });

  }
]);

router.get('/:id', function (req, res, next) {
  res.redirect('/');
});

module.exports = router;
