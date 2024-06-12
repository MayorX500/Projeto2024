var express = require('express');
var router = express.Router();
const controller = require('../controller/decreto');
const QueryBuilder = require('../controller/query');



function build_query_with_custom_filters(filters) {
  let query = new QueryBuilder();
  let sort = "";
  let order = "";
  for (let key in filters) {
    console.log(key);
    if (key == "fields") {
      query.select(filters[key]);
    }
    if (key == "publication_date") {
      query.where(`publication_date='${filters[key]}'`);
    }
    if (key == "type") {
      query.where(`type = ${filters[key]}`);
    }
    if (key == "sort") {
      sort = filters[key];
    }
    if (key == "order") {
      order = filters[key];
    }
    //publication_date type sort order 
  }
  if (sort != "" || order != "") {
    query.orderBy(sort, order);
}
  return query.build();
}


// GET all documents of the last day registered
router.get('/lastday', async function(req, res) {
  var fields = req.query.fields ? req.query.fields : "*";
  let query = `SELECT ${fields} FROM public.dreapp_document WHERE publication_date = (SELECT MAX(publication_date) FROM public.dreapp_document);`;
  //console.log(query);
  let resp = await controller.getCustom(query);
  res.json(resp);
});

/* GET all documents */
router.get('/', async function(req, res) {
  let query = build_query_with_custom_filters(req.query);
  console.log(query);
  let resp = await controller.getCustom(query);
  res.json(resp);
});

/* GET documents by their type */
router.get('/type/:type', async function(req, res) {
  let resp = await controller.getByType(req.params.type);
  res.json(resp);
});

/* GET documents by their code */
router.get('/code', async function(req, res) {
  let code = req.query.code ? req.query.code : null;
  let resp = await controller.getByCode(code);
  res.json(resp);
});

/* GET documents by publication year */
router.get('/year/:year', async function(req, res) {
  let resp = await controller.getByYear(req.params.year);
  res.json(resp);
});

/* GET everything on that date */
router.get('/date/:date', async function(req, res) {
  let resp = await controller.getDate(req.params.date);
  res.json(resp);
});

/* GET documents sorted by their publication date */
router.get('/date', async function(req, res) {
  let resp = await controller.getByDate();
  res.json(resp);
});

// GET last X documents
router.get('/last/:limit', async function(req, res) {
  let fields = req.query.fields ? req.query.fields : null;
  console.log(req.query.fields);
  let resp = await controller.getLast(req.params.limit, fields);
  res.json(resp);
});

/* GET documents sorted by their creation date */
router.get('/creation_date', async function(req, res) {
  let resp = await controller.getByCreationDate();
  res.json(resp);
});

/* GET all types of documents */
router.get('/types', async function(req, res) {
  let resp = await controller.getTypes();
  res.json(resp);
});

/* GET document by its ID */
router.get('/:id', async function(req, res) {
  if (isNaN(req.params.id)) {
    res.status(400).json({ error: 'Invalid ID' });
  }
  // está a dar erro por causa do FAVICON
  let resp = await controller.getByID(req.params.id);
  res.json(resp);
});

module.exports = router;
