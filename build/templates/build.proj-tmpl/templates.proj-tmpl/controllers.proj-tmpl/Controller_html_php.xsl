<?xml version="1.0" encoding="UTF-8"?>

<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:output method="text" indent="yes"
			doctype-public="-//W3C//DTD XHTML 1.0 Strict//EN" 
			doctype-system="http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"/>

<xsl:template match="controller"><![CDATA[<?php]]>
require_once('<xsl:value-of select="@id"/>_Controller.php');
class <xsl:value-of select="@id"/>_Controller_html extends <xsl:value-of select="@id"/>_Controller{
	public function __construct($dbLinkMaster=NULL,$dbLink=NULL){
		parent::__construct($dbLinkMaster,$dbLink);		
		$this->setStatelessClient(TRUE);

	}
}
<![CDATA[?>]]>
</xsl:template>

</xsl:stylesheet>
