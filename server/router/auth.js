const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');
const passport = require('passport');

router.post('/register', async (req, res, next) => {
  let new_user = req.body;
  let saltRounds = 10;

  if (
    !new_user ||
    !new_user.email ||
    !new_user.username ||
    !new_user.password ||
    !new_user.password2
  ) {
    res.status(400).json({ msg: 'Missing data from request' });
    return;
  }

  if (new_user.password !== new_user.password2) {
    res.status(400).json({ msg: "Passwords don't match" });
  }

  delete new_user.password2;

  bcrypt.hash(new_user.password, saltRounds, (err, hash) => {
    if (err) {
      res.sendStatus(500);
      return;
    }

    new_user.password = hash;

    User.create(new_user)
      .then(() => {
        res.sendStatus(201);
      })
      .catch((err) => {
        let errors = { email: false, username: false };
        if (err && err.errors) {
          for (let error of err.errors) {
            if (error.type === 'unique violation') {
              if (error.path === 'username') errors.username = true;
              if (error.path === 'email') errors.email = true;
            }
          }
        }

        res.status(409).json(errors);
      });
  });
});

router.post('/signin', passport.authenticate('local'), (req, res, next) => {
  console.log(req.session);
  res.status(200).json({ user: req.user });
});

module.exports = router;
