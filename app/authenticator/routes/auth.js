var express = require('express');
var router = express.Router();
//const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../model/user');
const UserCtrl = require('../controller/user');


// Get user information based on the authentication token
router.get('/roles', async (req, res) => {
  let _state = 200;
  let success = false;
  let isAdmin = false;
  let isEditor = false;
  let token = req.headers['authorization'];
  if (token !== undefined) {
    let validToken = -1;
    try{
      validToken = UserCtrl.validate_token(token);
    }
    catch (error) {
      validToken = jwt.decode(token,JWT_SECRET).id;
    }
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

// Get user ID based on the authentication token
router.get('/id', async (req, res) => {
  let _state = 200;
  let success = false;
  let id = -1;
  let token = req.headers['authorization'];
  if (token !== undefined) {
    let validToken = -1;
    try{
      validToken = UserCtrl.validate_token(token);
    }
    catch (error) {
      validToken = jwt.decode(token,JWT_SECRET).id;
      await UserCtrl.getUser({id: validToken});
    }
    if (validToken !== -1) {
      _state = 200;
      success = true;
      id = validToken;
    }
  }
  res.status(_state).json({ success: success, id: id });
});

router.post('/favorite', async (req, res) => {
  let success = false;
  let _status = 200;
  let message = "Ocorreu um erro ao tentar adicionar ou remover dos favoritos.";
  let token = req.headers['authorization'];
  if (token !== undefined) {
    let validToken = -1;
    try{
      validToken = UserCtrl.validate_token(token);
    }
    catch (error) {
      validToken = jwt.decode(token,JWT_SECRET).id;
    }
    if (validToken !== -1) {
      let {favorite} = req.body;
      let user = await UserCtrl.getUser({id: validToken});
      if (user !== null) {
        let add_or_remove = user.addFavorite(favorite);
        if (!add_or_remove) {
          user.removeFavorite(favorite);
          success = true;
          message = `O post com o ID ${favorite} foi removido dos favoritos.`;
        }
        else{
          message = `O post com o ID ${favorite} foi adicionado dos favoritos.`;
          success = true;
        }
        if (success) {
          await UserCtrl.updateUser(user);
        }
        else{
          message = "Um erro ocorreu ao tentar adicionar ou remover dos favoritos.";
        }
      }
      else{
        message = "Utilizador inválido.";
      }
      res.status(_status).json({ success: success, message: message });
    }
  }
});

router.get('/favorite', async (req, res) => {
  let success = false;
  let user = null;
  let _status = 200;
  let message = "Um erro ocorreu ao tentar obter os favoritos.";
  let token = req.headers['authorization'];
  if (token !== undefined) {
    let validToken = -1;
    try{
      validToken = UserCtrl.validate_token(token);
    }
    catch (error) {
      validToken = jwt.decode(token,JWT_SECRET).id;
    }
    if (validToken !== -1) {
      user = await UserCtrl.getUser({id: validToken});
      if (user !== null) {
        delete(user._password);
        delete(user._token);
        success = true;
        message = "Utilizador encontrado.";
      }
      else{
        message = "Utilizador inválido.";
      }
    }
  }
  res.status(_status).json({ success: success, message: message, user: user });
});



// User registration
router.post('/register', async (req, res) => {
  let local_success = false;
  let _status = 200;
  const {user, message, success} = await UserCtrl.createUser(req.body);
  if (success) {
    local_success = true;
  }
  res.status(_status).json({ success: local_success , message: message});
});
 
 // User login
router.post('/login', async (req, res) => {
  let success = false;
  let token = '';
  let _status = 200;
  try {
    const { id, password } = req.body;
    let user = await UserCtrl.getUser({id});
    if (!user) {
      token = "Utilizador não encontrado.";
    }
    else{
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        token = "Credenciais inválidas. NIF ou password incorreta por favor tente novamente.";
      }
      else{
        user = await UserCtrl.login({id: id});
        _status = 200;
        token = user.token;
        success = true;
      }
    }
  } catch (error) {
    token ="Ocorreu um erro ao tentar fazer login, por favor tente mais tarde.";
  }

  finally {
    res.status(_status).json({ success: success, token: token});
  }
});

module.exports = router;