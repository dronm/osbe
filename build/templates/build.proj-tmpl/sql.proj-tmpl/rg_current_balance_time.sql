-- Function: rg_current_balance_time()

-- DROP FUNCTION rg_current_balance_time();

CREATE OR REPLACE FUNCTION rg_current_balance_time()
  RETURNS timestamp without time zone AS
$BODY$
	SELECT '3000-01-01 00:00:00'::timestamp without time zone;
$BODY$
LANGUAGE sql IMMUTABLE COST 100;
ALTER FUNCTION rg_current_balance_time() OWNER TO ;

