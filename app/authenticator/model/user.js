class User {
    constructor(id, password, email, full_name, isadmin, iseditor, posts_created, favourites, token, created_at, is_deleted) {
        this._id = id;
        this._password = password;
        this._email = email;
        this._full_name = full_name;
        this._isadmin = isadmin;
        this._iseditor = iseditor;
        this._posts_created = posts_created;
        this._favourites = favourites;
        this._token = token;
        this._created_at = created_at;
        this._is_deleted = is_deleted;
    }

    get id() {
        return this._id;
    }

    set id(id) {
        this._id = id;
    }

    get password() {
        return this._password;
    }

    set password(password) {
        this._password = password;
    }

    get email() {
        return this._email;
    }

    set email(email) {
        this._email = email;
    }

    get full_name() {
        return this._full_name;
    }

    set full_name(full_name) {
        this._full_name = full_name;
    }

    get isadmin() {
        return this._isadmin;
    }

    set isadmin(isadmin) {
        this._isadmin = isadmin;
    }

    get iseditor() {
        return this._iseditor;
    }

    set iseditor(iseditor) {
        this._iseditor = iseditor;
    }

    get posts_created() {
        return this._posts_created;
    }

    set posts_created(posts_created) {
        this._posts_created = posts_created;
    }

    get favourites() {
        return this._favourites;
    }

    set favourites(favourites) {
        this._favourites = favourites;
    }

    addFavorite(favourite) {
        let favs = this._favourites;
        let success = false;
        if (!this._favourites) {
            this._favourites = [];
        }
        this._favourites = [];
        for (let i = 0; i < favs.length; i++) {
            this._favourites.push(parseInt(favs[i]));
        }
        if (!this._favourites.includes(favourite)) {
            this._favourites.push(favourite);
            success = true;
        }
        return success;
    }

    removeFavorite(favourite) {
        this._favourites = this._favourites.filter(fav => fav !== favourite);
    }

    get token() {
        return this._token;
    }

    set token(token) {
        this._token = token;
    }

    get created_at() {
        return this._created_at;
    }

    set created_at(created_at) {
        this._created_at = created_at;
    }

    get is_deleted() {
        return this._is_deleted;
    }

    set is_deleted(is_deleted) {
        this._is_deleted = is_deleted;
    }

    toJSON() {
        return {
            id: this._id,
            password: this._password,
            email: this._email,
            full_name: this._full_name,
            isadmin: this._isadmin,
            iseditor: this._iseditor,
            posts_created: this._posts_created,
            favourites: this._favourites,
            token: this._token,
            created_at: this._created_at,
            is_deleted: this._is_deleted
        };
    }

    static fromJSON(json) {
        return new User(json.id, json.password, json.email, json.full_name, json.isadmin, json.iseditor, json.posts_created, json.favourites, json.token, json.created_at, json.is_deleted);
    }
}

module.exports = User;
