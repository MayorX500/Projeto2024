var express = require('express');
var router = express.Router();
var axios = require('axios');

function getAllTypes() {
  return axios.get('http://localhost:3000/types')
    .then(response => response.data)
    .catch(error => {
      console.error(error);
      return [];
    });
}

router.get('/', function(req, res) {
  Promise.all([
    axios.get('http://localhost:3000/lastday?fields=publication,code,ministry,type,description,publication_date'),
    getAllTypes()
  ])
  .then(([lastDayResponse, types]) => {
    let fdate = new Date(lastDayResponse.data[0].publication_date);
    fdate.setHours(fdate.getHours() + 1);
    fdate.setUTCHours(0); // Set the timezone to UTC
    fdate = fdate.toISOString().split('T')[0];
    console.log(fdate);

    let allData = [];
    let currentPage = {};
    let currentCount = 0;

    const sortedData = lastDayResponse.data.sort((a, b) => a.publication.localeCompare(b.publication));

    sortedData.forEach(element => {
      if (!currentPage[element.publication]) {
        currentPage[element.publication] = { elements: [] };
      }

      currentPage[element.publication].elements.push(element);
      currentCount++;

      if (currentCount >= 10) {
        allData.push(JSON.parse(JSON.stringify(currentPage)));
        currentPage = {};
        currentCount = 0;
        if (element.publication === sortedData[sortedData.indexOf(element) + 1]?.publication) {
          currentPage[element.publication] = { elements: [] };
        }
      }
    });

    if (Object.keys(currentPage).length > 0) {
      allData.push(currentPage);
    }

    res.render('index', { allData: allData, types: types, fdate: fdate });
  })
  .catch(error => {
    console.error(error);
    res.status(500).send('Could not load page');
  });
});

router.get('/specific/:id', function(req, res) {
  axios.get('http://localhost:3000/' + req.params.id)
    .then(response => {
      let fdate = new Date(response.data[0].publication_date);
      res.render('spec-page', { allData: response.data[0], fdate: fdate });
    })
    .catch(error => {
      console.error(error);
      res.status(500).send('An error occurred');
    });
});

module.exports = router;
