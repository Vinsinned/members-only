var express = require('express');
const { locals } = require('../app');
var router = express.Router();
const { body, validationResult, check } = require('express-validator');

const Message = require('../models/message');

/* GET messages listing. */
router.get('/', function (req, res, next) {
  Message.find()
  .sort([['timestamp', 'ascending']])
  .exec(function (err, list_messages) {
      if (err) { return next(err); }
      // Successful, so render.
      return res.render('messages', { title: 'Messages', message_list: list_messages, user: req.user });
  })
});

router.get('/create', function (req, res, next) {
  if (req.isAuthenticated()) {
    res.render('create_message', { title: 'Create Message' });
  } else {
    res.redirect('/');
  }
});

router.post('/create', [
  body('title').trim().isLength({ min: 1 }).escape().withMessage('Title must be specified.'),
  body('text').trim().isLength({ min: 1 }).escape().withMessage('Text must be specified.'),

  (req, res, next) => {
    const errors = validationResult(req);

    const message = new Message({
      title: req.body.title,
      text: req.body.text,
      timestamp: new Date().toISOString(),
      //convert objectId to string
      user: req.user.name.str
    })

    if (!errors.isEmpty()) {
        // There are errors. Render form again with sanitized values/errors messages.
        res.render('create_message', { title: 'Create Message', message: message, errors: errors.array() });
        return;
      }
      else {
        // Data from form is valid.

        // Save author.
        message.save(function (err) {
          if (err) { return next(err); }
          // Successful - redirect to new author record.
          //res.redirect(user.url);
          return res.redirect('/');
        });
      }
  }
])

module.exports = router;
