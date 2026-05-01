<?php
require_once(FRAME_WORK_PATH.'basic_classes/FieldSQL.php');
require_once(FRAME_WORK_PATH.'Constants.php');

class FieldSQLInt extends FieldSQL{
	public function __construct($dbLink,$dbName, $tableName,
					$id, $options=false) {
		parent::__construct($dbLink,$dbName, $tableName,
				$id, DT_INT,$options);
	}
    public static function formatForDb($valIn,&$valOut){
		//$valOut = $valIn;
		$valOut = (!isset($valIn) || !strlen($valIn) || strtolower($valIn)=='null' || strtolower($valIn)=='nan' || strtolower($valIn)=='undefined')? 'null' : intval($valIn);
    }	
	
}
?>
