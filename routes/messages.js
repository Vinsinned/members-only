var express = require('express');
const { locals } = require('../app');
var router = express.Router();
const { body, validationResult, check } = require('express-validator');

const Message = require('../models/message');
const message = require('../models/message');
const User = require('../models/user');

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

  (req, res, next) => {
    const errors = validationResult(req);

    const message = new Message({
      title: req.body.title,
      text: req.body.text,
      timestamp: new Date().toISOString(),
      name: req.user.name,
      //convert objectId to string
      user: req.user.id
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
        return res.redirect('/messages');
      });
    }
  }
]);

router.get('/:id/delete', function (req, res, next) {
  if (req.isAuthenticated()) {
    if (req.user.adminStatus === true) {
      res.render('delete_message', { title: 'Delete Message' });
    } else {
      res.redirect('/messages');
    }
  } else {
    res.redirect('/');
  }
})

router.post('/:id/delete', function (req, res, next) {
  Message.findByIdAndRemove(req.params.id, function deleteMessage(err) {
    if (err) { return next(err); }
    // Success - go to author list.
    res.redirect('/messages')
  })
})

module.exports = router;
