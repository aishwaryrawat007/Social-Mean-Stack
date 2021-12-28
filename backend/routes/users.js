const express = require('express');
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const user = require('../models/user');

const router = express.Router();


//create user
router.post("/signup", (req, res, next) => {
  bcrypt.hash(req.body.password, 10).then(hash => {
    const user = new User({
      email: req.body.email,
      password: hash
    });

    user.save().then(result => {
      res.status(201).json({
        message: "User saved successfully",
        result: result
      })
    }).catch(err => {
      res.status(500).json({
        error: err
      })
    })
  })
});

//login
router.post("/login", (req,res,next) => {
  let fetchedUser;

  User.findOne({email: req.body.email}).then(user => {
    if(!user){
      return res.status(401).json({
        message: "Auth Failed"
      })
    }
    //validating the hashed password

    fetchedUser = user;
    return bcrypt.compare(req.body.password, user.password);
  })
  .then(isValidPassword => {
    if(!isValidPassword){
      return res.status(401).json({
        message: "Auth Failed"
      })
    }

    //generating jwt token
    const token = jwt.sign({email: fetchedUser.email, fetchedUser: user._id},
      'secret_password_key_for_long_storage',
      { expiresIn: "1h"}
    );
    res.status(200).json({
      message: "Login successful",
      token: token
    })

  }).catch(err => {
    return res.status(401).json({
      message: "Auth Failed"
    })
  })
})

module.exports = router;
