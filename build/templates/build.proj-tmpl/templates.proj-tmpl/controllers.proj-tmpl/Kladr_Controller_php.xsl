<?xml version="1.0" encoding="UTF-8"?>

<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:import href="Controller_php.xsl"/>

<!-- -->
<xsl:variable name="CONTROLLER_ID" select="'Kladr'"/>
<!-- -->

<xsl:output method="text" indent="yes"
			doctype-public="-//W3C//DTD XHTML 1.0 Strict//EN" 
			doctype-system="http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"/>
			
<xsl:template match="/">
	<xsl:apply-templates select="metadata/controllers/controller[@id=$CONTROLLER_ID]"/>
</xsl:template>

<xsl:template match="controller"><![CDATA[<?php]]>
<xsl:call-template name="add_requirements"/>

require_once(FRAME_WORK_PATH.'basic_classes/ParamsSQL.php');

<!--
SELECT 
	k.code,
	k.name,
	k.socr,
	(SELECT t.name FROM kladr AS t WHERE t.code LIKE '72000000000__') AS region_descr,
	(SELECT t.name FROM kladr AS t WHERE t.code = substr(k.code,1,5)||'00000000') AS region_descr
FROM kladr AS k
WHERE 
	lower(k.name) LIKE 'тюме%'
	AND substr(k.code,1,2)='72'
	AND NOT k.code LIKE substr(k.code,1,2)||'___00000000'
ORDER BY code,name
LIMIT 5

МЕДЛЕННЫЙ ЗАПРОС
SELECT code AS ulitza_code, name, name||' '||socr AS full_name
FROM street
WHERE code LIKE '72000001000%' AND lower(name) LIKE lower('немц%') ORDER BY name LIMIT 5

НОВАЯ КОЛОНКА

UPDATE street set code_part = substr(code,1,11)
CREATE INDEX street_code_part ON street (code_part);

БЫЛО
code LIKE '%s%s%s%s______'
code LIKE '%s%s%s%s%%'


-->

class <xsl:value-of select="@id"/>_Controller extends ControllerSQL{
	const COMPLETE_RES_COUNT=5;
	
	public function __construct($dbLinkMaster=NULL,$dbLink=NULL){
		$kladr_link = new DB_Sql();
		$kladr_link->appname		= APP_NAME;
		$kladr_link->technicalemail = TECH_EMAIL;
		$kladr_link->reporterror	= DEBUG;
		$kladr_link->database		= 'kladr';
		$kladr_link->connect(KLADR_DB_SERVER,KLADR_DB_USER,KLADR_DB_PASSWORD);
		//$kladr_link->set_error_verbosity((DEBUG)? PGSQL_ERRORS_VERBOSE:PGSQL_ERRORS_TERSE);
		
		parent::__construct($dbLinkMaster,$kladr_link);<xsl:apply-templates/>
	}	
	public function get_region_list($pm){
		$dbLink = $this->getDbLink();
		$pattern = $dbLink->escape_string($pm->getParamValue('pattern'));
		$q = sprintf("SELECT 
				code AS region_code,
				name,
				name||' '||socr AS full_name
			FROM kladr
			WHERE code LIKE '__000000000__'
				AND lower(name) LIKE lower('%s%%')
			ORDER BY name LIMIT %d",
			$pattern,
			Kladr_Controller::COMPLETE_RES_COUNT);
		$this->addNewModel($q);
	}	
	public function get_raion_list($pm){
		$dbLink = $this->getDbLink();
		$pattern = $dbLink->escape_string($pm->getParamValue('pattern'));
		$region_code = substr($dbLink->escape_string($pm->getParamValue('region_code')),0,2);
	
		$q = sprintf("SELECT 
				code AS raion_code,
				name,
				name||' '||socr AS full_name
			FROM kladr
			WHERE
				code LIKE '%s___00000000'
				AND code &lt;&gt; '%s00000000000'
				AND lower(name) LIKE lower('%s%%')
			ORDER BY name LIMIT %d",
			$region_code,
			$region_code,
			$pattern,
			Kladr_Controller::COMPLETE_RES_COUNT);
		$this->addNewModel($q);
	}		
	public function get_naspunkt_list($pm){
		$dbLink = $this->getDbLink();
		$pattern = $dbLink->escape_string($pm->getParamValue('pattern'));
		$region_code = substr($dbLink->escape_string($pm->getParamValue('region_code')),0,2);
		$raion_code_str = $dbLink->escape_string($pm->getParamValue('raion_code'));
		$raion_code = substr($raion_code_str,2,3);
		if (!strlen($raion_code) || $raion_code_str=='null'){
			$raion_code = '000';
		}
		
		$q = sprintf("SELECT 
				code AS naspunkt_code,
				name,
				name||' '||socr AS full_name
			FROM kladr
			WHERE code LIKE '%s%s________'
				AND code &lt;&gt; '%s%s00000000'
				AND lower(name) LIKE lower('%s%%')
			ORDER BY name LIMIT %d",
			$region_code,
			$raion_code,
			$region_code,
			$raion_code,
			$pattern,
			Kladr_Controller::COMPLETE_RES_COUNT);
		$this->addNewModel($q);
	}			
	public function get_gorod_list($pm){
		$dbLink = $this->getDbLink();
		$pattern = $dbLink->escape_string($pm->getParamValue('pattern'));
		$region_code = substr($dbLink->escape_string($pm->getParamValue('region_code')),0,2);
		$raion_code_str = $dbLink->escape_string($pm->getParamValue('raion_code'));
		$raion_code = substr($raion_code_str,2,3);
		
		if (!strlen($raion_code) || $raion_code_str=='null'){
			$raion_code = '000';
		}
		
		$q = sprintf("SELECT 
				code AS gorod_code,
				name,
				name||' '||socr AS full_name
			FROM kladr
			WHERE code LIKE '%s%s___00000'
				AND code &lt;&gt; '%s%s00000000'
				AND code &lt;&gt; '%s00000000000'
				AND lower(name) LIKE lower('%s%%')
			ORDER BY name LIMIT %d",
			$region_code,
			$raion_code,
			$region_code,
			$raion_code,
			$region_code,
			$pattern,
			Kladr_Controller::COMPLETE_RES_COUNT);
		$this->addNewModel($q);
	}				
	public function get_ulitsa_list($pm){
		$dbLink = $this->getDbLink();
		
		$params = new ParamsSQL($pm,$dbLink);
		$params->addAll();		
		
		$pattern = $params->getDbVal('pattern');
		
		if ($params->getVal('naspunkt_code') &amp;&amp; strtolower($params->getVal('naspunkt_code'))!='null'){
			$code = "'".substr($params->getVal('naspunkt_code'),0,11)."'";
		}
		else if ($params->getVal('gorod_code') &amp;&amp; strtolower($params->getVal('gorod_code'))!='null'){
			$code = "'".substr($params->getVal('gorod_code'),0,11)."'";
		}
		else if ($params->getVal('raion_code') &amp;&amp; strtolower($params->getVal('raion_code'))!='null'){
			$code = "'".substr($params->getVal('raion_code'),0,11)."'";
		}
		else{
			$code = "'".substr($params->getVal('region_code'),0,11)."'";
		}		
		
		$q = sprintf("SELECT 
				code AS ulitsa_code,
				name,
				name||' '||socr AS full_name
			FROM street
			WHERE
				code_part = %s
				AND lower(name) LIKE lower(%s)||'%%'
			ORDER BY name LIMIT %d",
			$code,
			$pattern,
			Kladr_Controller::COMPLETE_RES_COUNT);
		//throw new Exception($q);
		$this->addNewModel($q);
	}
	
	public function get_from_naspunkt($pm){
		$dbLink = $this->getDbLink();
		
		$params = new ParamsSQL($pm,$dbLink);
		$params->addAll();		
		
		$pattern = $params->getDbVal('pattern');
		$count = $params->getDbVal('count');
		if (!$count){
			$count = Kladr_Controller::COMPLETE_RES_COUNT;
		}
		$from = $params->getDbVal('from');
		if (!$from){
			$from = 0;
		}

		/*
		$pattern = $dbLink->escape_string($pm->getParamValue('pattern'));
		
		if ($_REQUEST['count']){
			$count = intval($_REQUEST['count']); 
		}
		else{
			$count = Kladr_Controller::COMPLETE_RES_COUNT;
		}
		
		if ($_REQUEST['from']){
			$from = intval($_REQUEST['from']); 
		}
		else{
			$from = 0;
		}
		*/
		
		$q = sprintf("SELECT * FROM kladr_naspunkt WHERE lower(name) LIKE lower(%s)||'%%' OFFSET %d LIMIT %d",
			$pattern,
			$from,$count);
		//throw new ($q);
		$this->addNewModel($q);
	}	
					
	public function query_first($q,&amp;$res){
		$res = $this->getDbLink()->query_first($q);
	}
}
<![CDATA[?>]]>
</xsl:template>

</xsl:stylesheet>
