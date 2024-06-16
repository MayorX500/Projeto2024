const { default: axios } = require('axios');
const jwt = require('jsonwebtoken');

// Middleware to verify token

function verifyLogin(req, res, next) {
    const token = req.header('Authorization');
    try {
        axios.get('http://localhost:3004/auth/information' , { headers: { Authorization: token } })
        .then(response => {
            if (response.data.success) {
                next();
            } else {
                res.redirect('/login');
            }
        })
    }   catch (error) {
        res.redirect('/login');
    }
};

module.exports = verifyLogin;