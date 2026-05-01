<?xml version="1.0" encoding="UTF-8"?>

<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:output method="text" indent="yes"
			doctype-public="-//W3C//DTD XHTML 1.0 Strict//EN" 
			doctype-system="http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"/>

<xsl:template match="/"><xsl:apply-templates select="metadata/enums"/>
</xsl:template>

<xsl:template match="enums"><![CDATA[]]>/**
 * 
 * This file is created automaticaly during build process
 * DO NOT MODIFY IT!!!
 *
 * @author Andrey Mikhalevich &lt;katrenplus@mail.ru>, 2018
 */
 App.prototype.m_enums = {
 	<xsl:apply-templates/>
 };
<![CDATA[]]>
</xsl:template>


<xsl:template match="enum">
	<xsl:if test="preceding-sibling::*">,</xsl:if>"<xsl:value-of select="@id"/>":{<xsl:apply-templates select="value/*"/>}
</xsl:template>

<xsl:template match="value/*">
	<xsl:if test="position() &gt;1">,</xsl:if>"<xsl:value-of select="concat(local-name(),'_',../@id)"/>":"<xsl:value-of select="@descr"/>"
</xsl:template>

</xsl:stylesheet>
