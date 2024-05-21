var express = require('express');
var router = express.Router();
var axios = require('axios');

/*
  * This file contains the routes for the frontend of the application.
  * dre - pagina inicial
  * dre/:id - documento com id
  * 
*/


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET document by id */
router.get('/:id', function(req, res) {
  try {
    axios('/' + req.params.id)
      .then(function (response) {
        res.render('document', { document: response.data});
      })
      .catch(function (error) {
        console.log(error);
      });
  } catch (error) {
    console.log(error);
  }
});


/* GET documents by their type */
router.get('/type', async function(req, res) {
  let type = req.query.type ? req.query.type : null;
  try {
    if (type === null) {
      axios.get('http://localhost:3000/type')
        .then(function (response) {
          res.render('documents', { documents: response.data });
        })
        .catch(function (error) {
          console.log(error);
        });
    }
    else{
      axios.get('http://localhost:3000/type/' + type)
        .then(function (response) {
          res.render('documents', { documents: response.data });
        })
      .catch(function (error) {
        console.log(error);
      });
    }
  } catch (error) {
    console.log(error);
  }
});


/* GET documents by their code */
router.get('/code', async function(req, res) {
  let code = req.query.code ? req.query.code : null;
  try {
    if (code === null) {
      axios.get('http://localhost:3000/code')
        .then(function (response) {
          res.render('documents', { documents: response.data });
        })
        .catch(function (error) {
          console.log(error);
        });
    }
    else{
      axios.get('http://localhost:3000/code/' + code)
        .then(function (response) {
          res.render('documents', { documents: response.data });
        })
      .catch(function (error) {
        console.log(error);
      });
    }
  } catch (error) {
    console.log(error);
  }
});

/* GET documents by publication year */
router.get('/year', async function(req, res) {
  try {
    axios.get('http://localhost:3000/year/' + req.params.year)
      .then(function (response) {
        res.render('documents', { documents: response.data });
      })
      .catch(function (error) {
        console.log(error);
      });
  } catch (error) {
    console.log(error);
  }
});

/* GET documents sorted by their publication date */
router.get('/date', async function(req, res) {
  try {
    axios.get('http://localhost:3000/date')
      .then(function (response) {
        res.render('documents', { documents: response.data });
      })
      .catch(function (error) {
        console.log(error);
      });
  } catch (error) {
    console.log(error);
  }
});

/* GET documents sorted by their creation date */
router.get('/creation_date', async function(req, res) {
  try {
    axios.get('http://localhost:3000/creation_date')
      .then(function (response) {
        res.render('documents', { documents: response.data });
      })
      .catch(function (error) {
        console.log(error);
      });
  } catch (error) {
    console.log(error);
  }
});


module.exports = router;
