const  Client =  require ( '../config/postgres' );

let allowList = ["SELECT", "INSERT", "UPDATE", "DELETE"];

// Get with custom query
async function getCustom (query) {
    let isValidStart = allowList.some(word => query.startsWith(word));

    if (!isValidStart) {
        return null;
    }
    let result = await Client.query ( query );
    return result.rows ? result.rows : null;
}

// Get all documents
async function getAll (filters) {
    console.log(filters);
    let fields = "id, type, code, ministry, publication_date";
    if (filters !== null) {
        fields = filters.fields ? filters.fields : fields;
    }
    let query = await Client.query ( `SELECT ${fields} FROM public.dreapp_document;` );
    return query.rows ? query.rows : null;
}

// Get a document by its ID
async function getByID (id) {
    let query = await Client.query ( `SELECT  d.*, dt.reference_id, dt.created_at, dt.url, dt.content FROM public.dreapp_document d LEFT JOIN public.dreapp_documenttext dt ON dt.reference_id = d.id WHERE  d.id =  ${id} ;` );
    return query.rows ? query.rows : null;
}

// Get documents by their date
async function getDate (date) {
    date = date.toString();
    let query = await Client.query ( `SELECT  d.*, dt.reference_id, dt.created_at, dt.url, dt.content FROM public.dreapp_document d LEFT JOIN public.dreapp_documenttext dt ON d.id = dt.reference_id WHERE  d.publication_date =  "${date}" ;` );
    return query.rows ? query.rows : null;
}


// FILTERS
// Get documents by their type
async function getByType (type) {
    let query = await Client.query ( `SELECT  d.*, dt.reference_id, dt.created_at, dt.url, dt.content FROM public.dreapp_document d LEFT JOIN public.dreapp_documenttext dt ON d.id = dt.reference_id WHERE  d.type =  ${type} ;` );
    return query.rows ? query.rows : null;
}

// Get documents by their code
async function getByCode (code) {
    let no_code = "" ;
    let fields = "d.id, d.type, d.code, d.publication_date, dt.reference_id, dt.created_at, dt.url, dt.content";
    if (code !== null) {
        no_code = `WHERE d.code = ${code}`;
        fields = "d.*, dt.reference_id, dt.created_at, dt.url, dt.content";

    }
    let query = await Client.query ( `SELECT  ${fields} FROM public.dreapp_document d LEFT JOIN public.dreapp_documenttext dt ON d.id = dt.reference_id ${no_code};` );
    return query.rows ? query.rows : null;
}

// Get documents by publication year
async function getByYear (year) {
    let query = await Client.query ( `SELECT  d.*, dt.reference_id, dt.created_at, dt.url, dt.content FROM public.dreapp_document d LEFT JOIN public.dreapp_documenttext dt ON d.id = dt.reference_id WHERE EXTRACT(YEAR FROM d.publication_date) = ${year} ;` );
    return query.rows ? query.rows : null;
}

// Get last X documents
async function getLast (limit, fields) {
    let f = fields ? fields : "*";
    let query = await Client.query ( `SELECT ${f} FROM public.dreapp_document ORDER BY publication_date DESC LIMIT ${limit};` );
    return query.rows ? query.rows : null;
}

// SORTS
// Get documents sorted by their publication date
async function getByDate () {
    let query = await Client.query ( `SELECT  d.*, dt.reference_id, dt.created_at, dt.url, dt.content FROM public.dreapp_document d LEFT JOIN public.dreapp_documenttext dt ON d.id = dt.reference_id ORDER BY d.publication_date;` );
    return query.rows ? query.rows : null;
}

// Get documents sorted by their creation date
async function getByCreationDate () {
    let query = await Client.query ( `SELECT  d.*, dt.reference_id, dt.created_at, dt.url, dt.content FROM public.dreapp_document d LEFT JOIN public.dreapp_documenttext dt ON d.id = dt.reference_id ORDER BY d.creation_date;` );
    return query.rows ? query.rows : null;
}


// Get all types of documents without repetition
async function getTypes () {
    let query = await Client.query ( `SELECT DISTINCT type FROM public.dreapp_document;` );
    return query.rows ? query.rows : null;
}

module.exports = {
    getCustom,
    getByID,
    getAll,
    getByType,
    getByCode,
    getByYear,
    getByDate,
    getLast,
    getDate,
    getByCreationDate,
    getTypes
};