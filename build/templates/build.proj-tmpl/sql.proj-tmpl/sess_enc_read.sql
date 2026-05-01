-- Function: sess_enc_read(character varying, text)

-- DROP FUNCTION sess_enc_read(character varying, text);

CREATE OR REPLACE FUNCTION sess_enc_read(in_id character varying,in_key text)
  RETURNS text AS
$BODY$
	SELECT PGP_SYM_DECRYPT(data_enc,in_key) FROM sessions WHERE id = in_id LIMIT 1;
$BODY$
  LANGUAGE sql VOLATILE
  COST 100;
ALTER FUNCTION sess_enc_read(character varying, text)
  OWNER TO ;

