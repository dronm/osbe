<?xml version="1.0" encoding="UTF-8"?>

<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:import href="Controller_php.xsl"/>

<!-- -->
<xsl:variable name="CONTROLLER_ID" select="'Constant'"/>
<!-- -->

<xsl:output method="text" indent="yes"
			doctype-public="-//W3C//DTD XHTML 1.0 Strict//EN" 
			doctype-system="http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"/>
			
<xsl:template match="/">
	<xsl:apply-templates select="metadata/controllers/controller[@id=$CONTROLLER_ID]"/>
</xsl:template>

<xsl:template match="controller"><![CDATA[<?php]]>
<xsl:call-template name="add_requirements"/>
require_once(FRAME_WORK_PATH.'basic_classes/ModelSQL.php');
require_once(FRAME_WORK_PATH.'basic_classes/FieldSQL.php');

require_once(FRAME_WORK_PATH.'basic_classes/ParamsSQL.php');

class <xsl:value-of select="@id"/>_Controller extends ControllerSQL{
	public function __construct($dbLinkMaster=NULL,$dbLink=NULL){
		parent::__construct($dbLinkMaster,$dbLink);<xsl:apply-templates/>
	}
	
	/**
	 * @param {array} $idList
	 * @returns {ModelSQL}
	 */
	public function getConstantValueModel(&amp;$idList){
		$link = $this->getDbLink();
		$model = new ModelSQL($link,array('id'=>'ConstantValueList_Model','sysModel'=>TRUE));
		$model->addField(new FieldSQL($link,null,null,'id',DT_STRING));
		$model->addField(new FieldSQL($link,null,null,'val',DT_STRING));		

		$q = '';
		foreach($idList as $id) {
			$q.= ($q!='')? ' UNION ALL ':'';
			$q.= sprintf("SELECT
				'%s' AS id,
				const_%s_val()::text AS val,
				(SELECT c.val_type FROM const_%s c) AS val_type", $id,$id,$id);
		}
		
		$model->setSelectQueryText($q);
		$model->select(false,null,null,
			null,null,null,null,null,TRUE);
			
		return $model;
		//
	}
	
	public function get_values($pm){
		$p = new ParamsSQL($pm,$this->getDbLink());
		$p->addAll();
	
		$id_list = $p->getVal('id_list');
		$field_sep = $p->getVal('field_sep');
		$field_sep = (isset($field_sep))? $field_sep:',';
		if (isset($id_list)){
			$ar = explode($field_sep,$id_list);
			$model = $this->getConstantValueModel($ar);
			$this->addModel($model);
		}
	}
	
	public function set_value($pm){
		$p = new ParamsSQL($pm,$this->getDbLink());
		$p->addAll();
	
		$link = $this->getDbLinkMaster();
		$link->query(sprintf(
		"SELECT const_%s_set_val(%s)",
		$p->getVal('id'),$p->getDbVal('val')));
	}
}
<![CDATA[?>]]>
</xsl:template>

</xsl:stylesheet>
