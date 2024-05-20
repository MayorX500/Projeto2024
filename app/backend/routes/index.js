var express = require('express');
var router = express.Router();
const controller = require('../controller/decreto');


/* GET all documents */
router.get('/', async function(req, res) {
  let resp = await controller.getAll();
  res.send(resp);
  res.end();
});

/* GET document by its ID */
router.get('/:id', async function(req, res) {
  let resp = await controller.getByID(req.params.id);
  res.send(resp);
  res.end();
});

/* GET documents by their type */
router.get('/type/:type', async function(req, res) {
  let resp = await controller.getByType(req.params.type);
  res.send(resp);
  res.end();
});

/* GET documents by their code */
router.get('/code/:code', async function(req, res) {
  let resp = await controller.getByCode(req.params.code);
  res.send(resp);
  res.end();
});

/* GET documents by publication year */
router.get('/year/:year', async function(req, res) {
  let resp = await controller.getByYear(req.params.year);
  res.send(resp);
  res.end();
});

/* GET documents sorted by their publication date */
router.get('/date', async function(req, res) {
  let resp = await controller.getByDate();
  res.send(resp);
  res.end();
});

/* GET documents sorted by their creation date */
router.get('/creation_date', async function(req, res) {
  let resp = await controller.getByCreationDate();
  res.send(resp);
  res.end();
});



module.exports = router;


