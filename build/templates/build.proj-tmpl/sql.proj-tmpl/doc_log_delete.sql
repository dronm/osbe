-- Function: doc_log_delete(doc_types, integer)

-- DROP FUNCTION doc_log_delete(doc_types, integer);

CREATE OR REPLACE FUNCTION doc_log_delete(
    doc_types,
    integer)
  RETURNS void AS
$BODY$
	DELETE FROM doc_log WHERE doc_type=$1 AND doc_id=$2;
$BODY$
  LANGUAGE sql VOLATILE
  COST 100;
ALTER FUNCTION doc_log_delete(doc_types, integer)
  OWNER TO ;

