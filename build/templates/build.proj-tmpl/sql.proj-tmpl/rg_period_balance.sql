-- Function: rg_period_balance(reg_types, timestamp without time zone)

-- DROP FUNCTION rg_period_balance(reg_types, timestamp without time zone);

CREATE OR REPLACE FUNCTION rg_period_balance(
    in_reg_type reg_types,
    in_date_time timestamp without time zone)
  RETURNS timestamp without time zone AS
$BODY$
	SELECT
		rg_calc_period_end(in_reg_type,in_date_time) - '0.000001 second'::interval
	;
$BODY$
  LANGUAGE sql IMMUTABLE
  COST 100;
ALTER FUNCTION rg_period_balance(reg_types, timestamp without time zone) OWNER TO ;

