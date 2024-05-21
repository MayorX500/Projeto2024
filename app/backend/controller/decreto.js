const  Client =  require ( '../config/postgres' );

// Get all documents
async function getAll (filters) {
    let fields = "id, type, code, ministry, publication_date";
    if (filters !== null) {
        fields = filters.fields ? filters.fields : fields;
    }
    let query = await Client.query ( `SELECT ${fields} FROM public.dreapp_document;` );
    return query.rows ? query.rows : null;
}

// Get a document by its ID
async function getByID (id) {
    let query = await Client.query ( `SELECT  d.*, dt.* FROM public.dreapp_document d JOIN public.dreapp_documenttext dt ON d.id = dt.other_id WHERE  d.id =  ${id} ;` );
    return query.rows ? query.rows : null;
}

// FILTERS
// Get documents by their type
async function getByType (type) {
    let query = await Client.query ( `SELECT  d.*, dt.* FROM public.dreapp_document d JOIN public.dreapp_documenttext dt ON d.id = dt.other_id WHERE  d.type =  ${type} ;` );
    return query.rows ? query.rows : null;
}

// Get documents by their code
async function getByCode (code) {
    let no_code = "" ;
    let fields = "d.id, d.type, d.code, d.publication_date, dt.*";
    if (code !== null) {
        no_code = `WHERE d.code = ${code}`;
        fields = "d.*, dt.*";

    }
    let query = await Client.query ( `SELECT  ${fields} FROM public.dreapp_document d JOIN public.dreapp_documenttext dt ON d.id = dt.other_id ${no_code};` );
    return query.rows ? query.rows : null;
}

// Get documents by publication year
async function getByYear (year) {
    let query = await Client.query ( `SELECT  d.*, dt.* FROM public.dreapp_document d JOIN public.dreapp_documenttext dt ON d.id = dt.other_id WHERE EXTRACT(YEAR FROM d.publication_date) = ${year} ;` );
    return query.rows ? query.rows : null;
}


// SORTS
// Get documents sorted by their publication date
async function getByDate () {
    let query = await Client.query ( `SELECT  d.*, dt.* FROM public.dreapp_document d JOIN public.dreapp_documenttext dt ON d.id = dt.other_id ORDER BY d.publication_date;` );
    return query.rows ? query.rows : null;
}

// Get documents sorted by their creation date
async function getByCreationDate () {
    let query = await Client.query ( `SELECT  d.*, dt.* FROM public.dreapp_document d JOIN public.dreapp_documenttext dt ON d.id = dt.other_id ORDER BY d.creation_date;` );
    return query.rows ? query.rows : null;
}


// Get all types of documents without repetition
async function getTypes () {
    let query = await Client.query ( `SELECT DISTINCT type FROM public.dreapp_document;` );
    return query.rows ? query.rows : null;
}

module.exports = {
    getByID,
    getAll,
    getByType,
    getByCode,
    getByYear,
    getByDate,
    getByCreationDate,
    getTypes
};