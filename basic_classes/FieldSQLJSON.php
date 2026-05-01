<?php
require_once(FRAME_WORK_PATH.'basic_classes/FieldSQLString.php');
require_once(FRAME_WORK_PATH.'Constants.php');

class FieldSQLJSON extends FieldSQLString{
	/*
	private function correctForDb($val){
		return "'".$this->getDbLink()->escape_string($val)."'";
	}
	*/
	public function __construct($dbLink,$dbName, $tableName,$id, $options=FALSE) {
		if(!$options){
			$options = array();
		}
		$options['dataType'] = DT_JSON;
		
		parent::__construct($dbLink,$dbName, $tableName,$id,$options);
	}		
}
?>
