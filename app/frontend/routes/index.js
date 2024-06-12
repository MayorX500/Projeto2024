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

function pagination(response) {
  let allData = [];
  let currentPage = {};
  let currentCount = 0;

  const sortedData = response.data.sort((a, b) => {
    // Check if 'publication' property exists in both elements
    if (a.publication && b.publication) {
      return a.publication.localeCompare(b.publication);
    }
    // If 'publication' property is undefined in either element, return 0
    return 0;
  });

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
  return allData;
}


router.get('/', function(req, res) {
  console.log(req.url);
  let all_types_P = getAllTypes();

  all_types_P.then(all_types => {
    if (Object.keys(req.query).length > 0) {
      // There is a query string
      // Handle the case when there's a query string
      let url = 'http://localhost:3000/?';
      let types = '';
      let publication_date = '';
      let order = '';

      if (req.query.filter) {
        types = Array.isArray(req.query.filter) ? req.query.filter.join('&type=') : req.query.filter;
        types = 'type=' + types; // Add 'type=' prefix to the first type
      }
      if (req.query.date) {
        publication_date = types ? '&' : '';
        // I want to get all documents from that date, so I need to add 1  to the date
        // query needs to be a string in the format 'YYYY-MM-DDTHH:MM:SS.000Z' 
        publication_date += 'publication_date=' + req.query.date ;

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
      url += types + publication_date + order + '&fields=id,publication,code,ministry,type,description,publication_date';
      console.log(url);

      /*
      Há um problema com a query string que é passada para o backend.
      A query string é passada para o backend como um objeto, mas o backend
      espera que a query string seja passada como uma string.
      Exemplo:
      query string: { filter: 'Decreto' }
      query string esperada: 'filter=Decreto'


      Não mas não é só isso. A query string pode ter mais de um valor para o mesmo parâmetro.
      Exemplo:
      query string: { filter: ['Decreto', 'Portaria'] }
      query string esperada: 'filter=Decreto&filter=Portaria'

      É necessário passar a query string como uma string para o backend.

      É preciso ter em atenção ao formato das datas que são passadas na query string.
      Exemplo:
      query string: { date: '2021-01-01' }
      formato esperado: '2021-01-01T00:00:00.000Z'
      !! A data deve ser passada no formato UTC !!
      Como existem datas com o mesmo dia mas horas diferentes, é necessário passar a data com a hora.
      Mas nós queremos todos daquela data independentemente da hora, por isso é necessário passar a data com a hora 00:00:00.000Z
      */


      axios.get(url)
        .then(response => {
          let allData = pagination(response);

          res.render('index', { allData: allData, types: all_types });
        })
        .catch(error => {
          console.error(error);
          res.status(500).send('Could not load page');
        });
    }
    else {
      axios.get('http://localhost:3000/lastday?fields=id,publication,code,ministry,type,description,publication_date')
        .then(lastDayResponse => {
          let fdate = new Date(lastDayResponse.data[0].publication_date);
          fdate.setHours(fdate.getHours() + 1);
          fdate.setUTCHours(0); // Set the timezone to UTC
          fdate = fdate.toISOString().split('T')[0];
          let allData = pagination(lastDayResponse);

          res.render('index', { allData: allData, types: all_types, fdate: fdate });
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


module.exports = router;
