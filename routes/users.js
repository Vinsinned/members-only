var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local');
const { body, validationResult, check } = require('express-validator');
var bcrypt = require('bcryptjs');

var User = require('../models/user');

var mongoose = require('mongoose');
var mongoDB = 'mongodb+srv://vinson:a@cluster0.if6je.mongodb.net/MembersOnly?retryWrites=true&w=majority';
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

passport.use(
  new LocalStrategy((username, password, done) => {
    User.findOne({ username: username }, (err, user) => {
      if (err) { 
        return done(err);
      }
      if (!user) {
        return done(null, false, { message: "Incorrect username" });
      }
      bcrypt.compare(password, user.password, (err, res) => {
        if (res) {
          // passwords match! log user in
          console.log('YESSIR YOUN DID THAT')
          return done(null, user)
        } else {
          // passwords do not match!
          console.log('SHUT UP YA FUCKIN FATTY')
          return done(null, false, { message: "Incorrect password" })
        }
        //I removed the final return in order to stop an error,
      })
    });
  })
);

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

router.get('/', function(req, res, next) {
  return res.render('index', { title: 'Welcome!', user: req.user });
});

/* GET users listing. */
router.get('/sign-up', function(req, res, next) {
  return res.render('sign_up', { title: 'Sign Up' });
});

router.post("/sign-up", [
  body('firstName').trim().isLength({ min: 1 }).escape().withMessage('First name must be specified.')
    .isAlphanumeric().withMessage('First name has non-alphanumeric characters.'),
  body('lastName').trim().isLength({ min: 1 }).escape().withMessage('Last name must be specified.')
    .isAlphanumeric().withMessage('Last name has non-alphanumeric characters.'),
  check('username').normalizeEmail().isEmail(),
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
        username: req.body.username,
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
          return res.redirect('/');
        });
      }
    });

  }
]);

router.get('/log-in', function (req, res, next) {
  return res.render('log_in', { title: 'Log In' });
});

router.post(
  "/log-in",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/"
  })
);


//fix this
router.get("/log-out", (req, res) => {
  req.logout();
  return res.redirect("/");  
});

router.get('/:id', function (req, res, next) {
  return res.redirect('/');
});

module.exports = router;
