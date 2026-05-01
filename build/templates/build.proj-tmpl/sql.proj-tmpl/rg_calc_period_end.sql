-- Function: rg_calc_period_end(reg_types, timestampTZ)

 DROP FUNCTION rg_calc_period_end(reg_types, timestampTZ);

/**
 * Возвращает дату конца периода итогов по любой дате
 */ 

CREATE OR REPLACE FUNCTION rg_calc_period_end(
    in_reg_type reg_types,
    in_date_time timestampTZ)
  RETURNS timestamp AS
$BODY$
	SELECT
		CASE
			WHEN rg_calc_interval(in_reg_type)='1 month' THEN
				last_month_day(in_date_time::date)+'23:59:59.999'::interval
			WHEN rg_calc_interval(in_reg_type)='1 day' THEN
				in_date_time::date+'23:59:59.999'::interval
		END	
	;
$BODY$
  LANGUAGE sql IMMUTABLE
  COST 100;
ALTER FUNCTION rg_calc_period_end(reg_types, timestampTZ)
  OWNER TO ;

