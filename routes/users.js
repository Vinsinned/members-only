var express = require('express');
var router = express.Router();
const { body, validationResult, check } = require('express-validator');
var bcrypt = require('bcryptjs');

var User = require('../models/user');

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

    const user = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      memberStatus: 'No'
    });
    bcrypt.hash("somePassword", 10, (err, hashedPassword) => {
      if (err) { return next(err) }
      user.password = hashedPassword
    });

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
                res.redirect(user.url);
            });
        }
  }
]);

router.get('/:id', function (req, res, next) {
  res.redirect('/');
});

module.exports = router;
