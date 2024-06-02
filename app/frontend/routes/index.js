var express = require('express');
var router = express.Router();
var axios = require('axios');

router.get('/', function(req, res) {
  if (Object.keys(req.query).length === 0) {
    axios.get('http://localhost:3000/last/1?fields=id,publication_date')
      .then(response => {
        console.log(response.data[0].id);
        console.log(response.data[0].publication_date);
        let fdate = response.data[0].publication_date.split('T')[0];
        if (response.data[0]) {
          res.redirect(`/?date=${fdate}`);
        }
      })
      .catch(error => {
        console.error(error);
        res.status(500).send('An error occurred');
      });
  }
  else {
    axios.get('http://localhost:3000/lastday?fields=publication,code,ministry,type,description')
      .then(response => {
        let allData = [];
        let currentPage = {};
        let currentCount = 0;
        let types = [];

        // Sort data by publication
        const sortedData = response.data.sort((a, b) => a.publication.localeCompare(b.publication));

        sortedData.forEach(element => {
          if (!types.includes(element.type)) {
            types.push(element.type);
          }

          if (!currentPage[element.publication]) {
            currentPage[element.publication] = { elements: [] };
          }

          // Add element to current publication
          currentPage[element.publication].elements.push(element);
          currentCount++;

          // Check if the page needs to be rolled over
          if (currentCount >= 10) {
            allData.push(JSON.parse(JSON.stringify(currentPage))); // Ensure deep copy
            currentPage = {};
            currentCount = 0;
            // Start new page with continuation of the current publication if it has more elements
            if (element.publication === sortedData[sortedData.indexOf(element) + 1]?.publication) {
              currentPage[element.publication] = { elements: [] };
            }
          }
        });

        // Push the last page if it has any content
        if (Object.keys(currentPage).length > 0) {
          allData.push(currentPage);
        }
        res.render('index', { "allData": allData, "types": types });
      })
      .catch(error => {
        console.error(error);
        res.status(500).send('An error occurred');
      });
  }
});

router.get('/specific/:id', function(req, res) {
  axios.get('http://localhost:3000/' + req.params.id)
      .then(response => {
        let allData = [];
        let currentPage = {};
        let currentCount = 0;
        let types = [];

        // Sort data by publication
        const sortedData = response.data.sort((a, b) => a.publication.localeCompare(b.publication));

        sortedData.forEach(element => {
          if (!types.includes(element.type)) {
            types.push(element.type);
          }

          if (!currentPage[element.publication]) {
            currentPage[element.publication] = { elements: [] };
          }

          // Add element to current publication
          currentPage[element.publication].elements.push(element);
          currentCount++;

          // Check if the page needs to be rolled over
          if (currentCount >= 10) {
            allData.push(JSON.parse(JSON.stringify(currentPage))); // Ensure deep copy
            currentPage = {};
            currentCount = 0;
            // Start new page with continuation of the current publication if it has more elements
            if (element.publication === sortedData[sortedData.indexOf(element) + 1]?.publication) {
              currentPage[element.publication] = { elements: [] };
            }
          }
        });

        // Push the last page if it has any content
        if (Object.keys(currentPage).length > 0) {
          allData.push(currentPage);
        }
        res.render('spec-page', { "allData": allData, "types": types });
      })
      .catch(error => {
        console.error(error);
        res.status(500).send('An error occurred');
      });
  });


module.exports = router;
