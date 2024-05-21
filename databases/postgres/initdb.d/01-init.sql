-- Schema for table dreapp_document
CREATE TABLE public.dreapp_document (
    id BIGINT PRIMARY KEY,
    some_id BIGINT,
    type TEXT,
    code TEXT,
    ministry TEXT,
    publication TEXT,
    identifier TEXT,
    active BOOLEAN,
    revoked BOOLEAN,
    publication_date DATE,
    description TEXT,
    pdf_link TEXT,
    additional_link TEXT,
    is_confidential BOOLEAN,
    created_at TIMESTAMPTZ,
    is_deleted BOOLEAN,
    reference TEXT,
    version INT,
    status TEXT
);

-- Schema for table dreapp_documenttext
CREATE TABLE public.dreapp_documenttext (
    id BIGINT PRIMARY KEY,
    reference_id BIGINT, -- REFERENCES dreapp_document(id),
    created_at TIMESTAMPTZ,
    url TEXT,
    content TEXT
);
