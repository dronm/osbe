<?xml version="1.0" encoding="UTF-8"?>

<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:import href="Controller_php.xsl"/>

<!-- -->
<xsl:variable name="CONTROLLER_ID" select="'SessionVar'"/>
<!-- -->

<xsl:output method="text" indent="yes"
			doctype-public="-//W3C//DTD XHTML 1.0 Strict//EN" 
			doctype-system="http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"/>
			
<xsl:template match="/">
	<xsl:apply-templates select="metadata/controllers/controller[@id=$CONTROLLER_ID]"/>
</xsl:template>

<xsl:template match="controller"><![CDATA[<?php]]>

<xsl:call-template name="add_requirements"/>

require_once(FRAME_WORK_PATH.'basic_classes/SessionVarManager.php');
require_once(FRAME_WORK_PATH.'basic_classes/ModelVars.php');

class <xsl:value-of select="@id"/>_Controller extends ControllerSQL{
	public function __construct($dbLinkMaster=NULL,$dbLink=NULL){
		parent::__construct($dbLinkMaster,$dbLink);<xsl:apply-templates/>
	}	
	<xsl:call-template name="extra_methods"/>	
}
<![CDATA[?>]]>
</xsl:template>

<xsl:template name="extra_methods">
	/**
	 * getting value for client
	 */
	public function get_values($pm){
	
		$id_list = $this->getExtVal($pm,'id_list');
		$field_sep = $this->getExtVal($pm,'field_sep');
		
		$model = new Model(
			array('name'=>'SessionVarList_Model',
				'id'=>'SessionVarList_Model'
			)
		);
		$model->addField(new Field('id',DT_STRING));
		$model->addField(new Field('val',DT_STRING));
		
		if (isset($id_list)){
		
			if(!isset($field_sep)){
				$field_sep = ',';
			}
		
			$ar = explode($field_sep,$id_list);
			
			foreach($ar as $id) {
				$val = SessionVarManager::getValue($id,TRUE);
				if(is_object($val)){
					$val_str = json_encode($val);
				}
				else{
					$val_str = $val;
				}
				
				//add to return model
				$model->insert(array(
					new Field('id',DT_STRING,array('value'=>$id))
					,new Field('val',DT_STRING,array('value'=>$val_str))	
				));
			}
		}
		
		$this->addModel($model);		
	}
	
	/**
	 * setting value from client
	 */
	public function set_value($pm){
		$id = $this->getExtVal($pm,'id');
		$val_str = $this->getExtVal($pm,'val');
		$n = strlen($val_str);
		if($n &amp;&amp; substr($val_str,0,1)=='{' &amp;&amp; substr($val_str,$n-1,1)=='}'){
			//object
			$val = json_decode($val_str);
		}
		else if($n){
			$val = $val_str;
		}
		SessionVarManager::setValue($id,$val,FALSE);
	}
	
</xsl:template>

</xsl:stylesheet>
