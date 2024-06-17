var express = require('express');
var router = express.Router();
const controller = require('../controller/decreto');
const QueryBuilder = require('../controller/query');
const axios = require('axios');

const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const entries_per_page = 10;

// Function to build a query with custom filters
function build_query_with_custom_filters(filters) {
  let query = new QueryBuilder();
  let sort = "";
  let order = "";
  for (let key in filters) {
    if (key == "fields") {
      query.select(filters[key]);
    }
    if (key == "publication_date") {
      query.where(`publication_date='${filters[key]}'`);
    }
    if (key == "publication") {
      query.where(`publication='${filters[key]}'`);
    }
    if (key == "ministry") {
      query.where(`ministry='${filters[key]}'`);
    }
    if (key == "type") {
      query.where(`type=${filters[key]}`);
    }
    if (key == "sort") {
      sort = filters[key];
    }
    if (key == "order") {
      order = filters[key];
    }
    if (key == "page") {
      query.page(filters[key]);
    }
  }
  if (sort != "" || order != "") {
    query.orderBy(sort, order);
}
  return query.build();
}

router.get('/count', async function(req, res) {
  let query = build_query_with_custom_filters(req.query);
  let resp = await controller.getCustom(query);
  res.json(resp);
});

// GET all documents of the last day registered
router.get('/lastday', async function(req, res) {
  var fields = req.query.fields ? req.query.fields : "*";
  var page = req.query.page ? req.query.page : 1;
  let query = `SELECT ${fields} FROM public.dreapp_document WHERE publication_date = (SELECT MAX(publication_date) FROM public.dreapp_document) Limit ${entries_per_page} OFFSET ${(page - 1) * entries_per_page};`;
  let resp = await controller.getCustom(query);
  res.json(resp);
});


router.post('/', async function(req, res) {
  let _status = 200;
  let _message = "Document added successfully";
  let _success = false;
  let new_id = null;
  let token = req.headers.authorization;

  if (token != null) {
    try {
      let validate_token = await axios.get('http://localhost:3004/auth/roles', { headers: { Authorization: token } });
      validate_token = validate_token.data;
      if (validate_token.success) {
        if (validate_token.isAdmin || validate_token.isEditor) {
          let document = {
            id : req.body.id || 0,
            type: req.body.type,
            code: req.body.code,
            publication: req.body.publication,
            ministry: req.body.ministry,
            publication_date: req.body.publication_date,
            description: req.body.description,
            content: req.body.content,
            url: req.body.url || "",
            additional_link: req.body.additional_link || "",
            pdf_link: req.body.pdf_link,
            some_id: 0,
            identifier: "",
            active: true,
            revoked: false,
            is_confidential: false,
            is_deleted: false,
            reference: "",
            version: 1,
            status: ""
          };

          try {
            // Save the document to the database and return the id of the new document
            let result = await controller.createDocument(document);
            if (result.id == null) {
              _message = "Error saving document to database";
            } else {
              new_id = result.id;
              _success = true;
            }
          } catch (dbError) {
            console.error('Error saving document to database:', dbError);
            return res.status(_status).json({ new_id, success: _success, message: 'Error saving document to database' });
          }
        } else {
          _message = "You do not have permission to add a document";
        }
      } else {
        _message = "Invalid token";
      }
    } catch (authError) {
      _message = "Error validating token";
    }
  } else {
    _message = "Authorization token is missing";
  }

  res.status(_status).json({ new_id, success: _success, message: _message });
});


/* GET all documents */
router.get('/', async function(req, res) {
  let query = build_query_with_custom_filters(req.query);
  let resp = await controller.getCustom(query);
  res.json(resp);
});


/* Adicionar um documento aos favoritos do utilizador */
router.post('/favorite', async function(req, res) {
  let {favorite} = req.body;
  let token = req.headers.authorization;

  let response = axios.post('http://localhost:3004/auth/favorite', {favorite}, {headers: {Authorization: token}})
  .then(response => {
    return response.data;
  })
  .catch(error => {
    return {success: false, message: error.response.data.error};
  });
  return res.json(response);
});


/* GET all types of documents */
router.get('/types', async function(req, res) {
  let resp = await controller.getTypes();
  res.json(resp);
});

/* GET document by its ID */
router.get('/:id', async function(req, res) {
  if (isNaN(req.params.id)) {
    res.status(200).json({ error: 'Invalid ID' });
  }
  let resp = await controller.getByID(req.params.id);
  res.json(resp);
});

router.delete('/:id', async function(req, res) {
  let resp = await controller.deleteDocument(req.params.id);
  res.json(resp);
});

router.put('/:id', async function(req, res) {
  let _status = 200;
  let _message = "Document updated successfully";
  let _success = false;
  let token = req.headers.authorization;

  try{
    if (token != null) {
      let validate_token = await axios.get('http://localhost:3004/auth/roles', { headers: { Authorization: token } });
      validate_token = validate_token.data;
      if (validate_token.success) {
        if (validate_token.isAdmin || validate_token.isEditor) {
          let document = {
            id: req.body.id,
            type: req.body.type,
            code: req.body.code,
            publication: req.body.publication,
            ministry: req.body.ministry,
            publication_date: req.body.publication_date,
            description: req.body.description,
            content: req.body.content,
            url: req.body.url || "",
            additional_link: req.body.additional_link || "",
            pdf_link: req.body.pdf_link || "",
            some_id: 0,
            identifier: "",
            active: true,
            revoked: false,
            is_confidential: false,
            is_deleted: false,
            reference: "",
            version: 1,
            status: ""
          };
          let result = await controller.updateDocument(document);
          if (result.id == null) {
            _message = "Error updating document";
          } else {
            _success = true;
          }
        }
        else {
          _message = "You do not have permission to update a document";
        }
      }
      else {
        _message = "Invalid token";
      }
    } 
  } catch (authError) {
    _message = "Error validating token";
  }
  res.status(_status).json({ success: _success, message: _message });
});



module.exports = router;
