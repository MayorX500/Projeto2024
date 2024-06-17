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

// Get a document by its ID
async function getByID (id) {
    let query = await Client.query ( `SELECT  d.*, dt.reference_id, dt.created_at, dt.url, dt.content FROM public.dreapp_document d LEFT JOIN public.dreapp_documenttext dt ON dt.reference_id = d.id WHERE  d.id =  ${id} ;` );
    return query.rows.length > 0 ? query.rows : null;
}


// Get all types of documents without repetition
async function getTypes () {
    let query = await Client.query ( `SELECT DISTINCT type FROM public.dreapp_document;` );
    return query.rows ? query.rows : null;
}


async function createDocument ({id = 0,type, code, publication, ministry, publication_date, url, additional_link, pdf_link = "", description, content, some_id = 0, identifier = "", active = true, revoked = false, is_confidential = false, is_deleted = false, reference = "", version = 1, status = ""}) {
    let start_id = id;
    if (id === 0) {
        id_result = await Client.query('SELECT MAX(id) FROM public.dreapp_document;');
        id = id_result.rows ? (parseInt(id_result.rows[0].max) + 1) : 0;
    }
    let query = `INSERT INTO public.dreapp_document (id, type, code, publication, ministry, publication_date, identifier, active, revoked, description, pdf_link, additional_link, is_confidential, reference, version, status, created_at, some_id, is_deleted) VALUES (${id},'${type}', '${code}', '${publication}', '${ministry}', '${publication_date}', '${identifier}', ${active}, ${revoked}, '${description}', '${pdf_link}', '${additional_link}', ${is_confidential}, '${reference}', ${version}, '${status}', NOW(), ${some_id}, ${is_deleted});`;
    try {
        await Client.query(query);
    }
    catch (e) {
    }
    let txt_id_result = 0;
    if (start_id !== 0) {
        txt_id_result = await Client.query('SELECT MAX(id) FROM public.dreapp_documenttext WHERE reference_id = $1;', [id]);
    } else {
        txt_id_result = await Client.query('SELECT MAX(id) FROM public.dreapp_documenttext;');
    }
    let txt_id = txt_id_result.rows ? (parseInt(txt_id_result.rows[0].max) + 1) : 0;
    let text_query = 'INSERT INTO public.dreapp_documenttext (id ,reference_id, url, content, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING id;';
    try {
        await Client.query(text_query, [txt_id ,id, url, content]);
    }
    catch (e) {
    }
    return {id: id};
}

async function updateDocument ({id, type, code, publication, ministry, publication_date, url, additional_link, pdf_link, description, content, some_id = 0, identifier = "", active = true, revoked = false, is_confidential = false, is_deleted = false, reference = "", version = 1, status = ""}) {
    createDocument({id ,type, code, publication, ministry, publication_date, url, additional_link, pdf_link, description, content, some_id, identifier, active, revoked, is_confidential, is_deleted, reference, version, status});
    let query = 'UPDATE public.dreapp_document SET type = $1, code = $2, publication = $3, ministry = $4, publication_date = $5, identifier = $6, active = $7, revoked = $8, description = $9, pdf_link = $10, additional_link = $11, is_confidential = $12, reference = $13, version = $14, status = $15 WHERE id = $16;';
    let values = [type, code, publication, ministry, publication_date, identifier, active, revoked, description, pdf_link, additional_link, is_confidential, reference, version, status, id];
    let result = await Client.query(query, values);
    let text_query = 'UPDATE public.dreapp_documenttext SET url = $1, content = $2 WHERE reference_id = $3;';
    let text_values = [url, content, id];
    let text_result = await Client.query(text_query, text_values);
    return {id: id};
}

async function deleteDocument (id) {
    let query = 'DELETE FROM public.dreapp_document WHERE id = $1;';
    let result = await Client.query(query, [id]);
    let text_query = 'DELETE FROM public.dreapp_documenttext WHERE reference_id = $1;';
    let text_result = await Client.query(text_query, [id]);
    return {id: id};
}


module.exports = {
    getCustom,
    getByID,
    getTypes,
    createDocument,
    updateDocument,
    deleteDocument
};