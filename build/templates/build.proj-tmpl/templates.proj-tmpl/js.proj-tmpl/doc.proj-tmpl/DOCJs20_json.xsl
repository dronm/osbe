<?xml version="1.0" encoding="UTF-8"?>

<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:output method="text" indent="yes"
			doctype-public="-//W3C//DTD XHTML 1.0 Strict//EN" 
			doctype-system="http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"/>

<xsl:template match="metadata">	
{
    "tags": {
        "allowUnknownTags": true,
        "dictionaries": ["jsdoc","closure"]
    },
    "source": {
      	"include": [
      	<xsl:apply-templates select="jsScripts/jsScript"/>
      	],
        "includePattern": ".+\\.js(doc|x)?$",
        "excludePattern": "(^|\\/|\\\\)_"
    },
    "plugins": [],
    "templates": {
        "cleverLinks": false,
        "monospaceLinks": false
    }
}
</xsl:template>

<xsl:template match="jsScript[not(@compressed='TRUE') and not(@jsDoc='FALSE') and not(@standalone='TRUE')]">
		"js20/<xsl:value-of select="@file"/>"<xsl:if test="following-sibling::jsScript[not(@compressed='TRUE') and not(@jsDoc='FALSE') and not(@standalone='TRUE')]">,</xsl:if>
</xsl:template>

</xsl:stylesheet>
