-- Function: rg_total_recalc_{{REG_TABLE}}()

-- DROP FUNCTION rg_total_recalc_{{REG_TABLE}}();

--!!!ДОДЕЛАТЬ!!!

CREATE OR REPLACE FUNCTION rg_total_recalc_{{REG_TABLE}}()
  RETURNS void AS
$BODY$  
DECLARE
	period_row RECORD;
	TA_PERIOD timestamp without time zone;
	CURRENT_PERIOD timestamp without time zone;
BEGIN	
	TA_PERIOD = rg_current_balance_time();
	CURRENT_PERIOD = rg_calc_period('{{REG_ID}}'::reg_types);
	
	FOR period_row IN
		WITH
		periods AS (
			(SELECT
				DISTINCT date_trunc('month', date_time) AS d,
				material_id
			FROM ra_{{REG_TABLE}})
			UNION		
			(SELECT
				date_time AS d,
				material_id
			FROM rg_{{REG_TABLE}}
			WHERE date_time<=CURRENT_PERIOD
			)
			ORDER BY d			
		)
		SELECT sub.d,sub.material_id,sub.balance_fact,sub.balance_paper
		FROM
		(
		SELECT
			periods.d,
			periods.material_id,
			COALESCE((
				SELECT SUM(CASE WHEN deb THEN quant ELSE 0 END)-SUM(CASE WHEN NOT deb THEN quant ELSE 0 END)
				FROM ra_{{REG_TABLE}} AS ra WHERE ra.date_time <= last_month_day(periods.d::date)+'23:59:59'::interval AND ra.material_id=periods.material_id
			),0) AS balance_fact,
			
			(
			SELECT SUM(quant) FROM rg_{{REG_TABLE}} WHERE date_time=periods.d AND material_id=periods.material_id
			) AS balance_paper
			
		FROM periods
		) AS sub
		WHERE sub.balance_fact<>sub.balance_paper ORDER BY sub.d	
	LOOP
		
		UPDATE rg_{{REG_TABLE}} AS rg
		SET quant = period_row.balance_fact
		WHERE rg.date_time=period_row.d AND rg.material_id=period_row.material_id;
		
		IF NOT FOUND THEN
			INSERT INTO rg_{{REG_TABLE}} (date_time,material_id,quant)
			VALUES (period_row.d,period_row.material_id,period_row.balance_fact);
		END IF;
	END LOOP;

	--АКТУАЛЬНЫЕ ИТОГИ
	DELETE FROM rg_{{REG_TABLE}} WHERE date_time>CURRENT_PERIOD;
	
	INSERT INTO rg_{{REG_TABLE}} (date_time,material_id,quant)
	(
	SELECT
		TA_PERIOD,
		rg.material_id,
		COALESCE(rg.quant,0) +
		COALESCE((
		SELECT sum(ra.quant) FROM
		ra_form_products AS ra
		WHERE ra.date_time BETWEEN CURRENT_PERIOD AND last_month_day(CURRENT_PERIOD::date)+'23:59:59'::interval
			AND ra.material_id=rg.material_id
			AND ra.deb=TRUE
		),0) - 
		COALESCE((
		SELECT sum(ra.quant) FROM
		ra_{{REG_TABLE}} AS ra
		WHERE ra.date_time BETWEEN CURRENT_PERIOD AND last_month_day(CURRENT_PERIOD::date)+'23:59:59'::interval
			AND ra.material_id=rg.material_id
			AND ra.deb=FALSE
		),0)
		
	FROM rg_{{REG_TABLE}} AS rg
	WHERE date_time=(CURRENT_PERIOD-'1 month'::interval)
	);	
END;	
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION rg_total_recalc_{{REG_TABLE}}()
  OWNER TO ;

