-- Function: rg_calc_period(reg_types)

-- DROP FUNCTION rg_calc_period(reg_types);

/**
 * Возвращает период рассчитанных итогов по регистру
 */
CREATE OR REPLACE FUNCTION rg_calc_period(in_reg_type reg_types)
  RETURNS timestamp without time zone AS
$BODY$
	SELECT
		coalesce(
			(SELECT date_time FROM rg_calc_periods WHERE reg_type=$1)
			,now()::date+' 00:00:00'::interval
		)
	;
$BODY$
  LANGUAGE sql STABLE
  COST 100;
ALTER FUNCTION rg_calc_period(reg_types) OWNER TO ;

