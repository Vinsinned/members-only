var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local');
const { body, validationResult, check } = require('express-validator');
var bcrypt = require('bcryptjs');
var User = require('../models/user');

//connect to mongoDB
var mongoose = require('mongoose');
var mongoDB = 'mongodb+srv://vinson:a@cluster0.if6je.mongodb.net/MembersOnly?retryWrites=true&w=majority';
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

//initialize passportjs
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


//paths
router.get('/', function(req, res, next) {
  return res.render('index', { title: 'Welcome!', user: req.user });
});

router.get('/sign-up', function(req, res, next) {
  return res.render('sign_up', { title: 'Sign Up' });
});

router.post('/sign-up', [
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
        memberStatus: false,
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

router.post('/log-in', passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/"
  })
);

router.get('/log-out', (req, res) => {
  req.logout();
  return res.redirect('/');  
});

router.get("/:id/secret-code", (req, res) => {
  if (req.isAuthenticated()) {
    return res.render('secret_code', { title: 'Enter Code' }); 
  } else {
    res.redirect('/');
  }
});

router.post("/:id/secret-code", [
  body('code').trim().isLength({ min: 1 }).escape().withMessage('Code must be specified.')
    .isAlphanumeric().withMessage('Code has non-alphanumeric characters.'),
  
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        // There are errors. Render form again with sanitized values/errors messages.
        res.render('secret_code', { title: 'Enter Code', secret: req.body.code, errors: errors.array() });
        return;
    }
    else {
      // Data from form is valid.
      if (req.body.code === 'abc') {
        //correct code
        if (req.user.id !== null) {
          //user exists
          User.findByIdAndUpdate(req.user.id,{"memberStatus": true}, function(err, result){
            if(err){
              return res.send(err)
            }
            else{
              result.save(function (err) {
                if (err) { return next(err); }
                // Successful - redirect to new author record.
                //res.redirect(user.url);
                return res.redirect('/users/code-success');
              });
            }
          })
        } else {
          //in edge case if somehow user is not logged in and in sign up page
          res.redirect('/');
        }
      }
      if (req.body.code !== 'abc') {
        //wrong code
        res.render('secret_code', { title: 'Enter Code', secret: req.body.code, errorOne: 'Wrong Code' });
      }
    }
  }
]);

router.get('/:id/admin-code', function (req, res, next) {
  if (req.isAuthenticated()) {
    res.render('admin_code', { title: 'Enter Code' });
  } else {
    res.redirect('/');
  }
});

router.post("/:id/admin-code", [
  body('code').trim().isLength({ min: 1 }).escape().withMessage('Code must be specified.')
    .isAlphanumeric().withMessage('Code has non-alphanumeric characters.'),
  
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        // There are errors. Render form again with sanitized values/errors messages.
        res.render('admin_code', { title: 'Enter Code', admin: req.body.code, errors: errors.array() });
        return;
    }
    else {
      // Data from form is valid.
      if (req.body.code === 'vinson') {
        //correct code
        if (req.user.id !== null) {
          //user exists
          User.findByIdAndUpdate(req.user.id,{"adminStatus": true}, function(err, result){
            if(err){
              return res.send(err)
            }
            else{
              result.save(function (err) {
                if (err) { return next(err); }
                // Successful - redirect to new author record.
                //res.redirect(user.url);
                return res.redirect('/users/admin-code-success');
              });
            }
          })
        } else {
          //in edge case if somehow user is not logged in and in sign up page
          res.redirect('/');
        }
      }
      if (req.body.code !== 'vinson') {
        //wrong code
        res.render('admin_code', { title: 'Enter Code', admin: req.body.code, errorOne: 'Wrong Code' });
      }
    }
  }
]);

router.get("/code-success", (req, res) => {
  return res.render('code_success', {title: 'Successful Code!'});  
});

router.get("/admin-code-success", (req, res) => {
  return res.render('admin_code_success', {title: 'Successful Code!'});  
});

router.get('/:id', function (req, res, next) {
  return res.redirect('/');
});

module.exports = router;
