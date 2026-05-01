-- Function: rg_total_recalc_form_products()

-- DROP FUNCTION rg_total_recalc_form_products();

--!!!ДОДЕЛАТЬ!!!

CREATE OR REPLACE FUNCTION rg_total_recalc_form_products()
  RETURNS void AS
$BODY$  
DECLARE
	period_row RECORD;
	v_act_date_time timestamp without time zone;
	v_cur_period timestamp without time zone;
BEGIN	
	v_act_date_time = reg_current_balance_time();
	SELECT date_time INTO v_cur_period FROM rg_calc_periods;
	
	FOR period_row IN
		WITH
		periods AS (
			(SELECT
				DISTINCT date_trunc('month', date_time) AS d,
				material_id
			FROM ra_form_products)
			UNION		
			(SELECT
				date_time AS d,
				material_id
			FROM rg_form_products WHERE date_time<=v_cur_period
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
				FROM ra_form_products AS ra WHERE ra.date_time <= last_month_day(periods.d::date)+'23:59:59'::interval AND ra.material_id=periods.material_id
			),0) AS balance_fact,
			
			(
			SELECT SUM(quant) FROM rg_form_products WHERE date_time=periods.d AND material_id=periods.material_id
			) AS balance_paper
			
		FROM periods
		) AS sub
		WHERE sub.balance_fact<>sub.balance_paper ORDER BY sub.d	
	LOOP
		
		UPDATE rg_form_products AS rg
		SET quant = period_row.balance_fact
		WHERE rg.date_time=period_row.d AND rg.material_id=period_row.material_id;
		
		IF NOT FOUND THEN
			INSERT INTO rg_form_products (date_time,material_id,quant)
			VALUES (period_row.d,period_row.material_id,period_row.balance_fact);
		END IF;
	END LOOP;

	--АКТУАЛЬНЫЕ ИТОГИ
	DELETE FROM rg_form_products WHERE date_time>v_cur_period;
	
	INSERT INTO rg_form_products (date_time,material_id,quant)
	(
	SELECT
		v_act_date_time,
		rg.material_id,
		COALESCE(rg.quant,0) +
		COALESCE((
		SELECT sum(ra.quant) FROM
		ra_form_products AS ra
		WHERE ra.date_time BETWEEN v_cur_period AND last_month_day(v_cur_period::date)+'23:59:59'::interval
			AND ra.material_id=rg.material_id
			AND ra.deb=TRUE
		),0) - 
		COALESCE((
		SELECT sum(ra.quant) FROM
		ra_form_products AS ra
		WHERE ra.date_time BETWEEN v_cur_period AND last_month_day(v_cur_period::date)+'23:59:59'::interval
			AND ra.material_id=rg.material_id
			AND ra.deb=FALSE
		),0)
		
	FROM rg_form_products AS rg
	WHERE date_time=(v_cur_period-'1 month'::interval)
	);	
END;	
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION rg_total_recalc_form_products()
  OWNER TO ;




-- Function: bellagio.rg_total_recalc_products(timestamp without time zone)

-- DROP FUNCTION bellagio.rg_total_recalc_products(timestamp without time zone);

CREATE OR REPLACE FUNCTION bellagio.rg_total_recalc_products(timestamp without time zone)
  RETURNS void AS
$BODY$  
	DELETE FROM rg_products
	WHERE
		$1 IS NULL
		OR ($1 IS NOT NULL AND date_time>=$1);
		
	INSERT INTO rg_products
	(date_time,store_id,product_id,doc_production_id,
	quant)
	(
		WITH
		--ДОДЕЛАТЬ: добавить остатки до $1
		acts AS(
			SELECT
				rg_calc_period_start('product',ra.date_time) AS period,
				ra.store_id,
				ra.product_id,
				ra.doc_production_id,
				SUM(CASE WHEN ra.deb THEN 1 ELSE -1 END*ra.quant) AS quant
			FROM ra_products AS ra
			WHERE $1 IS NULL OR ra.date_time>=$1
			GROUP BY
				rg_calc_period_start('product',ra.date_time),
				ra.store_id,
				ra.product_id,
				ra.doc_production_id
			HAVING SUM(CASE WHEN ra.deb THEN 1 ELSE -1 END*ra.quant)<>0
		)
		SELECT qm.*
		FROM	
			((SELECT
				q.period,
				q.store_id,
				q.product_id,
				q.doc_production_id,

				COALESCE(
				(SELECT sub.quant
				FROM acts AS sub
				WHERE sub.period<q.period AND sub.store_id=q.store_id AND sub.product_id=q.product_id AND sub.doc_production_id=q.doc_production_id
				),0) + q.quant AS quant
			FROM acts AS q)
			
			UNION ALL
			
			--актуальные итоги
			(SELECT
				reg_current_balance_time(),
				q2.store_id,
				q2.product_id,
				q2.doc_production_id,
				SUM(q2.quant) AS quant
			FROM acts AS q2
			GROUP BY
				reg_current_balance_time(),
				q2.store_id,
				q2.product_id,
				q2.doc_production_id
			HAVING SUM(q2.quant)<>0
			)
			) AS qm
		WHERE qm.quant<>0	
	);
	
	--актуальные итоги
	/*
	(SELECT
		reg_current_balance_time(),
		ra.store_id,
		ra.product_id,
		ra.doc_production_id,
		SUM(CASE WHEN ra.deb THEN 1 ELSE -1 END*ra.quant) AS quant
	FROM ra_products AS ra
	WHERE ra.date_time<reg_current_balance_time()
	GROUP BY
		reg_current_balance_time(),
		ra.store_id,
		ra.product_id,
		ra.doc_production_id	
	HAVING SUM(CASE WHEN ra.deb THEN 1 ELSE -1 END*ra.quant)<>0
	)
	*/
	
$BODY$
  LANGUAGE sql VOLATILE
  COST 100;
ALTER FUNCTION bellagio.rg_total_recalc_products(timestamp without time zone)
  OWNER TO bellagio;

