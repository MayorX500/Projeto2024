var express = require('express');
var router = express.Router();
var axios = require('axios');
const entries_per_page = 10;


function getAllTypes() {
  return axios.get('http://localhost:3000/types')
    .then(response => {
      let t = [{ type: '--Selecionar Categoria--' }];
      t = t.concat(response.data);
      return t;
    })
    .catch(error => {
      console.error(error); 
      return [];
    });
}

function separateByPublication(response) {
  let separatedData = {};

  response.data.forEach(element => {
    if (!separatedData[element.publication]) {
      separatedData[element.publication] = [];
    }
    separatedData[element.publication].push(element);
  });

  return separatedData;
}

async function getPages(url) {
  let totalPages = 1;
  totalPages = await axios.get(url).then( response => {
    let total_entries = parseInt(response.data[0].count);
    let totalPages = Math.ceil(total_entries / entries_per_page);
    return totalPages;
  }).catch(error => {
    return 1;
  });
  return totalPages;
}


router.get('/', function(req, res) {
  console.log(req.url);
  let all_types_P = getAllTypes();
  let page = req.query.page ? req.query.page : 1;

  try {
    // Remove the page query from the query string so the logic below works
    delete req.query.page;
  }
  catch (error) {
    console.log('No page query');
  }
  
  all_types_P.then(all_types => {
    if (Object.keys(req.query).length > 0) {
      // There is a query string
      // Handle the case when there's a query string
      let url = `http://localhost:3000/?page=${page}&`;
      let types = '';
      let publication_date = '';
      let order = '';
      if (req.query.type) {
        types = "type='" + req.query.type + "'";
      }
      if (req.query.date) {
        publication_date = types ? '&' : '';
        publication_date += 'publication_date=' + req.query.date;
      }
      if (req.query.item) {
        if (types || publication_date) {
          order += '&';
        }
        switch (req.query.item) {
          case 'Antigo':
            order += 'sort=publication_date&order=asc';
            break;
          case 'Recente':
            order += 'sort=publication_date&order=desc';
            break;
          case 'ID':
            order += 'sort=id';
            break;
          default:
            break;
        }
      }

      url += req.query.allDates ? (types + order) : (types + publication_date + order);

      let fields = 'fields=id,publication,code,ministry,type,description,publication_date';
      if (types || publication_date || order) {
        url += '&';
      }
      url += fields;     
      console.log(url);

      axios.get(url)
        .then(async response => {
          const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
          let allD = separateByPublication(response);
          let p = parseInt(page);
          let count_url = `http://localhost:3000/?${types ? types : ''}${publication_date ? publication_date : ''}&fields=COUNT(id)`;
          let totalPages = await getPages(count_url);
          res.render('index', { allData: allD, types: all_types, url: fullUrl, page: p, totalPages: totalPages });
        })
        .catch(error => {
          console.error(error);
          res.status(500).send('Could not load page');
        });
    }
    else {
      axios.get(`http://localhost:3000/lastday?fields=id,publication,code,ministry,type,description,publication_date&page=${page}`)
        .then(async lastDayResponse => {
          const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
          let fdate = new Date(lastDayResponse.data[0].publication_date);
          fdate.setHours(fdate.getHours() + 1);
          fdate.setUTCHours(0); // Set the timezone to UTC
          fdate = fdate.toISOString().split('T')[0];
          let allData = separateByPublication(lastDayResponse);
          let totalPages = await getPages('http://localhost:3000/count?publication_date=' + fdate + '&fields=COUNT(id)');
          let p = parseInt(page);
          res.render('index', { allData: allData, types: all_types, fdate: fdate, url: fullUrl, page: p, totalPages: totalPages });
        })
        .catch(error => {
          console.error(error);
          res.status(500).send('Could not load page');
        });
      }
    })
    .catch(error => {
      console.error(error);
      res.status(500).send('Could not load page');
    });
  }
);

router.get('/specific/:id', function(req, res) {
  axios.get('http://localhost:3000/' + req.params.id)
    .then(response => {
      res.render('spec-page', { allData: response.data[0]});
    })
    .catch(error => {
      console.error(error);
      res.status(500).send('An error occurred');
    });
});

// criar route para ir para a pagina de docs de uma publicação
router.get('/publication', function(req, res) {
  const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
  let page = req.query.page ? parseInt(req.query.page) : 1;
  let pub = req.query.pub ? req.query.pub : 'Diário da República';
  axios.get(`http://localhost:3000/?publication=${pub}&order=desc&sort=publication_date&page=${page}`)
    .then(async response => {
      let totalPages = await getPages(`http://localhost:3000/count?publication=${pub}&fields=COUNT(id)`);
      let allData = response.data;
      res.render('publication', { allData: allData, page: page, totalPages: totalPages, pub: pub, url: fullUrl });
    })
    .catch(error => {
      console.error(error);
      res.status(500).send('An error occurred');
    });
});


router.get('/ministry', function(req, res) {
  const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
  let page = req.query.page ? parseInt(req.query.page) : 1;
  let min = req.query.min ? req.query.min : 'Presidência do Conselho de Ministros';
  axios.get(`http://localhost:3000/?ministry=${min}&order=desc&sort=publication_date&page=${page}`)
    .then(async response => {
      let totalPages = await getPages(`http://localhost:3000/count?ministry=${min}&fields=COUNT(id)`);
      let allData = response.data;
      res.render('ministry', { allData: allData, page: page, totalPages: totalPages, min: min, url: fullUrl });
    })
    .catch(error => {
      console.error(error);
      res.status(500).send('An error occurred');
    });
});


router.get('/favorites', function(req, res) {
  let allData = ["doc1", "doc2", "doc3", "doc4", "doc5", "doc6", "doc7", "doc8", "doc9", "doc10"];
  res.render('favorites', { allData: allData});
  }
);


router.get('/login', function(req, res) {
  res.render('login');
});



module.exports = router;
