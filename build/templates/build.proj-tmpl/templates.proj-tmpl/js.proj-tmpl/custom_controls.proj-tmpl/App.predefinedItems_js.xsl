<?xml version="1.0" encoding="UTF-8"?>

<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:output method="text" indent="yes"
			doctype-public="-//W3C//DTD XHTML 1.0 Strict//EN" 
			doctype-system="http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"/>

<xsl:template match="/"><xsl:apply-templates select="metadata/enums"/>
</xsl:template>

<xsl:template match="/"><![CDATA[]]>/**
 * 
 * This file is created automaticaly during build process
 * DO NOT MODIFY IT!!!
 *
 * @author Andrey Mikhalevich &lt;katrenplus@mail.ru>, 2018
 */
App.prototype.m_predefinedItems = {
 	<xsl:apply-templates select="metadata/models/model/predefinedItems"/>
 };
<![CDATA[]]>
</xsl:template>


<xsl:template match="predefinedItems">
	<xsl:if test="position() &gt;1">,</xsl:if>"<xsl:value-of select="../@dataTable"/>":{<xsl:apply-templates select="predefinedItem"/>}
</xsl:template>

<xsl:template match="predefinedItem">
	<xsl:variable name="key_id" select="../../field[@primaryKey='TRUE'][1]/@id"/>
	<xsl:variable name="descr_val">
		<xsl:choose>
		<xsl:when test="../../field[@display='TRUE']"><xsl:value-of select="../../field[@display='TRUE']/@id"/></xsl:when>
		<xsl:otherwise><xsl:value-of select="../../field[@dataType='String' or @dataType='Text'][1]/@id"/></xsl:otherwise>
		</xsl:choose>
	</xsl:variable>
	<xsl:if test="position() &gt;1">,</xsl:if>"<xsl:value-of select="@alias"/>":new RefType({"dataType":"<xsl:value-of select="../../@dataTable"/>","descr":"<xsl:value-of select="./*[local-name()=$descr_val]/node()"/>","keys":{"<xsl:value-of select="$key_id"/>":<xsl:value-of select="./*[local-name()=$key_id]/node()"/>}})
</xsl:template>

</xsl:stylesheet>
