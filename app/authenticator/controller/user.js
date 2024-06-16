const UserDB =  require ( '../config/postgres' );
const jwt = require('jsonwebtoken');
const SECRET = require('../config/secret');
const User = require('../model/user');
const bcrypt = require('bcrypt');

/*
CREATE TABLE public.dreapp_user (
    id BIGINT PRIMARY KEY, -- Social security number (xxx xxx xxx)
    password TEXT,
    email TEXT,
    full_name TEXT,
    isadmin BOOLEAN,
    iseditor BOOLEAN,
    posts_created BIGINT,
    favourites BIGINT[],
    token TEXT,
    created_at TIMESTAMPTZ,
    is_deleted BOOLEAN
);
*/

function create_token (id,full_name){
    // token expires in 1 day
    let token = jwt.sign({id:id, full_name:full_name}, SECRET, {expiresIn: '1d'});
    return token;
}

function validate_token (token){
    let token_obj = jwt.verify(token, SECRET);
    let valid = -1;
    if (token_obj !== null){
        if (token_obj.exp >= Math.floor(Date.now() / 1000)){
            valid = token_obj.id;
        }
    }
    console.log(`Valid: ${valid}`);
    return valid;
}

async function createUser ({id, password, email, full_name, isadmin = false, iseditor = false, posts_created = 0, favourites = [], token = null, created_at = "NOW()", is_deleted = false}) {
    let message = '';
    let success = false;
    let user = await getUser({id});
    if (user != null){
        message =  `Utilizador com o NIF '${id}' já existe.`;
    }
    else {
        if (token === null){
            token = create_token(id, full_name);
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        password = hashedPassword;
        let query = `INSERT INTO public.dreapp_user (id, password, email, full_name, isadmin, iseditor, posts_created, favourites, token, created_at, is_deleted) VALUES ('${id}', '${password}', '${email}', '${full_name}', ${isadmin}, ${iseditor}, ${posts_created}, '{${favourites.join(',')}}', '${token}', ${created_at}, ${is_deleted}) RETURNING *`;
        let result = await UserDB.query(query);
        if (result.rowCount !== 0){
            success = true;
            user = User.fromJSON(result.rows[0]);
        }
    }
    return {user:user, message: message, success: success};
}

async function getUser ({id}) {
    let query = `SELECT * FROM public.dreapp_user WHERE id = '${id}' AND is_deleted = false`;
    let result = await UserDB.query(query);
    let user = null;
    if (result.rows.length == 1){
        user = User.fromJSON(result.rows[0]);
    }
    return user;
}

async function updateUser ({id, password, email, full_name, isadmin, iseditor, posts_created, favourites, token, created_at, is_deleted}) {
    // Ensure created_at is properly formatted as a string

    console.log(`Id: ${id}, password: ${password}, email: ${email}, full_name: ${full_name}, isadmin: ${isadmin}, iseditor: ${iseditor}, posts_created: ${posts_created}, favourites: ${favourites}, token: ${token}, created_at: ${created_at}, is_deleted: ${is_deleted}`);

    let formattedCreatedAt = created_at ? `'${created_at.toISOString()}'` : 'NULL';
    
    let query = `
        UPDATE public.dreapp_user 
        SET 
            password = '${password}', 
            email = '${email}', 
            full_name = '${full_name}', 
            isAdmin = ${isadmin}, 
            isEditor = ${iseditor}, 
            posts_created = ${posts_created}, 
            favourites = '{${favourites.join(',')}}', 
            token = '${token}', 
            created_at = ${formattedCreatedAt}, 
            is_deleted = ${is_deleted} 
        WHERE 
            id = '${id}' 
        RETURNING *`;
    
    let result = await UserDB.query(query);
    let user = null;
    if (result.rows.length == 1){
        user = User.fromJSON(result.rows[0]);
    }
    return user;
}

async function deleteUser ({id}) {
    let query = `UPDATE public.dreapp_user SET is_deleted = true WHERE id = '${id}' RETURNING *`;
    let result = await UserDB.query(query);
    let user = null;
    if (result.rows.length == 1){
        user = User.fromJSON(result.rows[0]);
    }
    return user;
}

async function login({ id }) {
    const query = 'SELECT * FROM public.dreapp_user WHERE id = $1';
    const values = [id];
    const result = await UserDB.query(query, values);

    let user = null;
    if (result.rows.length === 1) {
        user = User.fromJSON(result.rows[0]);
        if (user.is_deleted){
            user = null;
        }
        else {
            if (user.token === null){
                user.token = create_token(user.id, user.full_name);
                await updateUser(user.toJSON());
            }
            // check if the token is still valid (not expired), if not, create a new one and update the user
            let token = jwt.verify(user.token, SECRET);
            if (token === null){
                user.token = create_token(user.id, user.full_name);
                updateUser(user.toJSON());
            }
            else {
                if (token.exp < Math.floor(Date.now() / 1000)){
                    user.token = create_token(user.id, user.full_name);
                    updateUser(user.toJSON());
                }    
            }
        }
    }
    return user;
}

module.exports = {
    createUser,
    getUser,
    updateUser,
    deleteUser,
    login,
    validate_token
};