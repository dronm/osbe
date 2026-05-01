<?xml version="1.0" encoding="UTF-8"?>

<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:output method="text" indent="yes"
			doctype-public="-//W3C//DTD XHTML 1.0 Strict//EN" 
			doctype-system="http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"/>
			
<xsl:template match="model"><![CDATA[<?php]]>
/**
 *
 * THIS FILE IS GENERATED FROM TEMPLATE build/templates/models/Model_php.xsl
 * ALL DIRECT MODIFICATIONS WILL BE LOST WITH THE NEXT BUILD PROCESS!!!
 *
 */
<xsl:call-template name="add_requirements"/> 
class <xsl:value-of select="@id"/>_Model extends <xsl:value-of select="@parent"/>{
	<xsl:call-template name="add_constructor"/>
	<xsl:call-template name="user_functions"/>
}
<![CDATA[?>]]>
</xsl:template>

<xsl:template match="model/field">
	<xsl:variable name="baseModelId" select="../@baseModelId"/>
	<xsl:variable name="fieldId" select="@id"/>
	<xsl:variable name="baseField" select="/metadata/models/model[@id=$baseModelId]/field[@id=$fieldId]"/>
	<xsl:if test="not($baseModelId) or not($baseField)">
	<xsl:variable name="dataType">
	<xsl:choose>
	<xsl:when test="../@virtual='TRUE' and $baseModelId and not(@dataType)"><xsl:value-of select="$baseField/@dataType"/></xsl:when>
	<xsl:when test="@dataType"><xsl:value-of select="@dataType"/></xsl:when>
	<xsl:otherwise><xsl:value-of select="'String'"/></xsl:otherwise>
	</xsl:choose>
	</xsl:variable>
	<xsl:variable name="required">
	<xsl:choose>
	<xsl:when test="../@virtual='TRUE' and $baseModelId and not(@required)"><xsl:value-of select="$baseField/@required"/></xsl:when>
	<xsl:when test="@required"><xsl:value-of select="@required"/></xsl:when>
	<xsl:otherwise></xsl:otherwise>
	</xsl:choose>
	</xsl:variable>
	<xsl:variable name="primaryKey">
	<xsl:choose>
	<xsl:when test="../@virtual='TRUE' and $baseModelId and not(@primaryKey)"><xsl:value-of select="$baseField/@primaryKey"/></xsl:when>
	<xsl:when test="@primaryKey"><xsl:value-of select="@primaryKey"/></xsl:when>
	<xsl:otherwise></xsl:otherwise>
	</xsl:choose>
	</xsl:variable>
	<xsl:variable name="autoInc">
	<xsl:choose>
	<xsl:when test="../@virtual='TRUE' and $baseModelId and not(@autoInc)"><xsl:value-of select="$baseField/@autoInc"/></xsl:when>
	<xsl:when test="@autoInc"><xsl:value-of select="@autoInc"/></xsl:when>
	<xsl:otherwise></xsl:otherwise>
	</xsl:choose>
	</xsl:variable>
	<xsl:variable name="alias">
	<xsl:choose>
	<xsl:when test="../@virtual='TRUE' and $baseModelId and not(@alias)"><xsl:value-of select="$baseField/@alias"/></xsl:when>
	<xsl:when test="@alias"><xsl:value-of select="@alias"/></xsl:when>
	<xsl:otherwise></xsl:otherwise>
	</xsl:choose>
	</xsl:variable>
	<xsl:variable name="length">
	<xsl:choose>
	<xsl:when test="../@virtual='TRUE' and $baseModelId and not(@length)"><xsl:value-of select="$baseField/@length"/></xsl:when>
	<xsl:when test="@length"><xsl:value-of select="@length"/></xsl:when>
	<xsl:otherwise></xsl:otherwise>
	</xsl:choose>
	</xsl:variable>
	<xsl:variable name="minLength">
	<xsl:choose>
	<xsl:when test="../@virtual='TRUE' and $baseModelId and not(@minLength)"><xsl:value-of select="$baseField/@minLength"/></xsl:when>
	<xsl:when test="@minLength"><xsl:value-of select="@minLength"/></xsl:when>
	<xsl:otherwise></xsl:otherwise>
	</xsl:choose>
	</xsl:variable>
	<xsl:variable name="defaultValue">
	<xsl:choose>
	<xsl:when test="../@virtual='TRUE' and $baseModelId and not(@defaultValue)"><xsl:value-of select="$baseField/@defaultValue"/></xsl:when>
	<xsl:when test="@defaultValue"><xsl:value-of select="@defaultValue"/></xsl:when>
	<xsl:otherwise></xsl:otherwise>
	</xsl:choose>
	</xsl:variable>		
	<xsl:variable name="sysCol">
	<xsl:choose>
	<xsl:when test="../@virtual='TRUE' and $baseModelId and not(@sysCol)"><xsl:value-of select="$baseField/@sysCol"/></xsl:when>
	<xsl:when test="@sysCol"><xsl:value-of select="@sysCol"/></xsl:when>
	<xsl:otherwise></xsl:otherwise>
	</xsl:choose>
	</xsl:variable>	
		//*** Field <xsl:value-of select="@id"/> ***
		$f_opts = array();
		<xsl:if test="not($primaryKey='')">$f_opts['primaryKey'] = <xsl:value-of select="$primaryKey"/>;
		</xsl:if>		
		<xsl:if test="not($autoInc='')">$f_opts['autoInc']=<xsl:value-of select="$autoInc"/>;
		</xsl:if>		
		<xsl:if test="not($alias='')">
		$f_opts['alias']='<xsl:value-of select="$alias"/>';
		</xsl:if>		
		<xsl:if test="not($length='')">$f_opts['length']=<xsl:value-of select="$length"/>;
		</xsl:if>
		<xsl:if test="not($minLength='')">$f_opts['minLength']=<xsl:value-of select="$minLength"/>;
		</xsl:if>
		<xsl:if test="not($defaultValue='')">$f_opts['defaultValue']='<xsl:value-of select="$defaultValue"/>';
		</xsl:if>
		<xsl:if test="$sysCol='TRUE'">$f_opts['sysCol']=TRUE;
		</xsl:if>		
		<xsl:if test="@id">$f_opts['id']="<xsl:value-of select="@id"/>";
		</xsl:if>
		<xsl:if test="@retAfterInsert">$f_opts['retAfterInsert']=<xsl:value-of select="@retAfterInsert"/>;
		</xsl:if>
		<xsl:if test="@noValueOnCopy='TRUE'">$f_opts['noValueOnCopy'] = TRUE;
		</xsl:if>				
		$f_<xsl:value-of select="@id"/>=new FieldSQL<xsl:value-of select="$dataType"/>($this->getDbLink(),$this->getDbName(),$this->getTableName(),"<xsl:value-of select="@id"/>",$f_opts);
		$this->addField($f_<xsl:value-of select="@id"/>);
		//********************
	</xsl:if>
</xsl:template>

<xsl:template match="defaultOrder">
		$order = new ModelOrderSQL();		
		$this->setDefaultModelOrder($order);		
		<xsl:apply-templates select="field"/>
</xsl:template>
<xsl:template match="defaultOrder/field">
<xsl:choose>
<xsl:when test="@sortDirect">$direct = '<xsl:value-of select="@sortDirect"/>';</xsl:when>
<xsl:otherwise>$direct = 'ASC';</xsl:otherwise>
</xsl:choose>
		$order->addField($f_<xsl:value-of select="@id"/>,$direct);
</xsl:template>

<xsl:template name="add_requirements">
<xsl:variable name="baseModelId" select="@baseModelId"/>
require_once(FRAME_WORK_PATH.'basic_classes/<xsl:value-of select="@parent"/>.php');
<xsl:if test="field[@dataType='Int'] or ($baseModelId and /metadata/models/model[@id=$baseModelId]/field[@dataType='Int'])">require_once(FRAME_WORK_PATH.'basic_classes/FieldSQLInt.php');
</xsl:if>
<xsl:if test="field[@dataType='String'] or ($baseModelId and /metadata/models/model[@id=$baseModelId]/field[@dataType='String'])">require_once(FRAME_WORK_PATH.'basic_classes/FieldSQLString.php');
</xsl:if>
<xsl:if test="field[@dataType='Text'] or ($baseModelId and /metadata/models/model[@id=$baseModelId]/field[@dataType='Text'])">require_once(FRAME_WORK_PATH.'basic_classes/FieldSQLText.php');
</xsl:if>
<xsl:if test="field[@dataType='Float'] or ($baseModelId and /metadata/models/model[@id=$baseModelId]/field[@dataType='Float'])">require_once(FRAME_WORK_PATH.'basic_classes/FieldSQLFloat.php');
</xsl:if>
<xsl:if test="field[@dataType='Enum'] or ($baseModelId and /metadata/models/model[@id=$baseModelId]/field[@dataType='Enum'])">require_once(FRAME_WORK_PATH.'basic_classes/FieldSQLEnum.php');
</xsl:if>
<xsl:if test="field[@dataType='DateTime'] or ($baseModelId and /metadata/models/model[@id=$baseModelId]/field[@dataType='DateTime'])">require_once(FRAME_WORK_PATH.'basic_classes/FieldSQLDateTime.php');
</xsl:if>
<xsl:if test="field[@dataType='Date'] or ($baseModelId and /metadata/models/model[@id=$baseModelId]/field[@dataType='Date'])">require_once(FRAME_WORK_PATH.'basic_classes/FieldSQLDate.php');
</xsl:if>
<xsl:if test="field[@dataType='Time'] or ($baseModelId and /metadata/models/model[@id=$baseModelId]/field[@dataType='Time'])">require_once(FRAME_WORK_PATH.'basic_classes/FieldSQLTime.php');
</xsl:if>
<xsl:if test="field[@dataType='Password'] or ($baseModelId and /metadata/models/model[@id=$baseModelId]/field[@dataType='Password'])">require_once(FRAME_WORK_PATH.'basic_classes/FieldSQLPassword.php');
</xsl:if>
<xsl:if test="field[@dataType='Char'] or ($baseModelId and /metadata/models/model[@id=$baseModelId]/field[@dataType='Char'])">require_once(FRAME_WORK_PATH.'basic_classes/FieldSQLChar.php');
</xsl:if>
<xsl:if test="field[@dataType='Bool'] or ($baseModelId and /metadata/models/model[@id=$baseModelId]/field[@dataType='Bool'])">require_once(FRAME_WORK_PATH.'basic_classes/FieldSQLBool.php');
</xsl:if>
<xsl:if test="field[@dataType='Interval'] or ($baseModelId and /metadata/models/model[@id=$baseModelId]/field[@dataType='Interval'])">require_once(FRAME_WORK_PATH.'basic_classes/FieldSQLInterval.php');
</xsl:if>
<xsl:if test="defaultOrder">require_once(FRAME_WORK_PATH.'basic_classes/ModelOrderSQL.php');
</xsl:if>
<xsl:if test="field[@dataType='DateTimeTZ'] or ($baseModelId and /metadata/models/model[@id=$baseModelId]/field[@dataType='DateTimeTZ'])">require_once(FRAME_WORK_PATH.'basic_classes/FieldSQLDateTimeTZ.php');
</xsl:if>
<xsl:if test="field[@dataType='JSON'] or ($baseModelId and /metadata/models/model[@id=$baseModelId]/field[@dataType='JSON'])">require_once(FRAME_WORK_PATH.'basic_classes/FieldSQLJSON.php');
</xsl:if>
<xsl:if test="field[@dataType='JSONB'] or ($baseModelId and /metadata/models/model[@id=$baseModelId]/field[@dataType='JSONB'])">require_once(FRAME_WORK_PATH.'basic_classes/FieldSQLJSONB.php');
</xsl:if>
<xsl:if test="field[@dataType='Array'] or ($baseModelId and /metadata/models/model[@id=$baseModelId]/field[@dataType='Array'])">require_once(FRAME_WORK_PATH.'basic_classes/FieldSQLArray.php');
</xsl:if>
<xsl:if test="field[@dataType='XML'] or ($baseModelId and /metadata/models/model[@id=$baseModelId]/field[@dataType='XML'])">require_once(FRAME_WORK_PATH.'basic_classes/FieldSQLXML.php');
</xsl:if>
<xsl:if test="field[@dataType='BigInt'] or ($baseModelId and /metadata/models/model[@id=$baseModelId]/field[@dataType='BigInt'])">require_once(FRAME_WORK_PATH.'basic_classes/FieldSQLBigInt.php');
</xsl:if>
<xsl:if test="field[@dataType='SmallInt'] or ($baseModelId and /metadata/models/model[@id=$baseModelId]/field[@dataType='SmallInt'])">require_once(FRAME_WORK_PATH.'basic_classes/FieldSQLSmallInt.php');
</xsl:if>
<xsl:if test="field[@dataType='Bytea'] or ($baseModelId and /metadata/models/model[@id=$baseModelId]/field[@dataType='Bytea'])">require_once(FRAME_WORK_PATH.'basic_classes/FieldSQLBytea.php');
</xsl:if>

</xsl:template>

<xsl:template name="add_constructor">
	public function __construct($dbLink){
		parent::__construct($dbLink);
		
		<xsl:variable name="db_schema">
		<xsl:choose>
			<xsl:when test="@dataSchema"><xsl:value-of select="@dataSchema"/></xsl:when>
			<xsl:when test="/metadata/@dataSchema"><xsl:value-of select="/metadata/@dataSchema"/></xsl:when>
			<xsl:otherwise></xsl:otherwise>
		</xsl:choose>
		</xsl:variable>
		$this->setDbName('<xsl:value-of select="$db_schema"/>');
		
		$this->setTableName("<xsl:value-of select="@dataTable"/>");
		<xsl:if test="@baseModelId">
		<xsl:variable name="base_model_id" select="@baseModelId"/>
		<xsl:apply-templates select="/metadata/models/model[@id=$base_model_id]/field"/>		
		</xsl:if>
		<xsl:apply-templates select="field"/>		
		<xsl:apply-templates select="defaultOrder"/>
		
		<xsl:choose>
		<xsl:when test="@limitCount">$this->setRowsPerPage(<xsl:value-of select="@limitCount"/>);</xsl:when>
		<xsl:when test="@limitConstant">$this->setLimitConstant('<xsl:value-of select="@limitConstant"/>');</xsl:when>		
		<xsl:when test="../@limitConstant">$this->setLimitConstant('<xsl:value-of select="../@limitConstant"/>');</xsl:when>		
		<xsl:otherwise></xsl:otherwise>
		</xsl:choose>
		<xsl:if test="@calcHash">
		$this->setCalcHash(<xsl:value-of select="@calcHash"/>);</xsl:if>		
		<xsl:if test="@lastRowSelectOnInit">
		$this->setLastRowSelectOnInit(<xsl:value-of select="@lastRowSelectOnInit"/>);</xsl:if>
		
		<xsl:apply-templates select="aggFunctions"/>
		
		<!--
		<xsl:if test="@modelType='DOC'">
		<xsl:variable name="model_id" select="@id"/>
		<xsl:for-each select="/metadata/models/model[@modelType='DOCT' and @masterModel=$model_id and @virtual='FALSE']">
		$this->addDocDetailTableName('<xsl:value-of select="@dataTable"/>');
		</xsl:for-each>
		</xsl:if>	
		-->
		<!--
		<xsl:choose>
		<xsl:when test="@virtual='TRUE' and not(./sqlModel)">
		$this->setSelectQueryText('SELECT * FROM <xsl:value-of select="@dataTable"/>');
		</xsl:when>
		<xsl:when test="./sqlModel">
		$this->setSelectQueryText('<xsl:value-of select="./sqlModel"/>');
		</xsl:when>
		<xsl:otherwise>
		</xsl:otherwise>
		</xsl:choose>		
		-->
	}
</xsl:template>

<xsl:template match="aggFunctions">
	$this->setAggFunctions(
		array(<xsl:apply-templates select="aggFunction"/>)
	);	
</xsl:template>

<xsl:template match="aggFunction">
	<xsl:if test="position() &gt;1">,</xsl:if>array('alias'=>'<xsl:value-of select="@alias"/>','expr'=>'<xsl:value-of select="@expr"/>')
</xsl:template>

<xsl:template name="user_functions">
</xsl:template>

</xsl:stylesheet>
