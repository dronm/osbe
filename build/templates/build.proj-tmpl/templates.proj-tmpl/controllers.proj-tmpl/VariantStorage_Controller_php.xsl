<?xml version="1.0" encoding="UTF-8"?>

<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:import href="Controller_php.xsl"/>

<!-- -->
<xsl:variable name="CONTROLLER_ID" select="'VariantStorage'"/>
<!-- -->

<xsl:output method="text" indent="yes"
			doctype-public="-//W3C//DTD XHTML 1.0 Strict//EN" 
			doctype-system="http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"/>
			
<xsl:template match="/">
	<xsl:apply-templates select="metadata/controllers/controller[@id=$CONTROLLER_ID]"/>
</xsl:template>

<xsl:template match="controller"><![CDATA[<?php]]>
<xsl:call-template name="add_requirements"/>

require_once(FRAME_WORK_PATH.'basic_classes/ParamsSQL.php');
require_once(FRAME_WORK_PATH.'basic_classes/VariantStorage.php');

require_once(FRAME_WORK_PATH.'basic_classes/SessionVarManager.php');

class <xsl:value-of select="@id"/>_Controller extends <xsl:value-of select="@parentId"/>{
	public function __construct($dbLinkMaster=NULL,$dbLink=NULL){
		parent::__construct($dbLinkMaster,$dbLink);<xsl:apply-templates/>
	}	
	<xsl:call-template name="extra_methods"/>
}
<![CDATA[?>]]>
</xsl:template>

<xsl:template name="extra_methods">

	private static function get_user_id(){
		return isset($_SESSION['user_id'])? $_SESSION['user_id'] : SessionVarManager::getValue('user_id');
	}
	
	public function insert($pm){		
		$pm->setParamValue("user_id",self:: get_user_id());
		parent::insert($pm);
	}

	public function delete($pm){
		$ar = $this->getDbLinkMaster()->query_first(sprintf(
			"SELECT storage_name
			FROM variant_storages
			WHERE id=%d AND user_id=%d"
			,$this->getExtDbVal($pm,'id')
			,self:: get_user_id()
		));
	
		$this->getDbLinkMaster()->query(sprintf(
			"DELETE FROM variant_storages
			WHERE id=%d AND user_id=%d"
			,$this->getExtDbVal($pm,'id')
			,self:: get_user_id()
		));
		
		if(count($ar) &amp;&amp; !is_null($ar['storage_name'])){
			VariantStorage::clear($ar['storage_name']);
		}
	}

	public function upsert($pm,$dataCol,$dataColVal){
	
		$this->getDbLinkMaster()->query(sprintf(
		"SELECT variant_storages_upsert_%s(%d,%s,%s,%s,%s)",
		$dataCol,
		self:: get_user_id(),
		$this->getExtDbVal($pm,'storage_name'),
		$this->getExtDbVal($pm,'variant_name'),
		$dataColVal,
		$this->getExtDbVal($pm,'default_variant')
		));
		
		VariantStorage::clear($this->getExtVal($pm,'storage_name'));
	}
	
	public function upsert_filter_data($pm){
		$this->upsert($pm, 'filter_data', $this->getExtDbVal($pm,'filter_data'));
	}

	public function upsert_col_visib_data($pm){
		$this->upsert($pm, 'col_visib_data', $this->getExtDbVal($pm,'col_visib_data'));
	}

	public function upsert_col_order_data($pm){
		$this->upsert($pm, 'col_visib_order', $this->getExtDbVal($pm,'col_visib_order'));
	}
	public function upsert_all_data($pm){
		$all_data = json_decode($this->getExtDbVal($pm,'all_data'));
		if ($all_data->filter_data){
			$this->upsert($pm, 'filter_data', json_encode($all_data->filter_data));
		}
		if ($all_data->col_visib_data){
			$this->upsert($pm, 'col_visib_data', json_encode($all_data->col_visib_data));
		}
		if ($all_data->col_order_data){
			$this->upsert($pm, 'col_order_data', json_encode($all_data->col_order_data));
		}
		
	}
	
	public function get_list($pm){
	
		$this->AddNewModel(sprintf(
			"SELECT *
			FROM variant_storages_list
			WHERE user_id=%d AND storage_name=%s",
			self:: get_user_id(),
			$this->getExtDbVal($pm,'storage_name')
			),
		"VariantStorageList_Model"
		);
	}	
	
	public function get_obj_col($pm,$dataCol){
	
		$this->AddNewModel(sprintf(
			"SELECT
				id,
				user_id,
				storage_name,
				variant_name,
				%s,
				default_variant
			FROM variant_storages
			WHERE user_id=%d AND storage_name=%s AND variant_name=%s",
			$dataCol,
			self::get_user_id(),
			$this->getExtDbVal($pm,'storage_name'),
			$this->getExtDbVal($pm,'variant_name')
			),
		"VariantStorage_Model"
		);
	}
	
	public function get_filter_data($pm){
		$this->get_obj_col($pm,'filter_data');
	}	
	public function get_col_visib_data($pm){
		$this->get_obj_col($pm,'col_visib_data');
	}	
	public function get_col_order_data($pm){
		$this->get_obj_col($pm,'col_order_data');
	}	
	public function get_all_data($pm){
		$this->get_obj_col($pm,'filter_data,col_visib_data,col_order_data');
	}	
	
	
</xsl:template>

</xsl:stylesheet>
