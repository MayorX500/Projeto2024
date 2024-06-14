CREATE INDEX idx_id ON dreapp_document(id);
CREATE INDEX idx_reference_id ON dreapp_documenttext(reference_id);
CREATE INDEX idx_id ON dreapp_user(id);
ANALYZE dreapp_document;
ANALYZE dreapp_documenttext;
ANALYZE dreapp_user;