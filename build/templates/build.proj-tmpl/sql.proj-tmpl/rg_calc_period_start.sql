-- Function: rg_calc_period_start(reg_types, timestampTZ)

-- DROP FUNCTION rg_calc_period_start(reg_types, timestampTZ);

/**
 * Возвращает дату начала периода итогов по любой дате
 */ 
CREATE OR REPLACE FUNCTION rg_calc_period_start(
    in_reg_type reg_types,
    in_date_time  timestampTZ)
  RETURNS timestampTZ AS
$BODY$
	SELECT
		CASE
			WHEN rg_calc_interval(in_reg_type)='1 month' THEN
				date_trunc('month', in_date_time)
			WHEN rg_calc_interval(in_reg_type)='1 day' THEN
				in_date_time::date+'00:00:00'::interval
		END
	;
$BODY$
  LANGUAGE sql IMMUTABLE
  COST 100;
ALTER FUNCTION rg_calc_period_start(reg_types,  timestampTZ)
  OWNER TO ;

