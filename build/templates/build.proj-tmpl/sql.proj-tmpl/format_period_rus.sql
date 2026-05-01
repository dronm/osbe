-- Function: format_period_rus(in_date_from date, in_date_to date, in_date_format text)

-- DROP FUNCTION format_period_rus(in_date_from date, in_date_to date, in_date_format text);

CREATE OR REPLACE FUNCTION format_period_rus(in_date_from date, in_date_to date, in_date_format text)
  RETURNS text AS
$$
	WITH
	def_format AS (
		SELECT
			'с '||
			CASE WHEN in_date_format IS NULL THEN to_char(in_date_from,'DD/MM/YY') ELSE to_char(in_date_from,in_date_format) END
			||' по '||
			CASE WHEN in_date_format IS NULL THEN to_char(in_date_to,'DD/MM/YY') ELSE to_char(in_date_to,in_date_format) END
		AS per	
	)
	SELECT
		--Same month, same year
		CASE WHEN extract(day FROM in_date_from)=1 AND last_month_day(in_date_to)=in_date_to THEN			
			CASE
				--1 month
				WHEN
				extract(month FROM in_date_from)=extract(month FROM in_date_to) AND extract(year FROM in_date_from)=extract(year FROM in_date_to) THEN
				--'за '||lower(to_char(in_date_to,'TMMonth'))||' '||to_char(in_date_to,'YYYY')||'г.'
				'за '||
				(ARRAY['январь','февраль','март','апрель','май','июнь','июль','август','сентябрь','октябрь','ноябрь','декабрь'])[extract(month FROM in_date_from)]||
				' '||to_char(in_date_to,'YYYY')||'г.'

				--first quarter
				WHEN
				extract(month FROM in_date_from)=1 AND extract(year FROM in_date_from)=extract(year FROM in_date_to)
				AND extract(month FROM in_date_to)=3 THEN
				'за 1 квартал '||to_char(in_date_to,'YYYY')||'г.'

				--second quarter
				WHEN
				extract(month FROM in_date_from)=4 AND extract(year FROM in_date_from)=extract(year FROM in_date_to)
				AND extract(month FROM in_date_to)=6 THEN
				'за 2 квартал '||to_char(in_date_to,'YYYY')||'г.'

				--third quarter
				WHEN
				extract(month FROM in_date_from)=7 AND extract(year FROM in_date_from)=extract(year FROM in_date_to)
				AND extract(month FROM in_date_to)=9 THEN
				'за 3 квартал '||to_char(in_date_to,'YYYY')||'г.'

				--forth quarter
				WHEN
				extract(month FROM in_date_from)=10 AND extract(year FROM in_date_from)=extract(year FROM in_date_to)
				AND extract(month FROM in_date_to)=12 THEN
				'за 4 квартал '||to_char(in_date_to,'YYYY')||'г.'

				--6 months
				WHEN
				extract(month FROM in_date_from)=1 AND extract(year FROM in_date_from)=extract(year FROM in_date_to)
				AND extract(month FROM in_date_to)=6 THEN
				'за первое полугодие '||to_char(in_date_to,'YYYY')||'г.'

				--9 months
				WHEN
				extract(month FROM in_date_from)=1 AND extract(year FROM in_date_from)=extract(year FROM in_date_to)
				AND extract(month FROM in_date_to)=9 THEN
				'за 9 месяцев '||to_char(in_date_to,'YYYY')||'г.'
				
				--second half
				WHEN
				extract(month FROM in_date_from)=7 AND extract(year FROM in_date_from)=extract(year FROM in_date_to)
				AND extract(month FROM in_date_to)=12 THEN
				'за второе полугодие '||to_char(in_date_to,'YYYY')||'г.'
				
				--year
				WHEN
				extract(month FROM in_date_from)=1 AND extract(year FROM in_date_from)=extract(year FROM in_date_to)
				AND extract(month FROM in_date_to)=12 THEN
				'за '||to_char(in_date_to,'YYYY')||' год'
				
				ELSE
				(SELECT per FROM def_format)
			END
		--Default
		ELSE
			(SELECT per FROM def_format)
		END
	;
$$
  LANGUAGE sql IMMUTABLE CALLED ON NULL INPUT
  COST 100;
ALTER FUNCTION format_period_rus(in_date_from date, in_date_to date, in_date_format text) OWNER TO ;
