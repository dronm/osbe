<?php
require_once(FRAME_WORK_PATH.'basic_classes/ModelSQL.php');
require_once(FRAME_WORK_PATH.'basic_classes/VariantStorageBeton.php');

class ModelSQLBeton extends ModelSQL{

	public function addStoredFilter(&$modelWhere){	
		if (defined('PARAM_TEMPLATE') && isset($_REQUEST[PARAM_TEMPLATE])){
			$stvar = VariantStorageBeton::restore($_REQUEST[PARAM_TEMPLATE], $this->getDbLink());
			VariantStorageBeton::applyFilters($stvar,$this,$modelWhere,$_REQUEST[PARAM_TEMPLATE]);
			//throw new Exception("WHERE=".$modelWhere->getSQL());
		}	
	}

}
