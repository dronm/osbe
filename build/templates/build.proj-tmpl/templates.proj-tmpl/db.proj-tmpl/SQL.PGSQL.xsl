<?xml version="1.0" encoding="UTF-8"?>

<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:output method="text" indent="yes"
			doctype-public="-//W3C//DTD XHTML 1.0 Strict//EN" 
			doctype-system="http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"/>

<xsl:variable name="DT_INT" select="'Int'"/>
<xsl:variable name="DT_STRING" select="'String'"/>
<xsl:variable name="DT_CHAR" select="'Char'"/>
<xsl:variable name="DT_BOOLEAN" select="'Boolean'"/>
<xsl:variable name="DT_BOOL" select="'Bool'"/>
<xsl:variable name="DT_DATE" select="'Date'"/>
<xsl:variable name="DT_TIME" select="'Time'"/>
<xsl:variable name="DT_TIMETZ" select="'TimeTZ'"/>
<xsl:variable name="DT_DATETIME" select="'DateTime'"/>
<xsl:variable name="DT_DATETIMETZ" select="'DateTimeTZ'"/>
<xsl:variable name="DT_FLOAT" select="'Float'"/>
<xsl:variable name="DT_NUMERIC" select="'Numeric'"/>
<xsl:variable name="DT_TEXT" select="'Text'"/>
<xsl:variable name="DT_ENUM" select="'Enum'"/>
<xsl:variable name="DT_PWD" select="'Password'"/>
<xsl:variable name="DT_INTERVAL" select="'Interval'"/>
<xsl:variable name="DT_JSON" select="'JSON'"/>
<xsl:variable name="DT_JSONB" select="'JSONB'"/>
<xsl:variable name="DT_ARRAY" select="'Array'"/>
<xsl:variable name="DT_XML" select="'XML'"/>
<xsl:variable name="DT_INT_BIG" select="'BigInt'"/>
<xsl:variable name="DT_INT_SMALL" select="'SmallInt'"/>

<xsl:variable name="DT_GEOM_POLYGON" select="'GeomPolygon'"/>
<xsl:variable name="DT_GEOM_POINT" select="'GeomPoint'"/>
<xsl:variable name="DT_TSVECTOR" select="'TSVector'"/>
<xsl:variable name="DT_BYTEA" select="'Bytea'"/>

<xsl:variable name="CMD_DROP" select="'drop'"/>
<xsl:variable name="CMD_CREATE" select="'add'"/>
<xsl:variable name="CMD_ALTER" select="'alt'"/>
<xsl:variable name="CMD_RENAME" select="'ren'"/>

<xsl:variable name="CMD_COL_ALT_TYPE" select="'alt_type'"/>
<xsl:variable name="CMD_COL_SET_DEF" select="'set_def'"/>
<xsl:variable name="CMD_COL_DROP_DEF" select="'drop_def'"/>
			
<xsl:template match="/">	
	
	<xsl:apply-templates select="metadata"/>
			
</xsl:template>

<xsl:template match="metadata">
	<xsl:apply-templates select="enums/enum[@cmd=$CMD_CREATE or @cmd=$CMD_ALTER or @cmd=$CMD_DROP or @cmd=$CMD_RENAME]"/>
		
	<xsl:apply-templates select="models/model[@virtual='FALSE']"/>
	<xsl:call-template name="common_functions"/>
	<xsl:apply-templates select="models/model[@virtual='TRUE']"/>
	<xsl:apply-templates select="models/model[@cmd=$CMD_CREATE or @cmd=$CMD_ALTER]/registerAtcs"/>
	<xsl:apply-templates select="constants"/>
	<xsl:apply-templates select="views"/>
	<xsl:apply-templates select="models/model/predefinedItems/predefinedItem[@cmd=$CMD_CREATE or @cmd=$CMD_ALTER]"/>		
	
	<!-- REFERENCE TYPES -->
	<xsl:for-each select="models/model[@cmd=$CMD_CREATE or @cmd=$CMD_ALTER]/field[@refTable]">
	<xsl:variable name="ref_table" select="@refTable"/>
	<xsl:variable name="model" select="/metadata/models/model[@dataTable=$ref_table]"/>
	<xsl:variable name="display_field">		
	<xsl:choose>
	<xsl:when test="$model/field[@display='TRUE']"><xsl:value-of select="$model/field[@display='TRUE']/@id"/></xsl:when>
	<xsl:otherwise><xsl:value-of select="$model/field[@dataType=$DT_STRING or @dataType=$DT_TEXT][1]/@id"/></xsl:otherwise>
	</xsl:choose>
	</xsl:variable>
	<xsl:if test="not($model[@refFunction])">
--Refrerece type
CREATE OR REPLACE FUNCTION <xsl:value-of select="@refTable"/>_ref(<xsl:value-of select="@refTable"/>)
  RETURNS json AS
$$
	SELECT json_build_object(
		'keys',json_build_object(
			<xsl:for-each select="$model/field[@primaryKey='TRUE']">
			<xsl:if test="position() &gt; 1">,</xsl:if>'id',$1.<xsl:value-of select="@id"/>
			</xsl:for-each>    
			),	
		'descr',$1.<xsl:value-of select="$display_field"/>,
		'dataType','<xsl:value-of select="@refTable"/>'
	);
$$
  LANGUAGE sql VOLATILE COST 100;
ALTER FUNCTION <xsl:value-of select="@refTable"/>_ref(<xsl:value-of select="@refTable"/>) OWNER TO <xsl:value-of select="/metadata/@owner"/>;	
	</xsl:if>
	</xsl:for-each>    	
	
</xsl:template>

<xsl:template match="model[@virtual='FALSE']">
	<xsl:variable name="db_schema">
		<xsl:choose>
			<xsl:when test="@dataSchema"><xsl:value-of select="@dataSchema"/></xsl:when>
			<xsl:when test="/metadata/@dataSchema"><xsl:value-of select="/metadata/@dataSchema"/></xsl:when>
			<xsl:otherwise>public</xsl:otherwise>
		</xsl:choose>
	</xsl:variable>
	<xsl:variable name="db_table" select="concat($db_schema,'.',@dataTable)"/>

	<xsl:choose>
	<xsl:when test="@cmd=$CMD_DROP">
		DROP TABLE <xsl:value-of select="$db_table"/>;
	</xsl:when>
	<xsl:when test="@cmd=$CMD_RENAME">
		ALTER TABLE <xsl:value-of select="$db_table"/> RENAME TO <xsl:value-of select="@newDataTable"/>;
	</xsl:when>	
	<xsl:when test="@cmd=$CMD_ALTER">
		<xsl:if test="field/@cmd">	
		ALTER TABLE <xsl:value-of select="$db_table"/><xsl:text> </xsl:text><xsl:apply-templates select="field"/>;
		</xsl:if>
		<xsl:apply-templates select="index"/>
	</xsl:when>	
	<xsl:when test="@cmd=$CMD_CREATE">
	
	-- ********** Adding new table from model **********
	CREATE TABLE <xsl:value-of select="$db_table"/>
	(<xsl:apply-templates select="field"/>
	<xsl:if test="field[@primaryKey='TRUE']">,CONSTRAINT <xsl:value-of select="@dataTable"/>_pkey PRIMARY KEY (<xsl:apply-templates select="field[@primaryKey='TRUE']" mode="primaryKey"/>)</xsl:if>
	<xsl:apply-templates select="constraint"/>
	);
	<xsl:apply-templates select="index"/>
	<xsl:apply-templates select="description"/>
	ALTER TABLE <xsl:value-of select="$db_table"/> OWNER TO <xsl:value-of select="/metadata/@owner"/>;
	
	</xsl:when>
	</xsl:choose>
	<xsl:variable name="doc_proc" select="concat($db_table,'_process()')"/>
	<xsl:choose>
		<xsl:when test="@modelType='DOC' and (@cmd=$CMD_DROP or @cmd=$CMD_RENAME)">
			DROP FUNCTION <xsl:value-of select="$doc_proc"/>;
			DROP TRIGGER IF EXISTS <xsl:value-of select="$db_table"/>_before ON TABLE <xsl:value-of select="$db_table"/>;
			DROP TRIGGER IF EXISTS <xsl:value-of select="$db_table"/>_after ON TABLE <xsl:value-of select="$db_table"/>;
		</xsl:when>
		<xsl:when test="@modelType='DOC' and (@cmd=$CMD_CREATE or @cmd=$CMD_ALTER or @cmd=$CMD_RENAME)">
			<xsl:variable name="model_id" select="@id"/>			
			<xsl:variable name="doc_type_id" select="@docTypeId"/>
			--process function
			CREATE OR REPLACE FUNCTION <xsl:value-of select="$doc_proc"/>
			  RETURNS trigger AS
			$BODY$
			BEGIN
				IF (TG_WHEN='BEFORE' AND TG_OP='INSERT') THEN
					SELECT coalesce(MAX(d.number),0)+1 INTO NEW.number FROM <xsl:value-of select="$db_table"/> AS d
					<xsl:choose>
					<xsl:when test="/metadata/globalFilters/field">
					WHERE
					<xsl:for-each select="/metadata/globalFilters/field">
					<xsl:if test="position() &gt; 1"> AND </xsl:if>
					d.<xsl:value-of select="@id"/>=NEW.<xsl:value-of select="@id"/>;
					</xsl:for-each>
					</xsl:when>
					<xsl:otherwise>;</xsl:otherwise>					
					</xsl:choose>
					RETURN NEW;
				ELSIF (TG_WHEN='AFTER' AND TG_OP='INSERT') THEN
					--log
					PERFORM doc_log_insert('<xsl:value-of select="$doc_type_id"/>'::doc_types,NEW.id,NEW.date_time);
				
					RETURN NEW;
				ELSIF (TG_WHEN='BEFORE' AND TG_OP='UPDATE') THEN
				
					IF NEW.date_time&lt;&gt;OLD.date_time THEN
						PERFORM doc_log_update('<xsl:value-of select="$doc_type_id"/>'::doc_types,NEW.id,NEW.date_time);
					END IF;
				
					RETURN NEW;
				ELSIF (TG_WHEN='AFTER' AND TG_OP='UPDATE') THEN
					RETURN NEW;
				ELSIF (TG_WHEN='BEFORE' AND TG_OP='DELETE') THEN
					--detail tables
					<xsl:for-each select="/metadata/models/model[@masterModel=$model_id and @modelType='DOCTF']">
					DELETE FROM <xsl:value-of select="$db_table"/> WHERE doc_id=OLD.id;
					</xsl:for-each>				
					
					--log
					PERFORM doc_log_delete('<xsl:value-of select="$doc_type_id"/>'::doc_types,OLD.id);
					
					RETURN OLD;
				ELSIF (TG_WHEN='AFTER' AND TG_OP='DELETE') THEN
					RETURN OLD;
				END IF;
			END;
			$BODY$
			  LANGUAGE plpgsql VOLATILE COST 100;
			<xsl:if test="/metadata/@owner">
			ALTER FUNCTION <xsl:value-of select="$doc_proc"/> OWNER TO <xsl:value-of select="/metadata/@owner"/>;
			</xsl:if>
			-- before trigger
			CREATE TRIGGER <xsl:value-of select="$db_table"/>_before
				BEFORE INSERT OR UPDATE OR DELETE ON <xsl:value-of select="$db_table"/>
				FOR EACH ROW EXECUTE PROCEDURE <xsl:value-of select="$doc_proc"/>;
			-- after trigger
			CREATE TRIGGER <xsl:value-of select="$db_table"/>_after
				AFTER INSERT OR UPDATE OR DELETE ON <xsl:value-of select="$db_table"/>
				FOR EACH ROW EXECUTE PROCEDURE <xsl:value-of select="$doc_proc"/>;
			
			--before doc open function
			<xsl:variable name="before_open_func" select="concat($db_table,'_before_open(in_view_id varchar(32),in_login_id integer, in_doc_id integer)')"/>
			<xsl:variable name="before_write_func" select="concat($db_table,'_before_write(in_view_id varchar(32), in_doc_id integer)')"/>
			<xsl:variable name="table_fact" select="/metadata/models/model[@modelType='DOCTF' and @masterModel=$model_id]/@dataTable"/>
			CREATE OR REPLACE FUNCTION <xsl:value-of select="$before_open_func"/>
			  RETURNS void AS
			$BODY$
				<xsl:for-each select="/metadata/models/model[@masterModel=$model_id and @modelType='DOCT']">
				DELETE FROM <xsl:value-of select="$db_table"/> WHERE view_id=in_view_id;
				INSERT INTO <xsl:value-of select="$db_table"/>
				(view_id,login_id<xsl:for-each select="field">
				<xsl:choose>
				<xsl:when test="@id='tmp_doc_id' or @id='line_number'"></xsl:when>
				<xsl:otherwise>,<xsl:value-of select="@id"/></xsl:otherwise>
				</xsl:choose>
				</xsl:for-each>)
				(SELECT in_view_id,in_login_id
				<xsl:for-each select="field">
				<xsl:choose>
				<xsl:when test="@id='tmp_doc_id' or @id='line_number'"></xsl:when>
				<xsl:otherwise>,<xsl:value-of select="@id"/></xsl:otherwise>
				</xsl:choose>
				</xsl:for-each>					
				FROM <xsl:value-of select="$table_fact"/>
				WHERE doc_id=in_doc_id ORDER BY line_number);
				</xsl:for-each>
			$BODY$
			  LANGUAGE sql VOLATILE COST 100;
			<xsl:if test="/metadata/@owner">
			ALTER FUNCTION <xsl:value-of select="$before_open_func"/> OWNER TO <xsl:value-of select="/metadata/@owner"/>;
			</xsl:if>			
			--before doc write function
			CREATE OR REPLACE FUNCTION <xsl:value-of select="$before_write_func"/>
			  RETURNS void AS
			$BODY$
				<xsl:for-each select="/metadata/models/model[@masterModel=$model_id and @modelType='DOCT']">
				--clear fact table
				DELETE FROM <xsl:value-of select="$table_fact"/> WHERE doc_id=$2;
				
				--copy data from temp to fact table
				INSERT INTO <xsl:value-of select="$table_fact"/>
				(doc_id<xsl:for-each select="field">
				<xsl:choose>
				<xsl:when test="@id='tmp_doc_id'"></xsl:when>
				<xsl:otherwise>,<xsl:value-of select="@id"/></xsl:otherwise>
				</xsl:choose>
				</xsl:for-each>)
				(SELECT $2
				<xsl:for-each select="field">
				<xsl:choose>
				<xsl:when test="@id='tmp_doc_id'"></xsl:when>
				<xsl:otherwise>,<xsl:value-of select="@id"/></xsl:otherwise>
				</xsl:choose>
				</xsl:for-each>					
				FROM <xsl:value-of select="@dataTable"/>
				WHERE view_id=$1);				
				
				--clear temp table
				DELETE FROM <xsl:value-of select="@dataTable"/> WHERE view_id=$1;
				</xsl:for-each>
			$BODY$
			  LANGUAGE sql VOLATILE COST 100;
			<xsl:if test="/metadata/@owner">
			ALTER FUNCTION <xsl:value-of select="$before_write_func"/> OWNER TO <xsl:value-of select="/metadata/@owner"/>;
			</xsl:if>			
			
		</xsl:when>
		
		<xsl:when test="@modelType='DOCT' and (@cmd=$CMD_CREATE or @cmd=$CMD_ALTER or @cmd=$CMD_RENAME)">				
			<xsl:variable name="doc_table_proc" select="concat(@dataTable,'_process()')"/>
			--process function
			CREATE OR REPLACE FUNCTION <xsl:value-of select="$doc_table_proc"/>
			  RETURNS trigger AS
			$BODY$
			BEGIN
				IF (TG_WHEN='BEFORE' AND TG_OP='INSERT') THEN
					SELECT coalesce(MAX(t.line_number),0)+1 INTO NEW.line_number FROM <xsl:value-of select="@dataTable"/> AS t WHERE t.view_id = NEW.view_id;
					RETURN NEW;
				ELSIF (TG_WHEN='AFTER' AND TG_OP='INSERT') THEN
					RETURN NEW;
				ELSIF (TG_WHEN='BEFORE' AND TG_OP='UPDATE') THEN
					RETURN NEW;					
				ELSIF (TG_WHEN='AFTER' AND TG_OP='UPDATE') THEN
					RETURN NEW;									
				ELSIF (TG_WHEN='BEFORE' AND TG_OP='DELETE') THEN
					RETURN OLD;
				ELSIF (TG_WHEN='AFTER' AND TG_OP='DELETE') THEN
					UPDATE <xsl:value-of select="@dataTable"/>
					SET line_number = line_number - 1
					WHERE view_id=OLD.view_id AND line_number>OLD.line_number;
					RETURN OLD;
				END IF;
			END;
			$BODY$
			  LANGUAGE plpgsql VOLATILE COST 100;
			<xsl:if test="/metadata/@owner">
			ALTER FUNCTION <xsl:value-of select="$doc_table_proc"/> OWNER TO <xsl:value-of select="/metadata/@owner"/>;
			</xsl:if>
			-- trigger
			CREATE TRIGGER <xsl:value-of select="@dataTable"/>_before
				BEFORE INSERT OR UPDATE OR DELETE ON <xsl:value-of select="@dataTable"/>
				FOR EACH ROW EXECUTE PROCEDURE <xsl:value-of select="$doc_table_proc"/>;
			-- trigger
			CREATE TRIGGER <xsl:value-of select="@dataTable"/>_after
				AFTER INSERT OR UPDATE OR DELETE ON <xsl:value-of select="@dataTable"/>
				FOR EACH ROW EXECUTE PROCEDURE <xsl:value-of select="$doc_table_proc"/>;
		</xsl:when>
		<xsl:when test="@modelType='RA' and (@cmd=$CMD_CREATE or @cmd=$CMD_ALTER or @cmd=$CMD_RENAME)">	
			<xsl:variable name="ra_proc" select="concat(@dataTable,'_process()')"/>
			<xsl:variable name="reg_type_id" select="@regTypeId"/>
			<xsl:variable name="rg_table">
				<xsl:call-template name="replace-string">
				  <xsl:with-param name="text" select="@dataTable"/>
				  <xsl:with-param name="replace" select="'ra_'" />
				  <xsl:with-param name="with" select="'rg_'"/>
				</xsl:call-template>			
			</xsl:variable>				
			
			--process function
			CREATE OR REPLACE FUNCTION <xsl:value-of select="$ra_proc"/>
			  RETURNS trigger AS
			$BODY$
			DECLARE
				<xsl:for-each select="field[@regFieldType='fact']">
				<xsl:value-of select="concat('v_delta_',@id,' ')"/>
				<xsl:call-template name="db_data_type">
					<xsl:with-param name="data_type" select="@dataType"/>
					<xsl:with-param name="primary_key" select="@primaryKey"/>
					<xsl:with-param name="auto_inc" select="@autoInc"/>
					<xsl:with-param name="length" select="@length"/>
					<xsl:with-param name="precision" select="@precision"/>
				</xsl:call-template> DEFAULT 0;
				</xsl:for-each>
				CALC_DATE_TIME timestamp;
				CURRENT_BALANCE_DATE_TIME timestamp;
				v_loop_rg_period timestamp;
				v_calc_interval interval;			  			
			BEGIN
				IF (TG_WHEN='BEFORE' AND TG_OP='INSERT') THEN
					RETURN NEW;
				ELSIF (TG_WHEN='BEFORE' AND TG_OP='UPDATE') THEN
					RETURN NEW;
				ELSIF (TG_WHEN='AFTER' AND (TG_OP='UPDATE' OR TG_OP='INSERT')) THEN

					CALC_DATE_TIME = rg_calc_period('<xsl:value-of select="$reg_type_id"/>'::reg_types);
		
					IF (CALC_DATE_TIME IS NULL) OR (NEW.date_time::date > rg_period_balance('<xsl:value-of select="$reg_type_id"/>'::reg_types, CALC_DATE_TIME)) THEN
						CALC_DATE_TIME = rg_period('<xsl:value-of select="$reg_type_id"/>'::reg_types,NEW.date_time);
						PERFORM rg_<xsl:value-of select="$reg_type_id"/>_set_custom_period(CALC_DATE_TIME);						
					END IF;
					
					IF TG_OP='UPDATE' THEN
						<xsl:for-each select="field[@regFieldType='fact']">
						<xsl:value-of select="concat('v_delta_',@id,' = OLD.',@id)"/>;
						</xsl:for-each>
					ELSE
						<xsl:for-each select="field[@regFieldType='fact']">
						<xsl:value-of select="concat('v_delta_',@id,' = 0')"/>;
						</xsl:for-each>					
					END IF;
					<xsl:for-each select="field[@regFieldType='fact']">
					<xsl:value-of select="concat('v_delta_',@id,' = NEW.',@id,' - v_delta_',@id)"/>;
					</xsl:for-each>
					<xsl:if test="not(@balance='FALSE')">
					IF NOT NEW.deb THEN
						<xsl:for-each select="field[@regFieldType='fact']">
						<xsl:value-of select="concat('v_delta_',@id,' = -1 * v_delta_',@id)"/>;
						</xsl:for-each>					
					END IF;
					</xsl:if>
					v_loop_rg_period = CALC_DATE_TIME;
					v_calc_interval = rg_calc_interval('<xsl:value-of select="$reg_type_id"/>'::reg_types);
					LOOP
						UPDATE <xsl:value-of select="$rg_table"/>
						SET
						<xsl:for-each select="field[@regFieldType='fact']">
						<xsl:if test="position() &gt; 1">,</xsl:if>
						<xsl:value-of select="concat(@id,' = ',@id,' + ','v_delta_',@id)"/>
						</xsl:for-each>
						WHERE 
							date_time=v_loop_rg_period
							<xsl:for-each select="field[@regFieldType='dimension']">
							AND <xsl:value-of select="concat(@id,' = NEW.',@id)"/>
							</xsl:for-each>;
						IF NOT FOUND THEN
							BEGIN
								INSERT INTO <xsl:value-of select="$rg_table"/> (date_time
								<xsl:for-each select="field[@regFieldType='dimension' or @regFieldType='fact']">
								,<xsl:value-of select="@id"/>
								</xsl:for-each>)				
								VALUES (v_loop_rg_period
								<xsl:for-each select="field[@regFieldType='dimension']">
								,NEW.<xsl:value-of select="@id"/>
								</xsl:for-each>
								<xsl:for-each select="field[@regFieldType='fact']">
								,v_delta_<xsl:value-of select="@id"/>
								</xsl:for-each>);
							EXCEPTION WHEN OTHERS THEN
								UPDATE <xsl:value-of select="$rg_table"/>
								SET
								<xsl:for-each select="field[@regFieldType='fact']">
								<xsl:if test="position() &gt; 1">,</xsl:if>
								<xsl:value-of select="concat(@id,' = ',@id,' + ','v_delta_',@id)"/>
								</xsl:for-each>
								WHERE date_time = v_loop_rg_period
								<xsl:for-each select="field[@regFieldType='dimension']">
								AND <xsl:value-of select="concat(@id,' = NEW.',@id)"/>
								</xsl:for-each>;
							END;
						END IF;

						v_loop_rg_period = v_loop_rg_period + v_calc_interval;
						IF v_loop_rg_period > CALC_DATE_TIME THEN
							EXIT;  -- exit loop
						END IF;
					END LOOP;

					--Current balance
					CURRENT_BALANCE_DATE_TIME = reg_current_balance_time();
					UPDATE <xsl:value-of select="$rg_table"/>
					SET
					<xsl:for-each select="field[@regFieldType='fact']">
					<xsl:if test="position() &gt; 1">,</xsl:if>
					<xsl:value-of select="concat(@id,' = ',@id,' + ','v_delta_',@id)"/>
					</xsl:for-each>
					WHERE 
						date_time=CURRENT_BALANCE_DATE_TIME
						<xsl:for-each select="field[@regFieldType='dimension']">
						AND <xsl:value-of select="concat(@id,' = NEW.',@id)"/>
						</xsl:for-each>;
					IF NOT FOUND THEN
						BEGIN
							INSERT INTO <xsl:value-of select="$rg_table"/> (date_time
							<xsl:for-each select="field[@regFieldType='dimension' or @regFieldType='fact']">
							,<xsl:value-of select="@id"/>
							</xsl:for-each>)				
							VALUES (CURRENT_BALANCE_DATE_TIME
							<xsl:for-each select="field[@regFieldType='dimension']">
							,NEW.<xsl:value-of select="@id"/>
							</xsl:for-each>
							<xsl:for-each select="field[@regFieldType='fact']">
							,v_delta_<xsl:value-of select="@id"/>
							</xsl:for-each>);
						EXCEPTION WHEN OTHERS THEN
							UPDATE <xsl:value-of select="$rg_table"/>
							SET
							<xsl:for-each select="field[@regFieldType='fact']">
							<xsl:if test="position() &gt; 1">,</xsl:if>
							<xsl:value-of select="concat(@id,' = ',@id,' + ','v_delta_',@id)"/>
							</xsl:for-each>
							WHERE 
								date_time=CURRENT_BALANCE_DATE_TIME
								<xsl:for-each select="field[@regFieldType='dimension']">
								AND <xsl:value-of select="concat(@id,' = NEW.',@id)"/>
								</xsl:for-each>;
						END;
					END IF;
					
					RETURN NEW;					
				ELSIF (TG_WHEN='BEFORE' AND TG_OP='DELETE') THEN
					RETURN OLD;
				ELSIF (TG_WHEN='AFTER' AND TG_OP='DELETE') THEN
					
					CALC_DATE_TIME = rg_calc_period('<xsl:value-of select="$reg_type_id"/>'::reg_types);
		
					IF (CALC_DATE_TIME IS NULL) OR (OLD.date_time::date > rg_period_balance('<xsl:value-of select="$reg_type_id"/>'::reg_types, CALC_DATE_TIME)) THEN
						CALC_DATE_TIME = rg_period('<xsl:value-of select="$reg_type_id"/>'::reg_types,OLD.date_time);
						PERFORM rg_<xsl:value-of select="$reg_type_id"/>_set_custom_period(CALC_DATE_TIME);						
					END IF;
					
					<xsl:choose>
					<xsl:when test="not(@balance='FALSE')">
					<xsl:for-each select="field[@regFieldType='fact']">
					<xsl:value-of select="concat('v_delta_',@id,' = OLD.',@id)"/>;
					</xsl:for-each>					
					IF OLD.deb THEN
						<xsl:for-each select="field[@regFieldType='fact']">
						<xsl:value-of select="concat('v_delta_',@id,' = -1*v_delta_',@id)"/>;					
						</xsl:for-each>
					END IF;
					</xsl:when>
					<xsl:otherwise>
					<xsl:for-each select="field[@regFieldType='fact']">
					<xsl:value-of select="concat('v_delta_',@id,' = -1*OLD.',@id)"/>;
					</xsl:for-each>										
					</xsl:otherwise>
					</xsl:choose>
					
					PERFORM rg__update_periods(OLD.date_time
					<xsl:for-each select="field[@regFieldType='dimension' or @regFieldType='fact']">
					,<xsl:value-of select="@id"/>
					</xsl:for-each>)									
					<xsl:for-each select="field[@regFieldType='fact']">
					,<xsl:value-of select="concat(@id,' = ',@id,' + ','v_delta_',@id)"/>
					</xsl:for-each>
					);
					RETURN OLD;					
				END IF;
			END;
			$BODY$
			  LANGUAGE plpgsql VOLATILE COST 100;
			<xsl:if test="/metadata/@owner">
			ALTER FUNCTION <xsl:value-of select="$ra_proc"/> OWNER TO <xsl:value-of select="/metadata/@owner"/>;
			</xsl:if>
			-- before trigger
			CREATE TRIGGER <xsl:value-of select="@dataTable"/>_before
				BEFORE INSERT OR UPDATE OR DELETE ON <xsl:value-of select="@dataTable"/>
				FOR EACH ROW EXECUTE PROCEDURE <xsl:value-of select="$ra_proc"/>;
			-- after trigger
			CREATE TRIGGER <xsl:value-of select="@dataTable"/>_after
				AFTER INSERT OR UPDATE OR DELETE ON <xsl:value-of select="@dataTable"/>
				FOR EACH ROW EXECUTE PROCEDURE <xsl:value-of select="$ra_proc"/>;
				
			-- register actions
			<xsl:variable name="reg_add_act_prototype" select="concat(@dataTable,'_add_act(reg_act ',@dataTable,')')"/>
			<xsl:variable name="reg_remove_acts_prototype" select="concat(@dataTable,'_remove_acts(in_doc_type doc_types,in_doc_id int)')"/>
			-- ADD
			CREATE OR REPLACE FUNCTION <xsl:value-of select="$reg_add_act_prototype"/>
			RETURNS void AS
			$BODY$
				INSERT INTO <xsl:value-of select="@dataTable"/>
				(date_time,doc_type,doc_id
				<xsl:if test="not(@balance='FALSE')">,deb</xsl:if>
				<xsl:for-each select="field[@regFieldType='dimension']">
				,<xsl:value-of select="@id"/>
				</xsl:for-each>
				<xsl:for-each select="field[@regFieldType='fact']">
				,<xsl:value-of select="@id"/>
				</xsl:for-each>				
				)
				VALUES (
				$1.date_time,$1.doc_type,$1.doc_id
				<xsl:if test="not(@balance='FALSE')">,$1.deb</xsl:if>
				<xsl:for-each select="field[@regFieldType='dimension']">
				,$1.<xsl:value-of select="@id"/>
				</xsl:for-each>
				<xsl:for-each select="field[@regFieldType='fact']">
				,$1.<xsl:value-of select="@id"/>
				</xsl:for-each>				
				);
			$BODY$
			LANGUAGE sql VOLATILE STRICT COST 100;
			<xsl:if test="/metadata/@owner">
			ALTER FUNCTION <xsl:value-of select="$reg_add_act_prototype"/> OWNER TO <xsl:value-of select="/metadata/@owner"/>;
			</xsl:if>
			-- REMOVE
			CREATE OR REPLACE FUNCTION <xsl:value-of select="$reg_remove_acts_prototype"/>
			RETURNS void AS
			$BODY$
				DELETE FROM <xsl:value-of select="@dataTable"/>
				WHERE doc_type=$1 AND doc_id=$2;
			$BODY$
			LANGUAGE sql VOLATILE STRICT COST 100;
			<xsl:if test="/metadata/@owner">
			ALTER FUNCTION <xsl:value-of select="$reg_remove_acts_prototype"/> OWNER TO <xsl:value-of select="/metadata/@owner"/>;
			</xsl:if>
			
			--virtual tables
			<xsl:variable name="model_id" select="@id"/>
			<xsl:variable name="data_table" select="@dataTable"/>
			<xsl:variable name="act_table_name" select="concat(@dataTable,'_list_view')"/>
			--DROP VIEW <xsl:value-of select="$act_table_name"/>;
			CREATE OR REPLACE VIEW <xsl:value-of select="$act_table_name"/> AS
			SELECT
			<xsl:value-of select="@dataTable"/>.id,
			<xsl:value-of select="@dataTable"/>.date_time,
			<xsl:if test="not(@balance='FALSE')">
			<xsl:value-of select="@dataTable"/>.deb,
			</xsl:if>
			<xsl:value-of select="@dataTable"/>.doc_type,
			<xsl:value-of select="@dataTable"/>.doc_id,
			CASE <xsl:value-of select="@dataTable"/>.doc_type
			<xsl:for-each select="//registerAtcs/register[@id=$model_id]">
			WHEN '<xsl:value-of select="../../@docTypeId"/>'::doc_types THEN
				doc_descr('<xsl:value-of select="../../@docTypeId"/>'::doc_types,<xsl:value-of select="concat('doc',position())"/>.number::text,
				<xsl:value-of select="concat('doc',position())"/>.date_time)
			</xsl:for-each>
			END AS doc_descr
			FROM <xsl:value-of select="@dataTable"/>
			<xsl:for-each select="//registerAtcs/register[@id=$model_id]">
			LEFT JOIN <xsl:value-of select="../../@dataTable"/> AS <xsl:value-of select="concat('doc',position())"/> ON 
			<xsl:value-of select="concat('doc',position())"/>.id=<xsl:value-of select="$data_table"/>.doc_id
			</xsl:for-each>
			;
			<xsl:if test="/metadata/@owner">
			ALTER TABLE <xsl:value-of select="$act_table_name"/> OWNER TO <xsl:value-of select="/metadata/@owner"/>;
			</xsl:if>
			
		</xsl:when>
		<xsl:when test="@modelType='RG' and not(@balance='FALSE') and (@cmd=$CMD_CREATE or @cmd=$CMD_ALTER or @cmd=$CMD_RENAME)">
			<xsl:variable name="ra_model_id">
				<xsl:call-template name="replace-string">
				  <xsl:with-param name="text" select="@id"/>
				  <xsl:with-param name="replace" select="'RG'" />
				  <xsl:with-param name="with" select="'RA'"/>
				</xsl:call-template>			
			</xsl:variable>
			<xsl:variable name="ra_data_table">
				<xsl:call-template name="replace-string">
				  <xsl:with-param name="text" select="@dataTable"/>
				  <xsl:with-param name="replace" select="'rg_'" />
				  <xsl:with-param name="with" select="'ra_'"/>
				</xsl:call-template>			
			</xsl:variable>
--virtual tables
<xsl:variable name="func_prototype">
	<xsl:value-of select="@dataTable"/>_balance(in_date_time timestamp,
	<xsl:for-each select="/metadata/models/model[@id=$ra_model_id]/field[@regFieldType='dimension']">
	<xsl:if test="position() &gt; 1">,</xsl:if>
	IN <xsl:value-of select="concat('in_',@id,'_ar ')"/>
	<xsl:call-template name="db_data_type">
		<xsl:with-param name="data_type" select="@dataType"/>
		<xsl:with-param name="primary_key" select="@primaryKey"/>
		<xsl:with-param name="auto_inc" select="@autoInc"/>
		<xsl:with-param name="length" select="@length"/>
		<xsl:with-param name="precision" select="@precision"/>
	</xsl:call-template>[]
	</xsl:for-each>				
	)
</xsl:variable>
<!--<xsl:variable name="reg_type_id" select="@regTypeId"/>-->
<xsl:variable name="reg_type_id" select="/metadata/models/model[@id=$ra_model_id]/@regTypeId"/>
CREATE OR REPLACE FUNCTION <xsl:value-of select="$func_prototype"/>
  RETURNS TABLE(
	<xsl:for-each select="/metadata/models/model[@id=$ra_model_id]/field[@regFieldType='dimension']">
	<xsl:if test="position() &gt; 1">,</xsl:if>
	<xsl:value-of select="@id"/><xsl:value-of select="' '"/>
	<xsl:call-template name="db_data_type">
		<xsl:with-param name="data_type" select="@dataType"/>
		<xsl:with-param name="primary_key" select="@primaryKey"/>
		<xsl:with-param name="auto_inc" select="@autoInc"/>
		<xsl:with-param name="length" select="@length"/>
		<xsl:with-param name="precision" select="@precision"/>
	</xsl:call-template>
	</xsl:for-each>
	<xsl:for-each select="/metadata/models/model[@id=$ra_model_id]/field[@regFieldType='fact']">
	,
	<xsl:value-of select="@id"/><xsl:value-of select="' '"/>
	<xsl:call-template name="db_data_type">
		<xsl:with-param name="data_type" select="@dataType"/>
		<xsl:with-param name="primary_key" select="@primaryKey"/>
		<xsl:with-param name="auto_inc" select="@autoInc"/>
		<xsl:with-param name="length" select="@length"/>
		<xsl:with-param name="precision" select="@precision"/>
	</xsl:call-template>
	</xsl:for-each>				
	) AS
$BODY$
	WITH
	cur_per AS (SELECT rg_period('<xsl:value-of select="$reg_type_id"/>'::reg_types, in_date_time) AS v ),
	
	act_forward AS (
		SELECT
			rg_period_balance('<xsl:value-of select="$reg_type_id"/>'::reg_types,in_date_time) - in_date_time >
			(SELECT t.v FROM cur_per t) - in_date_time
			AS v
	),
	
	act_sg AS (SELECT CASE WHEN t.v THEN 1 ELSE -1 END AS v FROM act_forward t)

	SELECT 
	<xsl:for-each select="/metadata/models/model[@id=$ra_model_id]/field[@regFieldType='dimension']">
	<xsl:if test="position() &gt; 1">,</xsl:if>
	sub.<xsl:value-of select="@id"/>
	</xsl:for-each>
	<xsl:for-each select="/metadata/models/model[@id=$ra_model_id]/field[@regFieldType='fact']">
	,SUM(sub.<xsl:value-of select="@id"/>) AS <xsl:value-of select="@id"/>
	</xsl:for-each>				
	FROM(
		(SELECT
		<xsl:for-each select="/metadata/models/model[@id=$ra_model_id]/field[@regFieldType='dimension']">
		<xsl:if test="position() &gt; 1">,</xsl:if>
		b.<xsl:value-of select="@id"/>
		</xsl:for-each>
		<xsl:for-each select="/metadata/models/model[@id=$ra_model_id]/field[@regFieldType='fact']">
		,b.<xsl:value-of select="@id"/>
		</xsl:for-each>				
		FROM <xsl:value-of select="@dataTable"/> AS b
		WHERE
		
		(
			--date bigger than last calc period
			(in_date_time > rg_period_balance('<xsl:value-of select="$reg_type_id"/>'::reg_types,rg_calc_period('<xsl:value-of select="$reg_type_id"/>'::reg_types)) AND b.date_time = (SELECT rg_current_balance_time()))
			
			OR (
			--forward from previous period
			( (SELECT t.v FROM act_forward t) AND b.date_time = (SELECT t.v FROM cur_per t)-rg_calc_interval('<xsl:value-of select="$reg_type_id"/>'::reg_types)
			)
			--backward from current
			OR			
			( NOT (SELECT t.v FROM act_forward t) AND b.date_time = (SELECT t.v FROM cur_per t)
			)
			
			)
		)	
		
		<xsl:for-each select="/metadata/models/model[@id=$ra_model_id]/field[@regFieldType='dimension']">		
		AND ( (<xsl:value-of select="concat('in_',@id,'_ar')"/> IS NULL OR ARRAY_LENGTH(<xsl:value-of select="concat('in_',@id,'_ar')"/>,1) IS NULL) OR (b.<xsl:value-of select="@id"/>=ANY(<xsl:value-of select="concat('in_',@id,'_ar')"/>)))
		</xsl:for-each>
		AND (
		<xsl:for-each select="/metadata/models/model[@id=$ra_model_id]/field[@regFieldType='fact']">
		<xsl:if test="position() &gt; 1"> OR </xsl:if>
		<xsl:value-of select="concat('b.',@id)"/>&lt;&gt;0
		</xsl:for-each>)
		)
		
		UNION ALL
		
		(SELECT
		<xsl:for-each select="/metadata/models/model[@id=$ra_model_id]/field[@regFieldType='dimension']">
		<xsl:if test="position() &gt; 1">,</xsl:if>
		act.<xsl:value-of select="@id"/>
		</xsl:for-each>
		<xsl:for-each select="/metadata/models/model[@id=$ra_model_id]/field[@regFieldType='fact']">
		,CASE act.deb
			WHEN TRUE THEN act.<xsl:value-of select="@id"/> * (SELECT t.v FROM act_sg t)
			ELSE -act.<xsl:value-of select="@id"/> * (SELECT t.v FROM act_sg t)
		END AS quant
		</xsl:for-each>								
		FROM doc_log
		LEFT JOIN <xsl:value-of select="$ra_data_table"/> AS act ON act.doc_type=doc_log.doc_type AND act.doc_id=doc_log.doc_id
		WHERE
		(
			--forward from previous period
			( (SELECT t.v FROM act_forward t) AND
					act.date_time >= (SELECT t.v FROM cur_per t)
					AND act.date_time &lt;= 
						(SELECT l.date_time FROM doc_log l
						WHERE date_trunc('second',l.date_time)&lt;=date_trunc('second',in_date_time)
						ORDER BY l.date_time DESC LIMIT 1
						)
					
			)
			--backward from current
			OR			
			( NOT (SELECT t.v FROM act_forward t) AND
					act.date_time >= 
						(SELECT l.date_time FROM doc_log l
						WHERE date_trunc('second',l.date_time)>=date_trunc('second',in_date_time)
						ORDER BY l.date_time ASC LIMIT 1
						)			
					AND act.date_time &lt;= (SELECT t.v FROM cur_per t)
			)
		)
			
		<xsl:for-each select="/metadata/models/model[@id=$ra_model_id]/field[@regFieldType='dimension']">
		AND (<xsl:value-of select="concat('in_',@id,'_ar')"/> IS NULL OR ARRAY_LENGTH(<xsl:value-of select="concat('in_',@id,'_ar')"/>,1) IS NULL OR (act.<xsl:value-of select="@id"/>=ANY(<xsl:value-of select="concat('in_',@id,'_ar')"/>)))
		</xsl:for-each>
		AND (
		<xsl:for-each select="/metadata/models/model[@id=$ra_model_id]/field[@regFieldType='fact']">
		<xsl:if test="position() &gt; 1">OR</xsl:if>
		act.<xsl:value-of select="@id"/>&lt;&gt;0
		</xsl:for-each>)
		ORDER BY doc_log.date_time,doc_log.id)
	) AS sub
	WHERE
	<xsl:for-each select="/metadata/models/model[@id=$ra_model_id]/field[@regFieldType='dimension']">
	<xsl:if test="position() &gt; 1">AND</xsl:if> (ARRAY_LENGTH(<xsl:value-of select="concat('in_',@id,'_ar')"/>,1) IS NULL OR (sub.<xsl:value-of select="@id"/>=ANY(<xsl:value-of select="concat('in_',@id,'_ar')"/>)))
	</xsl:for-each>	
	GROUP BY
		<xsl:for-each select="/metadata/models/model[@id=$ra_model_id]/field[@regFieldType='dimension']">
		<xsl:if test="position() &gt; 1">,</xsl:if>
		sub.<xsl:value-of select="@id"/>
		</xsl:for-each>
	HAVING
		<xsl:for-each select="/metadata/models/model[@id=$ra_model_id]/field[@regFieldType='fact']">
		<xsl:if test="position() &gt; 1">OR</xsl:if>
		SUM(sub.<xsl:value-of select="@id"/>)&lt;&gt;0
		</xsl:for-each>				
	ORDER BY
		<xsl:for-each select="/metadata/models/model[@id=$ra_model_id]/field[@regFieldType='dimension']">
		<xsl:if test="position() &gt; 1">,</xsl:if>
		sub.<xsl:value-of select="@id"/>
		</xsl:for-each>;
$BODY$
  LANGUAGE sql VOLATILE CALLED ON NULL INPUT
  COST 100;
<xsl:if test="/metadata/@owner">
ALTER FUNCTION <xsl:value-of select="$func_prototype"/> OWNER TO <xsl:value-of select="/metadata/@owner"/>;
</xsl:if>
--balance on doc
<xsl:variable name="func2_prototype">
	<xsl:value-of select="@dataTable"/>_balance(in_doc_type doc_types, in_doc_id int,
	<xsl:for-each select="/metadata/models/model[@id=$ra_model_id]/field[@regFieldType='dimension']">
	<xsl:if test="position() &gt; 1">,</xsl:if>
	IN <xsl:value-of select="concat('in_',@id,'_ar ')"/>
	<xsl:call-template name="db_data_type">
		<xsl:with-param name="data_type" select="@dataType"/>
		<xsl:with-param name="primary_key" select="@primaryKey"/>
		<xsl:with-param name="auto_inc" select="@autoInc"/>
		<xsl:with-param name="length" select="@length"/>
		<xsl:with-param name="precision" select="@precision"/>
	</xsl:call-template>[]
	</xsl:for-each>				
	)
</xsl:variable>
CREATE OR REPLACE FUNCTION <xsl:value-of select="$func2_prototype"/>
  RETURNS TABLE(
	<xsl:for-each select="/metadata/models/model[@id=$ra_model_id]/field[@regFieldType='dimension']">
	<xsl:if test="position() &gt; 1">,</xsl:if>
	<xsl:value-of select="@id"/><xsl:value-of select="' '"/>
	<xsl:call-template name="db_data_type">
		<xsl:with-param name="data_type" select="@dataType"/>
		<xsl:with-param name="primary_key" select="@primaryKey"/>
		<xsl:with-param name="length" select="@length"/>
		<xsl:with-param name="precision" select="@precision"/>
		<xsl:with-param name="auto_inc" select="@autoInc"/>
	</xsl:call-template>
	</xsl:for-each>
	<xsl:for-each select="/metadata/models/model[@id=$ra_model_id]/field[@regFieldType='fact']">
	,
	<xsl:value-of select="@id"/><xsl:value-of select="' '"/>
	<xsl:call-template name="db_data_type">
		<xsl:with-param name="data_type" select="@dataType"/>
		<xsl:with-param name="primary_key" select="@primaryKey"/>
		<xsl:with-param name="length" select="@length"/>
		<xsl:with-param name="precision" select="@precision"/>
		<xsl:with-param name="auto_inc" select="@autoInc"/>
	</xsl:call-template>
	</xsl:for-each>				
	) AS
$BODY$
	SELECT * FROM <xsl:value-of select="@dataTable"/>_balance(
		(SELECT doc_log.date_time FROM doc_log WHERE doc_log.doc_type=in_doc_type AND doc_log.doc_id=in_doc_id),
		<xsl:for-each select="/metadata/models/model[@id=$ra_model_id]/field[@regFieldType='dimension']">
		<xsl:if test="position() &gt; 1">,</xsl:if>
		<xsl:value-of select="concat('in_',@id,'_ar ')"/>
		</xsl:for-each>				
		);

$BODY$
  LANGUAGE sql VOLATILE CALLED ON NULL INPUT
  COST 100;
<xsl:if test="/metadata/@owner">
ALTER FUNCTION <xsl:value-of select="$func2_prototype"/> OWNER TO <xsl:value-of select="/metadata/@owner"/>;
</xsl:if>
--TA balance
<xsl:variable name="func3_prototype">
	<xsl:value-of select="@dataTable"/>_balance(
	<xsl:for-each select="/metadata/models/model[@id=$ra_model_id]/field[@regFieldType='dimension']">
	<xsl:if test="position() &gt; 1">,</xsl:if>
	IN <xsl:value-of select="concat('in_',@id,'_ar ')"/>
	<xsl:call-template name="db_data_type">
		<xsl:with-param name="data_type" select="@dataType"/>
		<xsl:with-param name="primary_key" select="@primaryKey"/>
		<xsl:with-param name="length" select="@length"/>
		<xsl:with-param name="precision" select="@precision"/>
		<xsl:with-param name="auto_inc" select="@autoInc"/>
	</xsl:call-template>[]
	</xsl:for-each>				
	)
</xsl:variable>
CREATE OR REPLACE FUNCTION <xsl:value-of select="$func3_prototype"/>
  RETURNS TABLE(
	<xsl:for-each select="/metadata/models/model[@id=$ra_model_id]/field[@regFieldType='dimension']">
	<xsl:if test="position() &gt; 1">,</xsl:if>
	<xsl:value-of select="@id"/><xsl:value-of select="' '"/>
	<xsl:call-template name="db_data_type">
		<xsl:with-param name="data_type" select="@dataType"/>
		<xsl:with-param name="primary_key" select="@primaryKey"/>
		<xsl:with-param name="length" select="@length"/>
		<xsl:with-param name="precision" select="@precision"/>
		<xsl:with-param name="auto_inc" select="@autoInc"/>
	</xsl:call-template>
	</xsl:for-each>
	<xsl:for-each select="/metadata/models/model[@id=$ra_model_id]/field[@regFieldType='fact']">
	,
	<xsl:value-of select="@id"/><xsl:value-of select="' '"/>
	<xsl:call-template name="db_data_type">
		<xsl:with-param name="data_type" select="@dataType"/>
		<xsl:with-param name="primary_key" select="@primaryKey"/>
		<xsl:with-param name="length" select="@length"/>
		<xsl:with-param name="precision" select="@precision"/>
		<xsl:with-param name="auto_inc" select="@autoInc"/>
	</xsl:call-template>
	</xsl:for-each>				
	) AS
$BODY$
	SELECT
		<xsl:for-each select="/metadata/models/model[@id=$ra_model_id]/field[@regFieldType='dimension']">
		<xsl:if test="position() &gt; 1">,</xsl:if>
		b.<xsl:value-of select="@id"/>
		</xsl:for-each>
		<xsl:for-each select="/metadata/models/model[@id=$ra_model_id]/field[@regFieldType='fact']">
		,b.<xsl:value-of select="@id"/> AS <xsl:value-of select="@id"/>
		</xsl:for-each>				
	FROM <xsl:value-of select="@dataTable"/> AS b
	WHERE b.date_time=reg_current_balance_time()
		<xsl:for-each select="/metadata/models/model[@id=$ra_model_id]/field[@regFieldType='dimension']">
		AND (<xsl:value-of select="concat('in_',@id,'_ar')"/> IS NULL OR ARRAY_LENGTH(<xsl:value-of select="concat('in_',@id,'_ar')"/>,1) IS NULL OR (b.<xsl:value-of select="@id"/>=ANY(<xsl:value-of select="concat('in_',@id,'_ar')"/>)))
		</xsl:for-each>
		AND(
		<xsl:for-each select="/metadata/models/model[@id=$ra_model_id]/field[@regFieldType='fact']">
		<xsl:if test="position() &gt; 1"> OR </xsl:if>
		<xsl:value-of select="concat('b.',@id)"/>&lt;&gt;0
		</xsl:for-each>)
	ORDER BY
		<xsl:for-each select="/metadata/models/model[@id=$ra_model_id]/field[@regFieldType='dimension']">
		<xsl:if test="position() &gt; 1">,</xsl:if>
		b.<xsl:value-of select="@id"/>
		</xsl:for-each>;
$BODY$
  LANGUAGE sql VOLATILE CALLED ON NULL INPUT
  COST 100;
<xsl:if test="/metadata/@owner">
ALTER FUNCTION <xsl:value-of select="$func3_prototype"/> OWNER TO <xsl:value-of select="/metadata/@owner"/>;
</xsl:if>

<!-- open new period-->			
<xsl:variable name="open_period_prototype" select="concat('rg_',$reg_type_id,'_set_custom_period(IN in_new_period timestamp without time zone)')"/>
CREATE OR REPLACE FUNCTION <xsl:value-of select="$open_period_prototype"/>
  RETURNS void AS
$BODY$
DECLARE
	NEW_PERIOD timestamp without time zone;
	v_prev_current_period timestamp without time zone;
	v_current_period timestamp without time zone;
	CURRENT_PERIOD timestamp without time zone;
	TA_PERIOD timestamp without time zone;
	REG_INTERVAL interval;
BEGIN
	NEW_PERIOD = rg_calc_period_start('<xsl:value-of select="$reg_type_id"/>'::reg_types, in_new_period);
	SELECT date_time INTO CURRENT_PERIOD FROM rg_calc_periods WHERE reg_type = '<xsl:value-of select="$reg_type_id"/>'::reg_types;
	TA_PERIOD = reg_current_balance_time();
	--iterate through all periods between CURRENT_PERIOD and NEW_PERIOD
	REG_INTERVAL = rg_calc_interval('<xsl:value-of select="$reg_type_id"/>'::reg_types);
	v_prev_current_period = CURRENT_PERIOD;		
	LOOP
		v_current_period = v_prev_current_period + REG_INTERVAL;
		IF v_current_period > NEW_PERIOD THEN
			EXIT;  -- exit loop
		END IF;
		
		--clear period
		DELETE FROM <xsl:value-of select="@dataTable"/>
		WHERE date_time = v_current_period;
		
		--new data
		INSERT INTO <xsl:value-of select="@dataTable"/>
		(date_time
		<xsl:for-each select="/metadata/models/model[@id=$ra_model_id]/field[@regFieldType='dimension']">
		,<xsl:value-of select="@id"/>
		</xsl:for-each>				
		<xsl:for-each select="/metadata/models/model[@id=$ra_model_id]/field[@regFieldType='fact']">
		,<xsl:value-of select="@id"/>
		</xsl:for-each>						
		)
		(SELECT
				v_current_period
				<xsl:for-each select="/metadata/models/model[@id=$ra_model_id]/field[@regFieldType='dimension']">
				,rg.<xsl:value-of select="@id"/>
				</xsl:for-each>				
				<xsl:for-each select="/metadata/models/model[@id=$ra_model_id]/field[@regFieldType='fact']">
				,rg.<xsl:value-of select="@id"/>
				</xsl:for-each>				
			FROM <xsl:value-of select="@dataTable"/> As rg
			WHERE (
			<xsl:for-each select="/metadata/models/model[@id=$ra_model_id]/field[@regFieldType='fact']">
			<xsl:if test="position() &gt; 1">OR</xsl:if>
			rg.<xsl:value-of select="@id"/>&lt;&gt;0
			</xsl:for-each>							
			)
			AND (rg.date_time=v_prev_current_period)
		);

		v_prev_current_period = v_current_period;
	END LOOP;

	--new TA data
	DELETE FROM <xsl:value-of select="@dataTable"/>
	WHERE date_time=TA_PERIOD;
	INSERT INTO <xsl:value-of select="@dataTable"/>
	(date_time
	<xsl:for-each select="/metadata/models/model[@id=$ra_model_id]/field[@regFieldType='dimension']">
	,<xsl:value-of select="@id"/>
	</xsl:for-each>				
	<xsl:for-each select="/metadata/models/model[@id=$ra_model_id]/field[@regFieldType='fact']">
	,<xsl:value-of select="@id"/>
	</xsl:for-each>	
	)
	(SELECT
		TA_PERIOD
		<xsl:for-each select="/metadata/models/model[@id=$ra_model_id]/field[@regFieldType='dimension']">
		,rg.<xsl:value-of select="@id"/>
		</xsl:for-each>				
		<xsl:for-each select="/metadata/models/model[@id=$ra_model_id]/field[@regFieldType='fact']">
		,rg.<xsl:value-of select="@id"/>
		</xsl:for-each>
		FROM rg_materials AS rg
		WHERE (
		<xsl:for-each select="/metadata/models/model[@id=$ra_model_id]/field[@regFieldType='fact']">
		<xsl:if test="position() &gt; 1">OR</xsl:if>
		rg.<xsl:value-of select="@id"/>&lt;&gt;0
		</xsl:for-each>									
		)
		AND (rg.date_time=NEW_PERIOD-REG_INTERVAL)
	);

	DELETE FROM rg_materials WHERE (date_time>NEW_PERIOD)
	AND (date_time&lt;&gt;TA_PERIOD);

	--set new period
	UPDATE rg_calc_periods SET date_time = NEW_PERIOD
	WHERE reg_type='<xsl:value-of select="$reg_type_id"/>'::reg_types;		
END
$BODY$
LANGUAGE plpgsql VOLATILE COST 100;
<xsl:if test="/metadata/@owner">
ALTER FUNCTION <xsl:value-of select="$open_period_prototype"/> OWNER TO <xsl:value-of select="/metadata/@owner"/>;
</xsl:if>

		</xsl:when>
		<xsl:when test="@modelType='RG' and @balance='FALSE'">
		</xsl:when>
	</xsl:choose>
</xsl:template>

<xsl:template match="constraint">	
	,CONSTRAINT <xsl:value-of select="@id"/> CHECK (<xsl:value-of select="@expression"/>)
</xsl:template>

<!-- ??? Does not work with standart XSLTProcessor ???
<xsl:template match="model[@virtual='TRUE' and (@cmd=$CMD_DROP or @cmd=$CMD_ALTER)]">
	DROP VIEW <xsl:value-of select="@dataTable"/>;
</xsl:template>
-->
<xsl:template match="enum">	
	<xsl:variable name="enum_id">
		<xsl:choose>
		<xsl:when test="@newId"><xsl:value-of select="@newId"/></xsl:when>
		<xsl:otherwise><xsl:value-of select="@id"/></xsl:otherwise>
		</xsl:choose>
	</xsl:variable>	
	<xsl:variable name="func">enum_<xsl:value-of select="$enum_id"/>_val(<xsl:value-of select="$enum_id"/>,locales)</xsl:variable>
	<!-- type -->
	<xsl:choose>
		<xsl:when test="@cmd=$CMD_DROP">
			DROP FUNCTION <xsl:value-of select="$func"/>;
			DROP VIEW <xsl:value-of select="$view"/>;
			DROP TYPE <xsl:value-of select="$enum_id"/>;
		</xsl:when>
		<xsl:when test="@cmd=$CMD_CREATE">
	-- Adding new type
	CREATE TYPE <xsl:value-of select="$enum_id"/> AS ENUM (
	<xsl:for-each select="value">
		<xsl:if test="position() &gt; 1">,</xsl:if>
		'<xsl:value-of select="@id"/>'			
	</xsl:for-each>			
	);
	ALTER TYPE <xsl:value-of select="$enum_id"/> OWNER TO <xsl:value-of select="/metadata/@owner"/>;
		</xsl:when>
		<xsl:when test="@cmd=$CMD_ALTER">
			<xsl:for-each select="value[@cmd=$CMD_CREATE or @cmd=$CMD_ALTER]">
				<xsl:choose>
					<xsl:when test="@cmd=$CMD_CREATE">
					ALTER TYPE <xsl:value-of select="$enum_id"/> ADD VALUE '<xsl:value-of select="@id"/>';
					</xsl:when>
					<xsl:otherwise>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:for-each>			
		</xsl:when>
		<xsl:when test="@cmd=$CMD_RENAME">
	--renaming type
	ALTER TYPE <xsl:value-of select="@id"/> RENAME TO <xsl:value-of select="@newId"/>;
		</xsl:when>
		<xsl:otherwise>
		</xsl:otherwise>
	</xsl:choose>
	<!-- function-->
	<xsl:if test="@cmd=$CMD_CREATE or @cmd=$CMD_ALTER or @cmd=$CMD_RENAME">
	/* type get function */
	CREATE OR REPLACE FUNCTION <xsl:value-of select="$func"/>
	RETURNS text AS $$
		SELECT
		CASE
		<xsl:for-each select="value/*">WHEN $1='<xsl:value-of select="../@id"/>'::<xsl:value-of select="$enum_id"/> AND $2='<xsl:value-of select="local-name()"/>'::locales THEN '<xsl:value-of select="@descr"/>'
		</xsl:for-each>ELSE ''
		END;		
	$$ LANGUAGE sql;	
	ALTER FUNCTION <xsl:value-of select="$func"/> OWNER TO <xsl:value-of select="/metadata/@owner"/>;		
	</xsl:if>
	
	
<!--	
	<xsl:variable name="enum_id">
		<xsl:choose>
		<xsl:when test="@newId"><xsl:value-of select="@newId"/></xsl:when>
		<xsl:otherwise><xsl:value-of select="@id"/></xsl:otherwise>
		</xsl:choose>
	</xsl:variable>	

	<xsl:variable name="func" select="concat('enum_',$enum_id,'_descr(',$enum_id,')')"/>
	<xsl:variable name="view" select="concat('enum_list_',$enum_id)"/>
	<xsl:choose>
		<xsl:when test="@cmd=$CMD_DROP">
			DROP TYPE <xsl:value-of select="$enum_id"/>;
			DROP FUNCTION <xsl:value-of select="$func"/>;
			DROP VIEW <xsl:value-of select="$view"/>;
		</xsl:when>
		<xsl:when test="@cmd=$CMD_CREATE">
			CREATE TYPE <xsl:value-of select="$enum_id"/> AS ENUM (
			<xsl:for-each select="value">
				<xsl:if test="position() &gt; 1">,</xsl:if>
				'<xsl:value-of select="@id"/>'			
			</xsl:for-each>			
			);
			ALTER TYPE <xsl:value-of select="$enum_id"/> OWNER TO <xsl:value-of select="/metadata/@owner"/>;
		</xsl:when>
		<xsl:when test="@cmd=$CMD_ALTER">
			<xsl:for-each select="value[@cmd=$CMD_CREATE or @cmd=$CMD_ALTER]">
				<xsl:choose>
					<xsl:when test="@cmd=$CMD_CREATE">
					ALTER TYPE <xsl:value-of select="$enum_id"/> ADD VALUE '<xsl:value-of select="@id"/>';
					</xsl:when>
					<xsl:otherwise>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:for-each>			
		</xsl:when>
		<xsl:when test="@cmd=$CMD_RENAME">
			ALTER TYPE <xsl:value-of select="@id"/> RENAME TO <xsl:value-of select="@newId"/>;
			<xsl:variable name="func_old" select="concat('enum_',@id,'_descr(',@id,')')"/>
			<xsl:variable name="view_old" select="concat('enum_list_',@id)"/>			
			DROP FUNCTION <xsl:value-of select="$func_old"/>;
			DROP VIEW <xsl:value-of select="$view_old"/>;			
		</xsl:when>
		<xsl:otherwise>
		</xsl:otherwise>
	</xsl:choose>
	
	<xsl:if test="@cmd=$CMD_CREATE or @cmd=$CMD_ALTER">
	CREATE OR REPLACE FUNCTION <xsl:value-of select="$func"/>
	RETURNS varchar AS $$
		SELECT
		CASE $1
			<xsl:for-each select="value">
			WHEN '<xsl:value-of select="@id"/>'::<xsl:value-of select="../@id"/> THEN '<xsl:value-of select="@descr"/>'
			</xsl:for-each>
			ELSE ''
		END;		
	$$ LANGUAGE sql;	
	ALTER FUNCTION <xsl:value-of select="$func"/> OWNER TO <xsl:value-of select="/metadata/@owner"/>;
	
	/*list view*/
	CREATE OR REPLACE VIEW <xsl:value-of select="$view"/> AS
	<xsl:for-each select="value">
		<xsl:if test="position() &gt; 1">
		UNION ALL
		</xsl:if>
		SELECT '<xsl:value-of select="@id"/>'::<xsl:value-of select="../@id"/> AS id, enum_<xsl:value-of select="../@id"/>_descr('<xsl:value-of select="@id"/>'::<xsl:value-of select="../@id"/>) AS descr
	</xsl:for-each>;
	ALTER VIEW <xsl:value-of select="$view"/> OWNER TO <xsl:value-of select="/metadata/@owner"/>;
	</xsl:if>
-->	
</xsl:template>

<xsl:template match="model[@virtual='FALSE']/field">
	<!-- toDO correct add not first column-->
	
	<xsl:if test="preceding-sibling::field/@cmd or (../@cmd=$CMD_CREATE and position()&gt;1)">,</xsl:if>
	
	<xsl:choose>
	<xsl:when test="@cmd=$CMD_COL_SET_DEF">
		ALTER COLUMN <xsl:value-of select="@id"/> SET 
        <xsl:call-template name="def_col_val">
          <xsl:with-param name="def_val" select="@defaultValue"/>
		  <xsl:with-param name="data_type" select="@dataType"/>
		</xsl:call-template>
	</xsl:when>
	<xsl:when test="@cmd=$CMD_COL_DROP_DEF">
		ALTER COLUMN <xsl:value-of select="@id"/> DROP DEFAULT
	</xsl:when>
	<xsl:when test="@cmd=$CMD_COL_ALT_TYPE">
		ALTER COLUMN <xsl:value-of select="@id"/> TYPE
		<xsl:call-template name="db_data_type">
			<xsl:with-param name="data_type" select="@dataType"/>
			<xsl:with-param name="primary_key" select="@primaryKey"/>
			<xsl:with-param name="length" select="@length"/>
			<xsl:with-param name="precision" select="@precision"/>
			<xsl:with-param name="auto_inc" select="@autoInc"/>
		</xsl:call-template>						
	</xsl:when>
	<xsl:when test="@cmd=$CMD_CREATE or ../@cmd=$CMD_CREATE">
		<xsl:if test="@cmd=$CMD_CREATE">ADD COLUMN </xsl:if>
		<xsl:value-of select="@id"/><xsl:value-of select="' '"/>
		<xsl:call-template name="db_data_type">
			<xsl:with-param name="data_type" select="@dataType"/>
			<xsl:with-param name="primary_key" select="@primaryKey"/>
			<xsl:with-param name="length" select="@length"/>
			<xsl:with-param name="precision" select="@precision"/>
			<xsl:with-param name="auto_inc" select="@autoInc"/>
		</xsl:call-template>				
		<!-- other attributes-->
		
		<!-- Default value -->
        <xsl:call-template name="def_col_val">
        	<xsl:with-param name="def_val" select="@defaultValue"/>
		<xsl:with-param name="data_type" select="@dataType"/>
	</xsl:call-template>
		
		<!-- NULL -->
		<xsl:if test="@primaryKey='TRUE' or ((@dbRequired='TRUE' or (not(@dbRequired) and @required='TRUE') ) and not(@primaryKey='TRUE'))">
			<xsl:value-of select="' NOT NULL'"/>
		</xsl:if>
		
		<!-- Unique -->
		<xsl:if test="@unique='TRUE'">
			<xsl:value-of select="' UNIQUE'"/>
		</xsl:if>

		<!-- References -->
		<xsl:if test="@refTable">
			<xsl:value-of select="concat(' REFERENCES ',@refTable,'(',@refField,')')"/>
		</xsl:if>
		
		<!-- check -->
		<xsl:if test="@checkExpression">
			<xsl:value-of select="concat(' CHECK (',@checkExpression,')')"/>
		</xsl:if>
		
		<xsl:apply-templates select="checkValues" />
	</xsl:when>
	<xsl:when test="@cmd=$CMD_RENAME">
		ALTER COLUMN <xsl:value-of select="@id"/> RENAME TO <xsl:value-of select="@newId"/>
	</xsl:when>			
	<xsl:when test="@cmd=$CMD_DROP">
		DROP COLUMN <xsl:value-of select="@id"/>
	</xsl:when>			
	</xsl:choose>
		
</xsl:template>

<xsl:template match="checkValues">
	CHECK (<xsl:value-of select="../@id"/> IN (<xsl:apply-templates select="checkValue"/>))
</xsl:template>
<xsl:template match="checkValue">
	<xsl:if test="position() &gt; 1">,</xsl:if> '<xsl:value-of select="node()"/>'
</xsl:template>

<xsl:template match="model[@virtual='FALSE']/field[@primaryKey='TRUE']" mode="primaryKey">
	<xsl:if test="position() &gt; 1">,</xsl:if><xsl:value-of select="@id"/>
</xsl:template>

<xsl:template match="model[@virtual='FALSE']/index">
	DROP INDEX IF EXISTS <xsl:value-of select="@id"/>;
	CREATE <xsl:if test="@unique='TRUE'"><xsl:value-of select="'UNIQUE '"/></xsl:if>INDEX <xsl:value-of select="@id"/>
	ON <xsl:value-of select="../@dataTable"/> <xsl:if test="@type"> USING <xsl:value-of select="@type"/></xsl:if>(<xsl:apply-templates select="field"/><xsl:if test="field and expression">,</xsl:if><xsl:apply-templates select="expression"/>);
</xsl:template>

<xsl:template match="model[@virtual='FALSE']/index/expression">
	<xsl:value-of select="node()"/>
</xsl:template>

<xsl:template match="model[@virtual='FALSE']/index/field">
	<xsl:if test="position() &gt; 1">,</xsl:if>
	<xsl:value-of select="@id"/>
</xsl:template>

<xsl:template match="model[@virtual='TRUE']/description">
CREATE OR REPLACE FUNCTION <xsl:value-of select="../@id"/>_descr(<xsl:value-of select="../@dataTable"/>)
RETURNS text AS $$
	<xsl:value-of select="node()"/>;
$$ LANGUAGE SQL;
ALTER FUNCTION <xsl:value-of select="../@id"/>_descr(<xsl:value-of select="../@dataTable"/>) OWNER TO <xsl:value-of select="/metadata/@owner"/>;
</xsl:template>

<xsl:template name="db_data_type">
	<xsl:param name="data_type"/>
	<xsl:param name="primary_key"/>
	<xsl:param name="auto_inc"/>
	<xsl:param name="length"/>
	<xsl:param name="precision"/>
	<xsl:choose>
		<xsl:when test="($data_type=$DT_INT or $data_type=$DT_INT_BIG or $data_type=$DT_INT_SMALL) and $primary_key='TRUE' and $auto_inc='TRUE'">serial</xsl:when>
		<xsl:when test="$data_type=$DT_INT">int</xsl:when>
		<xsl:when test="$data_type=$DT_INT_BIG">bigint</xsl:when>
		<xsl:when test="$data_type=$DT_INT_SMALL">smallint</xsl:when>
		<xsl:when test="$data_type=$DT_ENUM"><xsl:value-of select="@enumId"/></xsl:when>
		<xsl:when test="$data_type=$DT_STRING or $data_type=$DT_PWD">
			<xsl:value-of select="concat(' varchar(',$length,')')"/>
		</xsl:when>
		<xsl:when test="$data_type=$DT_CHAR">char</xsl:when>			
		<xsl:when test="$data_type=$DT_BOOL or $data_type=$DT_BOOLEAN">bool</xsl:when>			
		<!--<xsl:when test="@dataType=$DT_FLOAT">float</xsl:when>-->
		<xsl:when test="($data_type=$DT_NUMERIC) or ($data_type=$DT_FLOAT)">
			<xsl:value-of select="concat(' numeric(',$length,',',$precision,')')"/>
		</xsl:when>			
		<xsl:when test="$data_type=$DT_DATE">date</xsl:when>
		<xsl:when test="$data_type=$DT_DATETIME">timestamp</xsl:when>
		<xsl:when test="$data_type=$DT_DATETIMETZ">timestampTZ</xsl:when>
		<xsl:when test="$data_type=$DT_TIME">time</xsl:when>
		<xsl:when test="$data_type=$DT_TIMETZ">timeTZ</xsl:when>
		<xsl:when test="$data_type=$DT_INTERVAL">interval</xsl:when>
		<xsl:when test="$data_type=$DT_TEXT">text</xsl:when>
		
		<xsl:when test="$data_type=$DT_GEOM_POLYGON">geometry</xsl:when>
		<xsl:when test="$data_type=$DT_GEOM_POINT">geometry</xsl:when>
		
		<xsl:when test="$data_type=$DT_TSVECTOR">tsvector</xsl:when>
		
		<xsl:when test="$data_type=$DT_JSON">json</xsl:when>
		<xsl:when test="$data_type=$DT_JSONB">jsonb</xsl:when>
		<xsl:when test="$data_type=$DT_ARRAY"><xsl:value-of select="@arrayType"/>[]</xsl:when>
		<xsl:when test="$data_type=$DT_XML">xml</xsl:when>
		<xsl:when test="$data_type=$DT_BYTEA">bytea</xsl:when>
		
		<xsl:otherwise>
			<xsl:value-of select="concat(' UNSUPPORTED_DATA_TYPE(',$length,')')"/>				
		</xsl:otherwise>
	</xsl:choose>
	
</xsl:template>

<xsl:template name="def_col_val">
	<xsl:param name="def_val"/>
	<xsl:param name="data_type"/>
	<xsl:choose>
		<xsl:when test="$def_val and ($data_type=$DT_STRING or $data_type=$DT_CHAR or $data_type=$DT_ENUM)">
			DEFAULT '<xsl:value-of select="$def_val"/>'
		</xsl:when>
		<xsl:when test="$def_val and not($data_type=$DT_STRING) and not($data_type=$DT_CHAR)">
			DEFAULT <xsl:value-of select="$def_val"/>
		</xsl:when>		
	</xsl:choose>
	
</xsl:template>

<xsl:template name="replace-string">
    <xsl:param name="text"/>
    <xsl:param name="replace"/>
    <xsl:param name="with"/>
    <xsl:choose>
      <xsl:when test="contains($text,$replace)">
        <xsl:value-of select="substring-before($text,$replace)"/>
        <xsl:value-of select="$with"/>
        <xsl:call-template name="replace-string">
          <xsl:with-param name="text"
select="substring-after($text,$replace)"/>
          <xsl:with-param name="replace" select="$replace"/>
          <xsl:with-param name="with" select="$with"/>
        </xsl:call-template>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="$text"/>
      </xsl:otherwise>
    </xsl:choose>
</xsl:template>
  
<xsl:template match="constants">
	<xsl:apply-templates select="constant"/>	
	<xsl:choose>
	<xsl:when test="@cmd=$CMD_CREATE or @cmd=$CMD_ALTER or @cmd=$CMD_DROP">
	
	CREATE OR REPLACE VIEW constants_list_view AS
	<xsl:for-each select="constant[not(@cmd) or not(@cmd=$CMD_DROP)]">
	<xsl:if test="position() &gt; 1">
	UNION ALL
	</xsl:if>
	SELECT *
	FROM <xsl:value-of select="concat('const_',@id,'_view')"/>
	</xsl:for-each>
	ORDER BY name;
	ALTER VIEW constants_list_view OWNER TO <xsl:value-of select="/metadata/@owner"/>;
	
	</xsl:when>
	<xsl:otherwise>
	</xsl:otherwise>
	</xsl:choose>
</xsl:template>

<xsl:template match="constant">
	<xsl:variable name="table_name" select="concat('const_',@id)"/>
	<xsl:variable name="func_prot" select="concat('const_',@id,'_val()')"/>
	<xsl:variable name="func_set_prot" select="concat('const_',@id,'_set_val(',@dataType,')')"/>
	<xsl:variable name="view_name" select="concat('const_',@id,'_view')"/>
	
	<xsl:choose>
	<xsl:when test="@cmd=$CMD_CREATE">
		<xsl:variable name="create_dt">
		<xsl:call-template name="db_data_type">
			<xsl:with-param name="data_type" select="@dataType"/>
			<xsl:with-param name="primary_key" select="'FALSE'"/>
			<xsl:with-param name="length" select="@length"/>
			<xsl:with-param name="precision" select="@precision"/></xsl:call-template>	
		</xsl:variable>
	-- ********** constant value table  <xsl:value-of select="@id"/> *************
	CREATE TABLE IF NOT EXISTS <xsl:value-of select="$table_name"/>
	(name text, descr text, val <xsl:value-of select="$create_dt"/>,
		val_type text,ctrl_class text,ctrl_options json, view_class text,view_options json);
	<xsl:if test="/metadata/@owner">ALTER TABLE <xsl:value-of select="$table_name"/> OWNER TO <xsl:value-of select="/metadata/@owner"/>;</xsl:if>
	INSERT INTO <xsl:value-of select="$table_name"/> (name,descr,val,val_type,ctrl_class,ctrl_options,view_class,view_options) VALUES (
		'<xsl:value-of select="@name"/>'
		,'<xsl:value-of select="@descr"/>'
		,<xsl:choose>
		<xsl:when test="@defaultValue">
			<xsl:choose>
			<xsl:when test="@dataType=$DT_STRING or @dataType=$DT_CHAR or @dataType=$DT_DATE or @dataType=$DT_DATETIME or @dataType=$DT_DATETIMETZ or @dataType=$DT_TIME or @dataType=$DT_TIMETZ or @dataType=$DT_INTERVAL or @dataType=$DT_TEXT or @dataType=$DT_PWD">
			'<xsl:value-of select="@defaultValue"/>'
			</xsl:when>
			<xsl:otherwise><xsl:value-of select="@defaultValue"/></xsl:otherwise>
			</xsl:choose>
		</xsl:when>
		<xsl:otherwise>NULL</xsl:otherwise>
		</xsl:choose>
		,<xsl:choose><xsl:when test="@refTable">'Ref'</xsl:when><xsl:otherwise>'<xsl:value-of select="@dataType"/>'</xsl:otherwise></xsl:choose>
		,<xsl:choose><xsl:when test="@ctrlClass">'<xsl:value-of select="@ctrlClass"/>'</xsl:when><xsl:otherwise>NULL</xsl:otherwise></xsl:choose>
		,<xsl:choose><xsl:when test="@ctrlOptions">'<xsl:value-of select="@ctrlOptions"/>'</xsl:when><xsl:otherwise>NULL</xsl:otherwise></xsl:choose>
		,<xsl:choose><xsl:when test="@viewClass">'<xsl:value-of select="@viewClass"/>'</xsl:when><xsl:otherwise>NULL</xsl:otherwise></xsl:choose>
		,<xsl:choose><xsl:when test="@viewOptions">'<xsl:value-of select="@viewOptions"/>'</xsl:when><xsl:otherwise>NULL</xsl:otherwise></xsl:choose>
	);
	</xsl:when>
	<xsl:when test="@cmd=$CMD_DROP or @cmd=$CMD_ALTER">
	DROP FUNCTION <xsl:value-of select="$func_prot"/>;
	DROP FUNCTION <xsl:value-of select="$func_set_prot"/>;
	DROP VIEW <xsl:value-of select="$view_name"/> CASCADE;
	<xsl:if test="@cmd=$CMD_DROP">
	DROP TABLE <xsl:value-of select="$table_name"/>;
	</xsl:if>
	</xsl:when>
	</xsl:choose>
	
	<xsl:if test="@cmd=$CMD_CREATE or @cmd=$CMD_ALTER">
	
		<xsl:variable name="data_type">
		<xsl:call-template name="db_data_type">
			<xsl:with-param name="data_type" select="@dataType"/>
			<xsl:with-param name="primary_key" select="@primaryKey"/>
			<xsl:with-param name="auto_inc" select="@autoInc"/>
			<xsl:with-param name="length" select="@length"/>
			<xsl:with-param name="precision" select="@precision"/>
		</xsl:call-template>
		</xsl:variable>
		--constant get value
		<xsl:variable name="get_dt">
		<xsl:choose>
		<xsl:when test="@refTable">json</xsl:when>
		<xsl:otherwise><xsl:value-of select="$data_type"/></xsl:otherwise>
		</xsl:choose>
		</xsl:variable>
	CREATE OR REPLACE FUNCTION <xsl:value-of select="$func_prot"/>
	RETURNS <xsl:value-of select="$get_dt"/> AS
	$BODY$
		<xsl:choose>
		<xsl:when test="@refTable">
		<xsl:variable name="ref_table" select="@refTable"/>
		<xsl:variable name="model" select="/metadata/models/model[@dataTable=$ref_table]"/>
		SELECT <xsl:value-of select="@refTable"/>_ref(
			(SELECT
				ROW(<xsl:value-of select="@refTable"/>.*)::<xsl:value-of select="@refTable"/>
			FROM <xsl:value-of select="@refTable"/>
			WHERE <xsl:value-of select="$model/field[@primaryKey='TRUE']/@id"/> = (SELECT val FROM <xsl:value-of select="$table_name"/> LIMIT 1) LIMIT 1)
			) AS val ;			
		</xsl:when>
		<xsl:otherwise>
		SELECT val::<xsl:value-of select="$get_dt"/> AS val FROM <xsl:value-of select="$table_name"/> LIMIT 1;
		</xsl:otherwise>
		</xsl:choose>
	$BODY$
	LANGUAGE sql STABLE COST 100;
	ALTER FUNCTION <xsl:value-of select="$func_prot"/> OWNER TO <xsl:value-of select="/metadata/@owner"/>;
	
	--constant set value
	CREATE OR REPLACE FUNCTION <xsl:value-of select="$func_set_prot"/>
	RETURNS void AS
	$BODY$
		UPDATE <xsl:value-of select="$table_name"/> SET val=$1;
	$BODY$
	LANGUAGE sql VOLATILE COST 100;
	ALTER FUNCTION <xsl:value-of select="$func_set_prot"/> OWNER TO <xsl:value-of select="/metadata/@owner"/>;
	
	--edit view: all keys and descr
	CREATE OR REPLACE VIEW <xsl:value-of select="$view_name"/> AS
	SELECT
		'<xsl:value-of select="@id"/>'::text AS id
		,t.name
		,t.descr
	,<xsl:choose>
	<xsl:when test="@refTable">	
	<xsl:value-of select="$func_prot"/>::text AS val
	</xsl:when>
	<xsl:otherwise>
	t.val::text AS val
	</xsl:otherwise>
	</xsl:choose>
	,t.val_type::text AS val_type
	,t.ctrl_class::text
	,t.ctrl_options::json
	,t.view_class::text
	,t.view_options::json
	FROM <xsl:value-of select="$table_name"/> AS t
	;
	ALTER VIEW <xsl:value-of select="$view_name"/> OWNER TO <xsl:value-of select="/metadata/@owner"/>;
	
	</xsl:if>
	
</xsl:template>
  
<xsl:template name="common_functions">
	<xsl:if test="/metadata[@cmd=$CMD_CREATE]">
--session support
CREATE TABLE IF NOT EXISTS sessions(
  id character(128) NOT NULL,
  set_time character(10) NOT NULL,
  data text NOT NULL,
  session_key character(128) NOT NULL,
  pub_key character varying(15),
  CONSTRAINT sessions_pkey PRIMARY KEY (id)
)
WITH (OIDS=FALSE);
ALTER TABLE sessions OWNER TO <xsl:value-of select="/metadata/@owner"/>;

DROP INDEX sessions_pub_key_idx;
CREATE INDEX sessions_pub_key_idx ON sessions (pub_key);


--login support
CREATE TABLE IF NOT EXISTS logins(
  id serial NOT NULL,
  date_time_in timestamp with time zone NOT NULL,
  date_time_out timestamp with time zone,
  ip character varying(15) NOT NULL,
  session_id character(128) NOT NULL,
  user_id integer,
  pub_key character(15),
  set_date_time timestamp without time zone DEFAULT now(),
  CONSTRAINT logins_pkey PRIMARY KEY (id)
);
ALTER TABLE logins OWNER TO <xsl:value-of select="/metadata/@owner"/>;

DROP INDEX logins_session_id_idx;
CREATE INDEX logins_session_id_idx ON logins (session_id);

DROP INDEX users_pub_key_idx;
CREATE INDEX users_pub_key_idx ON logins (pub_key);

CREATE OR REPLACE FUNCTION logins_process()
  RETURNS trigger AS
$BODY$
BEGIN
	IF (TG_WHEN='AFTER' AND TG_OP='UPDATE') THEN
		IF NEW.date_time_out IS NOT NULL THEN
			--tmp tables
			<xsl:for-each select="/metadata/models/model[@modelType='DOCT']">
			DELETE FROM <xsl:value-of select="@dataTable"/> WHERE login_id=NEW.id;
			</xsl:for-each>
		END IF;
		
		RETURN NEW;
	END IF;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION logins_process() OWNER TO <xsl:value-of select="/metadata/@owner"/>;


DROP TRIGGER logins_trigger ON logins;
CREATE TRIGGER logins_trigger AFTER UPDATE OR DELETE ON logins
FOR EACH ROW
EXECUTE PROCEDURE logins_process();

--***********************************
CREATE OR REPLACE FUNCTION logins_forse_close()
  RETURNS void AS
$BODY$
	UPDATE logins
		SET date_time_out = now()
	FROM (	
		SELECT t.id
		FROM logins t
		WHERE t.date_time_out IS NULL
			AND (t.date_time_in + const_session_live_time_val()) &lt; now()
	) AS sel	
	WHERE sel.id=logins.id;
$BODY$
  LANGUAGE sql VOLATILE
  COST 100;
ALTER FUNCTION logins_forse_close()
  OWNER TO <xsl:value-of select="/metadata/@owner"/>;

	</xsl:if>

	
<!-- DOC LOG FUNCTIONS -->		
	<xsl:if test="count(/metadata/models/model[@modelType='DOC' and @cmd=$CMD_CREATE]) &gt; 0">
--**************** LOG FUNCTIONS **************************************	

--************ DOC table for a type **************************
CREATE OR REPLACE FUNCTION doc_table(in_doc_type doc_types)
  RETURNS text AS
$BODY$
	SELECT
		CASE in_doc_type
		<xsl:for-each select="/metadata/models/model[@modelType='DOC' and @virtual='FALSE']">WHEN '<xsl:value-of select="@docTypeId"/>'::doc_types THEN '<xsl:value-of select="@dataTable"/>'::text
		</xsl:for-each>
		END;
$BODY$
  LANGUAGE sql VOLATILE COST 100;
ALTER FUNCTION doc_table(in_doc_type doc_types) OWNER TO <xsl:value-of select="/metadata/@owner"/>;

--*****************************
CREATE OR REPLACE FUNCTION doc_descr(in_doc_type doc_types, in_number text, in_date_time timestamp without time zone)
  RETURNS text AS
$BODY$
	SELECT concat(get_doc_types_descr(in_doc_type)::text,' №',in_number,' от ',in_date_time);
$BODY$
  LANGUAGE sql VOLATILE COST 100;
ALTER FUNCTION doc_descr(in_doc_type doc_types, in_number text, in_date_time timestamp without time zone) OWNER TO <xsl:value-of select="/metadata/@owner"/>;
--*******************************************


--all documents log
CREATE TABLE IF NOT EXISTS doc_log
(
  date_time timestamp NOT NULL,
  doc_type doc_types NOT NULL,
  doc_id integer NOT NULL,
  CONSTRAINT doc_log_pkey PRIMARY KEY (date_time)
);
ALTER TABLE doc_log OWNER TO <xsl:value-of select="/metadata/@owner"/>;	

DROP INDEX doc_log_doc_idx;
CREATE INDEX doc_log_doc_idx ON doc_log (doc_type,doc_id);		

DROP INDEX doc_log_date_time_sec_idx;
CREATE INDEX doc_log_date_time_sec_idx ON doc_log USING btree (date_trunc('second'::text, date_time));

	</xsl:if>
	
<!-- CALC PERIOD FUNCTIONS -->	
	<xsl:if test="count(/metadata/models/model[@modelType='RG' and @cmd=$CMD_CREATE]) &gt; 0">
--********* rg calc period FUNCTIONS ********************

--************Calc period on register and date *************************
CREATE OR REPLACE FUNCTION rg_period(in_reg_type reg_types, in_date_time timestamp)
RETURNS timestamp AS
$BODY$
	SELECT date_trunc('MONTH', in_date_time)::timestamp without time zone;
$BODY$
LANGUAGE sql IMMUTABLE COST 100;
ALTER FUNCTION rg_period(in_reg_type reg_types, in_date_time timestamp without time zone) OWNER TO <xsl:value-of select="/metadata/@owner"/>;
--**************************************************************************

--****************** Current calc period on register **********************************
CREATE OR REPLACE FUNCTION rg_calc_period(in_reg_type reg_types)
RETURNS timestamp AS
$BODY$
	SELECT date_time FROM rg_calc_periods WHERE reg_type=$1;
$BODY$
LANGUAGE sql STABLE COST 100;
ALTER FUNCTION rg_calc_period(reg_types) OWNER TO <xsl:value-of select="/metadata/@owner"/>;
--*********************************************************************************

--************ Constant value for TA time *****************************************
CREATE OR REPLACE FUNCTION rg_current_balance_time()
  RETURNS timestamp without time zone AS
$BODY$
	SELECT '3000-01-01 00:00:00'::timestamp without time zone;
$BODY$
  LANGUAGE sql IMMUTABLE COST 100;
ALTER FUNCTION rg_current_balance_time() OWNER TO <xsl:value-of select="/metadata/@owner"/>;
--************************************************************************************


--********** Calc interval for a reginster ***************************************** 
CREATE OR REPLACE FUNCTION rg_calc_interval(in_reg_type reg_types)
  RETURNS interval AS
$BODY$
	SELECT
		CASE $1
		<xsl:for-each select="/metadata/models/model[@modelType='RG']">
		<xsl:variable name="ra_model_id">
			<xsl:call-template name="replace-string">
			  <xsl:with-param name="text" select="@id"/>
			  <xsl:with-param name="replace" select="'RG'" />
			  <xsl:with-param name="with" select="'RA'"/>
			</xsl:call-template>			
		</xsl:variable>				
		WHEN '<xsl:value-of select="/metadata/models/model[@id=$ra_model_id]/@regTypeId"/>'::reg_types THEN '<xsl:value-of select="@period"/>'::interval
		</xsl:for-each>
		END;
$BODY$
  LANGUAGE sql IMMUTABLE COST 100;
ALTER FUNCTION rg_calc_interval(reg_types) OWNER TO <xsl:value-of select="/metadata/@owner"/>;
--********************************************************************************************


--***** Table for current periods on registers *************************
CREATE TABLE IF NOT EXISTS rg_calc_periods(
  reg_type reg_types NOT NULL,
  date_time timestamp NOT NULL,
  CONSTRAINT rg_calc_periods_pkey PRIMARY KEY (reg_type)
);
ALTER TABLE rg_calc_periods OWNER TO <xsl:value-of select="/metadata/@owner"/>;
--*****************************************************

--Populate with data
INSERT INTO rg_calc_periods VALUES
<xsl:for-each select="/metadata/models/model[@modelType='RG' and @cmd=$CMD_CREATE]">
	<xsl:variable name="ra_model_id">
		<xsl:call-template name="replace-string">
		  <xsl:with-param name="text" select="@id"/>
		  <xsl:with-param name="replace" select="'RG'" />
		  <xsl:with-param name="with" select="'RA'"/>
		</xsl:call-template>			
	</xsl:variable>

	<xsl:if test="position() &gt; 1">,</xsl:if>
	('<xsl:value-of select="/metadata/models/model[@id=$ra_model_id]/@regTypeId"/>'::reg_types,'2014-01-01 00:00:00'::timestamp without time zone)
</xsl:for-each>;

	</xsl:if>
	
</xsl:template>




<xsl:template match="registerAtcs">
<xsl:variable name="view" select="concat(../@dataTable,'_register_list')"/>
CREATE OR REPLACE VIEW <xsl:value-of select="$view"/> AS 
<xsl:for-each select="register">
<xsl:if test="position() &gt; 1">UNION ALL</xsl:if>
<xsl:variable name="reg_id" select="@id"/>
<xsl:variable name="reg_type_id" select="/metadata/models/model[@id=$reg_id]/@regTypeId"/>
SELECT
	'<xsl:value-of select="$reg_type_id"/>'::text AS reg_id,
	get_reg_types_descr('<xsl:value-of select="$reg_type_id"/>'::reg_types)::text AS reg_name
</xsl:for-each>;
<xsl:if test="/metadata/@owner">
ALTER VIEW <xsl:value-of select="$view"/> OWNER TO <xsl:value-of select="/metadata/@owner"/>;
</xsl:if>

--doc actions
<xsl:variable name="doc_act_func" select="concat(../@dataTable,'_get_actions(IN in_doc_id int)')"/>
CREATE OR REPLACE FUNCTION <xsl:value-of select="$doc_act_func"/>
  RETURNS TABLE(reg_id text, reg_name text, deb boolean, dimensions text, attributes text, facts text) AS
$BODY$
BEGIN
RETURN QUERY
<xsl:for-each select="register">
<xsl:variable name="reg_id" select="@id"/>
<xsl:variable name="reg_model" select="/metadata/models/model[@id=$reg_id]"/>
<xsl:variable name="reg_type_id" select="$reg_model/@regTypeId"/>
<xsl:if test="position() &gt; 1">UNION ALL</xsl:if>
<xsl:variable name="id" select="@id"/>
<xsl:variable name="ref_field_id" select="@refFieldId"/>
SELECT
	'<xsl:value-of select="$reg_type_id"/>'::text AS reg_id,
	get_reg_types_descr('<xsl:value-of select="$reg_type_id"/>'::reg_types)::text AS reg_name,
	<xsl:choose>
	<xsl:when test="$reg_model/@balance='FALSE'">
	TRUE AS deb,
	</xsl:when>
	<xsl:otherwise>
	<xsl:value-of select="$reg_model/@dataTable"/>.deb,
	</xsl:otherwise>
	</xsl:choose>
	<xsl:for-each select="$reg_model/field[@regFieldType='dimension']">
		<xsl:variable name="ref_table" select="@refTable"/>
		<xsl:variable name="doc_model" select="/metadata/models/model[@dataTable=$ref_table and @modelType='DOC']"/>
		<xsl:if test="position() &gt; 1">||chr(13)||chr(10)||</xsl:if>
		<xsl:choose>			
			<xsl:when test="$doc_model">
			doc_descr('<xsl:value-of select="$doc_model/@docTypeId"/>'::doc_types,<xsl:value-of select="$ref_table"/>.number::text,<xsl:value-of select="$ref_table"/>.date_time)
			</xsl:when>
			<xsl:when test="$ref_table">				
	<xsl:value-of select="$ref_table"/>.<xsl:value-of select="/metadata/models/model[@dataTable=$ref_table]/field[@display='TRUE']/@id"/>
			</xsl:when>
			<xsl:when test="@dataType=$DT_ENUM">
			get_<xsl:value-of select="@enumId"/>_descr(<xsl:value-of select="@id"/>)
			</xsl:when>
		</xsl:choose>
	</xsl:for-each> AS dimensions,
	'' AS attributes,
	<xsl:for-each select="$reg_model/field[@regFieldType='fact']">
		<xsl:if test="position() &gt; 1">||chr(13)||chr(10)||</xsl:if>
		COALESCE(<xsl:value-of select="concat($reg_model/@dataTable,'.',@id)"/>,0)::text
	</xsl:for-each> AS facts
	FROM <xsl:value-of select="$reg_model/@dataTable"/>
	<xsl:for-each select="$reg_model/field[@regFieldType='dimension' and @refTable]">	
	LEFT JOIN <xsl:value-of select="@refTable"/> ON <xsl:value-of select="@refTable"/>.<xsl:value-of select="@refField"/>=<xsl:value-of select="$reg_model/@dataTable"/>.<xsl:value-of select="@id"/>
	</xsl:for-each>
	WHERE doc_type='<xsl:value-of select="../../@docTypeId"/>'::doc_types AND doc_id=in_doc_id	
</xsl:for-each>;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE COST 100;
<xsl:if test="/metadata/@owner">  
ALTER FUNCTION <xsl:value-of select="$doc_act_func"/> OWNER TO <xsl:value-of select="/metadata/@owner"/>;;
</xsl:if>
</xsl:template>

<xsl:template match="views">	
	<xsl:choose>
	<xsl:when test="@cmd=$CMD_CREATE">
	CREATE TABLE views (
		id int NOT NULL,
		c text,
		f text,
		t text,
		section text NOT NULL,
		descr text NOT NULL,
		limited bool,
	CONSTRAINT views_pkey PRIMARY KEY (id)
	);
	ALTER VIEW views OWNER TO <xsl:value-of select="/metadata/@owner"/>;	
	</xsl:when>	
	<xsl:otherwise>
	</xsl:otherwise>
	</xsl:choose>	
	
	<xsl:apply-templates select="view"/>	
</xsl:template>

<xsl:template match="view">
	<xsl:choose>
	<xsl:when test="@cmd=$CMD_CREATE">
	
	-- Adding menu item
	INSERT INTO views
	(id,c,f,t,section,descr,limited)
	VALUES (
	'<xsl:value-of select="@id"/>',
	<xsl:choose> <xsl:when test="@c and not(@c='')">'<xsl:value-of select="@c"/>'</xsl:when> <xsl:otherwise>NULL</xsl:otherwise> </xsl:choose>,
	<xsl:choose> <xsl:when test="@f and not(@f='')">'<xsl:value-of select="@f"/>'</xsl:when> <xsl:otherwise>NULL</xsl:otherwise> </xsl:choose>,
	<xsl:choose> <xsl:when test="@t and not(@t='')">'<xsl:value-of select="@t"/>'</xsl:when> <xsl:otherwise>NULL</xsl:otherwise> </xsl:choose>,
	'<xsl:value-of select="@section"/>',
	'<xsl:value-of select="@descr"/>',
	<xsl:choose> <xsl:when test="@limit='TRUE'">TRUE</xsl:when> <xsl:otherwise>FALSE</xsl:otherwise> </xsl:choose>
	);
	
	</xsl:when>
	<xsl:when test="@cmd=$CMD_ALTER">
		UPDATE views SET
			c=<xsl:choose> <xsl:when test="@c and not(@c='')">'<xsl:value-of select="@c"/>'</xsl:when> <xsl:otherwise>NULL</xsl:otherwise> </xsl:choose>,
			f=<xsl:choose> <xsl:when test="@f and not(@f='')">'<xsl:value-of select="@f"/>'</xsl:when> <xsl:otherwise>NULL</xsl:otherwise> </xsl:choose>,
			t=<xsl:choose> <xsl:when test="@t and not(@t='')">'<xsl:value-of select="@t"/>'</xsl:when> <xsl:otherwise>NULL</xsl:otherwise> </xsl:choose>,
			section='<xsl:value-of select="@section"/>',
			descr='<xsl:value-of select="@descr"/>',
			limited=<xsl:choose> <xsl:when test="@limit='TRUE'">TRUE</xsl:when> <xsl:otherwise>FALSE</xsl:otherwise> </xsl:choose>
		WHERE id='<xsl:value-of select="@id"/>';
	</xsl:when>
	<xsl:when test="@cmd=$CMD_DROP">
		DELETE FROM views WHERE id='<xsl:value-of select="@id"/>';
	</xsl:when>	
	<xsl:otherwise>
	</xsl:otherwise>
	</xsl:choose>
</xsl:template>

<xsl:template match="predefinedItem">
	<xsl:choose>
	<xsl:when test="@cmd=$CMD_CREATE">
		INSERT INTO <xsl:value-of select="../../@dataTable"/>
		(<xsl:for-each select="*"> <xsl:if test="position() &gt;1">,</xsl:if> <xsl:value-of select="local-name()"/> </xsl:for-each>)
		VALUES (
		<xsl:for-each select="*"> <xsl:if test="position() &gt;1">,</xsl:if>'<xsl:value-of select="node()"/>'</xsl:for-each>
		);
	</xsl:when>
	<xsl:when test="@cmd=$CMD_ALTER">
		UPDATE <xsl:value-of select="../../@dataTable"/> SET
		WHERE
		<xsl:for-each select="*"> <xsl:if test="position() &gt;1"> AND </xsl:if> <xsl:value-of select="local-name()"/>= '<xsl:value-of select="node()"/>' </xsl:for-each>
		;
	</xsl:when>
	<xsl:when test="@cmd=$CMD_DROP">
		DELETE FROM <xsl:value-of select="../../@dataTable"/> WHERE
		<xsl:for-each select="*"> <xsl:if test="position() &gt;1"> AND </xsl:if> <xsl:value-of select="local-name()"/>= '<xsl:value-of select="node()"/>' </xsl:for-each>
		;
	</xsl:when>	
	<xsl:otherwise>
	</xsl:otherwise>
	</xsl:choose>

</xsl:template>

</xsl:stylesheet>
