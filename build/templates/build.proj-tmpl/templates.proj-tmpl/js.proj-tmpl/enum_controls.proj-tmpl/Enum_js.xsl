<?xml version="1.0" encoding="UTF-8"?>

<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:output method="text" indent="yes"
			doctype-public="-//W3C//DTD XHTML 1.0 Strict//EN" 
			doctype-system="http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"/>

<xsl:template match="enums/enum"><![CDATA[]]>/**	
 * @author Andrey Mikhalevich &lt;katrenplus@mail.ru>, 2017
 * @class
 * @classdesc Enumerator class. Created from template build/templates/js/Enum_js.xsl. !!!DO NOT MODIFY!!!
 
 * @extends EditSelect
 
 * @requires core/extend.js
 * @requires controls/EditSelect.js
 
 * @param string id 
 * @param {object} options
 */
<xsl:variable name="enum_id" select="concat('Enum_',@id)"/>
function <xsl:value-of select="$enum_id"/>(id,options){
	options = options || {};
	options.addNotSelected = (options.addNotSelected!=undefined)? options.addNotSelected:true;
	options.options = [<xsl:apply-templates select="value"/>];
	
	<xsl:value-of select="$enum_id"/>.superclass.constructor.call(this,id,options);
	
}
extend(<xsl:value-of select="$enum_id"/>,EditSelect);

<xsl:value-of select="$enum_id"/>.prototype.multyLangValues = {<xsl:apply-templates select="value/*"/>};

<![CDATA[]]>
</xsl:template>

<xsl:template match="enums/enum/value">
<xsl:if test="position() &gt; 1">,</xsl:if>{"value":"<xsl:value-of select='@id'/>",
"descr":this.multyLangValues[window.getApp().getLocale()+"_"+"<xsl:value-of select='@id'/>"],
checked:(options.defaultValue&amp;&amp;options.defaultValue=="<xsl:value-of select='@id'/>")}
</xsl:template>

<xsl:template match="enums/enum/value/*">
<xsl:if test="position() &gt; 1">,</xsl:if>"<xsl:value-of select='concat(local-name(),"_",../@id)'/>":"<xsl:value-of select='@descr'/>"
</xsl:template>

</xsl:stylesheet>
