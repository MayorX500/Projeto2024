var express = require('express');
var router = express.Router();
//const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../model/user');
const UserCtrl = require('../controller/user');


// Get user information based on the authentication token
router.get('/information', async (req, res) => {
  let _state = 401;
  let success = false;
  let isAdmin = false;
  let isEditor = false;
  let token = req.headers['authorization'];
  console.log(token);
  if (token !== undefined) {
    let validToken = UserCtrl.validate_token(token);
    if (validToken !== -1) {
      _state = 200;
      success = true;
      let user = await UserCtrl.getUser({id: validToken});
      isAdmin = user.isadmin;
      isEditor = user.iseditor;
    }
  }
  res.status(_state).json({ success: success, isAdmin: isAdmin, isEditor: isEditor });
});


// User registration
router.post('/register', async (req, res) => {
  let local_success = false;
  let _status = 200;
  const {user, message, success} = await UserCtrl.createUser(req.body);
  console.log(user);
  if (success) {
    local_success = true;
  }
  res.status(_status).json({ success: local_success , message: message});
});
 
 // User login
router.post('/login', async (req, res) => {
  let success = false;
  let token = '';
  let _status = 401;
  try {
    const { id, password } = req.body;
    let user = await UserCtrl.getUser({id});
    if (!user) {
      token = "User not found";
    }
    else{
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        token = "Invalid credentials, either username or password is incorrect";
      }
      else{
        user = await UserCtrl.login({id: id});
        _status = 200;
        token = user.token;
        success = true;
      }
    }
  } catch (error) {
    token ="An error occured while trying to login, please try again later";
  }

  finally {
    res.status(_status).json({ success: success, token: token});
  }
});

module.exports = router;