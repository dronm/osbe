-- Function: sess_enc_write(character varying, text, character varying,integer)

-- DROP FUNCTION sess_enc_write(character varying, text,text, character varying,integer);

CREATE OR REPLACE FUNCTION sess_enc_write(
    in_id character varying,
    in_data_enc text,
    in_key text,
    in_remote_ip character varying
    )
  RETURNS void AS
$BODY$
BEGIN
	UPDATE sessions
	SET
		set_time = now(),
		data_enc = PGP_SYM_ENCRYPT(in_data_enc, in_key)
	WHERE id = in_id;
	
	IF FOUND THEN
		RETURN;
	END IF;
	
	BEGIN
		INSERT INTO sessions (id, data_enc, set_time, session_key)
		VALUES(
			in_id,
			PGP_SYM_ENCRYPT(in_data_enc, in_key),
			now(),
			in_id
		);
		
		INSERT INTO logins(date_time_in, ip, session_id)
		VALUES(now(), in_remote_ip, in_id);
		
	EXCEPTION WHEN unique_violation THEN
		UPDATE sessions
		SET
			set_time = now(),
			data_enc = PGP_SYM_ENCRYPT(in_data_enc,in_key)
		WHERE id = in_id;
	END;
	
	RETURN;

END;	
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION sess_enc_write(character varying, text, text, character varying)
  OWNER TO ;

