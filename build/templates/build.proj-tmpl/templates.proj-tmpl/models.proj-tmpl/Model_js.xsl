<?xml version="1.0" encoding="UTF-8"?>

<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:output method="text" indent="yes"
			doctype-public="-//W3C//DTD XHTML 1.0 Strict//EN" 
			doctype-system="http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"/>

<xsl:template match="model"><![CDATA[]]>
<xsl:variable name="parent_class">	
<xsl:choose>
<xsl:when test="@parentJS"><xsl:value-of select="@parentJS"/></xsl:when>
<xsl:otherwise>ModelXML</xsl:otherwise>
</xsl:choose>
</xsl:variable>/**	
 *
 * THIS FILE IS GENERATED FROM TEMPLATE build/templates/models/Model_js.xsl
 * ALL DIRECT MODIFICATIONS WILL BE LOST WITH THE NEXT BUILD PROCESS!!!
 *
 * @author Andrey Mikhalevich &lt;katrenplus@mail.ru>, 2017
 * @class
 * @classdesc Model class. Created from template build/templates/models/Model_js.xsl. !!!DO NOT MODEFY!!!
 
 * @extends <xsl:value-of select="$parent_class"/>
 
 * @requires core/extend.js
 * @requires core/<xsl:value-of select="$parent_class"/>.js
 
 * @param {string} id 
 * @param {Object} options
 */
<xsl:variable name="model_id" select="concat(@id,'_Model')"/>
function <xsl:value-of select="$model_id"/>(options){
	var id = '<xsl:value-of select="$model_id"/>';
	options = options || {};
	
	options.fields = {};
	<xsl:if test="@baseModelId">
		<xsl:variable name="base_model_id" select="@baseModelId"/>
		<xsl:apply-templates select="/metadata/models/model[@id=$base_model_id]/field"/>		
	</xsl:if>	
	<xsl:apply-templates/>
	<xsl:if test="@calcHash='TRUE'">
	options.calcHash = true;
	</xsl:if>		
	<xsl:value-of select="$model_id"/>.superclass.constructor.call(this,id,options);
}
extend(<xsl:value-of select="$model_id"/>,<xsl:value-of select="$parent_class"/>);
<![CDATA[]]>
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
	<xsl:variable name="fixLength">
	<xsl:choose>
	<xsl:when test="../@virtual='TRUE' and $baseModelId and not(@fixLength)"><xsl:value-of select="$baseField/@fixLength"/></xsl:when>
	<xsl:when test="@fixLength"><xsl:value-of select="@fixLength"/></xsl:when>
	<xsl:otherwise></xsl:otherwise>
	</xsl:choose>
	</xsl:variable>	
	<xsl:variable name="maxLength">
	<xsl:choose>
	<xsl:when test="../@virtual='TRUE' and $baseModelId and not(@maxLength)"><xsl:value-of select="$baseField/@maxLength"/></xsl:when>
	<xsl:when test="@maxLength"><xsl:value-of select="@maxLength"/></xsl:when>
	<xsl:otherwise></xsl:otherwise>
	</xsl:choose>
	</xsl:variable>	
	
	<xsl:variable name="field" select="concat('options.fields.',@id)"/>	
	
	var filed_options = {};
	filed_options.primaryKey = <xsl:choose><xsl:when test="$primaryKey='TRUE'">true</xsl:when><xsl:otherwise>false</xsl:otherwise></xsl:choose>;	
	<xsl:if test="not($defaultValue='')">filed_options.defValue = <xsl:call-template name="boolToScript"><xsl:with-param name="text" select="$defaultValue"/></xsl:call-template>;
	</xsl:if>	
	<xsl:if test="not($alias='')">filed_options.alias = '<xsl:value-of select="$alias"/>';</xsl:if>
	filed_options.autoInc = <xsl:choose><xsl:when test="$autoInc='TRUE'">true</xsl:when><xsl:otherwise>false</xsl:otherwise></xsl:choose>;	
	
	<xsl:choose>
	<xsl:when test="$dataType='Enum'">
	<xsl:variable name="enum_id" select="@enumId"/>
	<xsl:value-of select="$field"/> = new FieldEnum("<xsl:value-of select="@id"/>",filed_options);
	filed_options.enumValues = '<xsl:for-each select="/metadata/enums/enum[@id=$enum_id]/value"><xsl:if test="position() &gt; 1">,</xsl:if><xsl:value-of select="@id"/></xsl:for-each>';
	</xsl:when>	
	<xsl:otherwise>
	<xsl:value-of select="$field"/> = new Field<xsl:value-of select="$dataType"/>("<xsl:value-of select="@id"/>",filed_options);
	</xsl:otherwise>
	</xsl:choose>

	<xsl:if test="$required='TRUE'">
		<xsl:value-of select="$field"/>.getValidator().setRequired(true);
	</xsl:if>
	<xsl:if test="not($length='')">
		<xsl:value-of select="$field"/>.getValidator().setMaxLength('<xsl:value-of select="$length"/>');
	</xsl:if>
	<xsl:if test="not($minLength='')">
		<xsl:value-of select="$field"/>.getValidator().setMinLength('<xsl:value-of select="$minLength"/>');
	</xsl:if>
	<xsl:if test="not($fixLength='')">
		<xsl:value-of select="$field"/>.getValidator().setFixLength('<xsl:value-of select="$fixLength"/>');
	</xsl:if>
	</xsl:if>
</xsl:template>

<xsl:template match="model/index">
</xsl:template>

<xsl:template match="model/predefinedItems">
</xsl:template>

<xsl:template match="descr">
	/*
	<xsl:value-of select="node()"/>
	*/
</xsl:template>

<xsl:template name="boolToScript">
	<xsl:param name="val"/>
	<xsl:choose>
		<xsl:when test="$val='FALSE'">
			<xsl:text>false</xsl:text>
		</xsl:when>
		<xsl:otherwise>
			<xsl:text>true</xsl:text>
		</xsl:otherwise>		
	</xsl:choose>
</xsl:template>

</xsl:stylesheet>
