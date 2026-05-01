-- Function: doc_log_insert(doc_types, integer, timestampTZ)

-- DROP FUNCTION doc_log_insert(doc_types, integer, timestampTZ);

CREATE OR REPLACE FUNCTION doc_log_insert(
    doc_types,
    integer,
    timestampTZ)
  RETURNS void AS
$BODY$
	INSERT INTO doc_log (doc_type,doc_id,date_time) VALUES ($1,$2,$3);
$BODY$
  LANGUAGE sql VOLATILE
  COST 100;
ALTER FUNCTION doc_log_insert(doc_types, integer, timestampTZ)
  OWNER TO ;

