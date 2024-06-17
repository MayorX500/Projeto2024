var express = require('express');
var router = express.Router();
var axios = require('axios');
const {verifyAdmin, verifyEditor, verifyRoles} = require('../auth/protected');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const entries_per_page = 10;


const multer  = require('multer')
const upload = multer({ dest: './public/data/uploads' })



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
  totalPages = axios.get(url).then( response => {
    let total_entries = parseInt(response.data[0].count);
    let totalPages = Math.ceil(total_entries / entries_per_page);
    return totalPages;
  }).catch(error => {
    return 1;
  });
  return totalPages;
}


router.get('/', function(req, res) {
  let all_types_P = getAllTypes();
  let page = req.query.page ? req.query.page : 1;

  try {
    // Remove the page query from the query string so the logic below works
    delete req.query.page;
  }
  catch (error) {
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
          res.render('index', { allData: allData, types: all_types, fdate: fdate, url: fullUrl, page: p, totalPages: totalPages});
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

router.get('/specific/:id', async function(req, res) {
  let cookie = req.cookies.token ? req.cookies.token : null;
  let response = await axios.get('http://localhost:3004/auth/favorite', { headers: { Authorization: cookie } })
  let user_faved = false;
  let {success, message, user} = response.data;
  if (success) {
    user_faved = user.favourites.includes(req.params.id);
  }
  axios.get('http://localhost:3000/' + req.params.id)
    .then(response => {
      res.render('spec-page', { allData: response.data[0], user_faved: user_faved });
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


router.get('/favorites', async function(req, res) {
  let page = req.query.page ? parseInt(req.query.page) : 1;
  let token = req.cookies.token;
  let fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
  if (!token) { // User is not logged in
    res.redirect('/login');
  } else {
    let response = await axios.get('http://localhost:3004/auth/favorite', { headers: { Authorization: token } });
    let user_favorites = response.data.user.favourites;
    let allData = [];
    let user = response.data.user;
    let totalPages = Math.ceil(user_favorites.length / entries_per_page);
    for (let i = 0; i < user_favorites.length; i++) {
      let doc = await axios.get('http://localhost:3000/' + user_favorites[i]);
      if (doc != null && doc.data != undefined){
        allData.push(doc.data[0]);
      }
      else{

      }
    }
    let start = (page - 1) * entries_per_page;
    let end = start + entries_per_page;

    allData = allData.slice(start, end);
    res.render('favorites', { user: user, allData: allData, user_favorites: user_favorites, page: page, totalPages: totalPages, url: fullUrl });
  }
});

router.post('/favorite', async function(req, res) {
  let favorite = req.body.favorite;
  let token = req.cookies.token;
  if (!token) { // User is not logged in
    res.redirect('/login');
  } else {
    await axios.post('http://localhost:3000/favorite', { favorite: favorite }, { headers: { Authorization: token } });
    res.redirect('/specific/' + favorite);
  }
});

router.get('/logout', function(req, res) {
  res.clearCookie('token');
  res.redirect('/');
});

router.post('/login', async function(req, res) {
  let valid = axios.post('http://localhost:3004/auth/login', { id: req.body.nif, password: req.body.password });
  valid.then(response => {
    if (response.data.success) {
      res.cookie('token', response.data.token, { httpOnly: false, secure: false});
      res.redirect('/');
    }
    else {
      res.render('login', { error_message: response.data.token });
    }
  })

});

router.get('/login', function(req, res) {
  res.render('login', { error_message: '' });
});

router.post('/register', async function(req, res) {
  let user_builder = { id: req.body.nif, password: req.body.password, email: req.body.email, full_name: req.body.name };

  let created_user = await axios.post('http://localhost:3004/auth/register', user_builder);
  if (created_user.data.success) {
    res.redirect('/login');
  }
  else {
    let options = {success: created_user.data.success, error_message: created_user.data.message};
    res.render('register', options);
  }
});

router.get('/register', function(req, res) {
  res.render('register', {success: true, error_message: ''});
});


router.get('/create', verifyEditor, function(req, res) {
  res.render('createDoc');
});

router.post('/submit_document', upload.single('pdf_link') , async function(req, res) {
  let token = req.cookies.token;
  let doc = req.body;

  // Save the PDF file to the specified folder
  if (req.file) {
    const newPath = path.join(__dirname,'..','/public/data/uploads', req.file.originalname);
    const public_path = path.join('/data/uploads', req.file.originalname);
    const pdf_path = path.join(__dirname, '..', req.file.path);
    try {
      fs.renameSync(pdf_path, newPath);
      doc.pdf_link = public_path; // Save the file path to the pdf_link field
    } catch (error) {
      doc.pdf_link = "";
    }
  }

  let response = await axios.post('http://localhost:3000/', doc, { headers: { Authorization: token } });
  if (response.data.success) {
    res.redirect('/specific/' + response.data.new_id);
  }
  else {
    res.redirect('/auth_error/504?custom_message=' + response.data.message);
  }
});



router.get('/edit/:id', verifyEditor , function(req, res) {
  try {
    axios.get('http://localhost:3000/' + req.params.id)
      .then(response => {
        let date = new Date(response.data[0].publication_date);
        date.setHours(date.getHours() + 1);
        date = date.toISOString().split('T')[0];
        response.data[0].publication_date = date;
        res.render('editDoc', { doc: response.data[0]});
      })
      .catch(error => {
        console.error(error);
        res.status(500).send('An error occurred');
      });
  }
  catch (error) {
    res.status(500).send('An error occurred');
  }
});

router.get('/delete/:id', verifyEditor, function(req, res) {
  axios.delete('http://localhost:3000/' + req.params.id)
    .then(response => {
      res.redirect('/');
    })
    .catch(error => {
      console.error(error);
      res.status(500).send('An error occurred');
    });
});

router.post('/update_document', upload.single('pdf_link') , async function(req, res) {
  let token = req.cookies.token;
  let doc = req.body;
  let id = req.body.id;

  // Save the PDF file to the specified folder
  if (req.file) {
    const newPath = path.join(__dirname,'..','/public/data/uploads', req.file.originalname);
    const public_path = path.join('/data/uploads', req.file.originalname);
    const pdf_path = path.join(__dirname, '..', req.file.path);
    try {
      fs.renameSync(pdf_path, newPath);
      doc.pdf_link = public_path; // Save the file path to the pdf_link field
    } catch (error) {
      doc.pdf_link = "";
    }
  }

  let response = await axios.put('http://localhost:3000/' + id, doc, { headers: { Authorization: token } });
  if (response.data.success) {
    res.redirect('/specific/' + id);
  }
  else {
    res.redirect('/auth_error/504?custom_message=' + response.data.message);
  }
}
);


router.get('/auth_error/:code', function(req, res) {
  let message = '';
  switch (req.params.code) {
    case '403':
      message = 'Não tem permissões para aceder a esta página.';
      break;
    case '402':
      message = 'Necessita de permissões de administrador para aceder a esta página.';
      break;
    case '504':
      message = 'Ocorreu um erro ao criar o documento.';
      break;
    default:
      message = 'Erro desconhecido';
      break;
  }
  res.render('auth_error', { message: message });
});


router.get('/export', verifyAdmin, function(req, res) {
  res.render('export_import', { exp: true });
});

router.get('/import', verifyAdmin, function(req, res) {
  res.render('export_import', { exp: false });
});


module.exports = router;
