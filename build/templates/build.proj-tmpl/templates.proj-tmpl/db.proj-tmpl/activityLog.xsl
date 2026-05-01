<?xml version="1.0" encoding="UTF-8"?>

<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:output method="text" indent="yes"
			doctype-public="-//W3C//DTD XHTML 1.0 Strict//EN" 
			doctype-system="http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"/>

<xsl:template match="/">	
IF current_setting('app.logging')='ON' THEN
	INSERT INTO activity_log
	(date_time, user_id, action, entity, obj_ref)
	VALUES <xsl:apply-templates select="metadata/models"/>
	;			
END IF;	
</xsl:template>

<xsl:template match="model[@virtual='FALSE' and @activityLog='TRUE']">
	<xsl:if test="position()>0">,</xsl:if>(now(),current_setting('app.user_id'),TG_OP,'<xsl:value-of select="dataTable"/>',<xsl:value-of select="dataTable"/>_ref(in_row))
</xsl:template>

</xsl:stylesheet>
