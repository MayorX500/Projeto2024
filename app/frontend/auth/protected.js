const { default: axios } = require('axios');
const jwt = require('jsonwebtoken');

// Middleware to verify token

function verifyRoles(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
        return res.redirect('/login');

    }
    else {
        try {
            axios.get('http://localhost:3004/auth/roles' , { headers: { Authorization: token } })
                .then(response => {
                    response = response.data;
                    if (response.success && (response.isAdmin || response.isEditor)) {
                        next();
                    } else {
                        res.redirect('/login');
                    }
                }).catch(_ => {
                    res.redirect('/login');
                }
            );
        } catch (error) {
            res.redirect('/login');
        }
    }
}


function verifyAdmin(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
        return res.redirect('/login');
    }
    else {
        try {
            axios.get('http://localhost:3004/auth/roles' , { headers: { Authorization: token } })
                .then(response => {
                    response = response.data;
                    if (response.success && response.isAdmin) {
                        next();
                    } else {
                        res.redirect('/auth_error/40');
                    }
                }).catch(_ => {
                    res.redirect('/login');
                }
            );
        } catch (error) {
            res.redirect('/login');
        }
    }
}

function verifyEditor(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
        res.redirect('/login');
    }
    else {
        try {
            axios.get('http://localhost:3004/auth/roles' , { headers: { Authorization: token } })
                .then(response => {
                    response = response.data;
                    if (response.success && (response.isEditor || response.isAdmin)) {
                        next();
                    } else {
                        res.redirect('/auth_error/403');
                    }
                }).catch(_ => {
                    res.redirect('/auth_error/403');
                }
            );
        } catch (error) {
            res.redirect('/auth_error/403');
        }
    }
}

module.exports = { verifyRoles, verifyAdmin, verifyEditor };