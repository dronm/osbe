<?php
require_once(FRAME_WORK_PATH.'basic_classes/FieldSQLString.php');
require_once(FRAME_WORK_PATH.'Constants.php');

class FieldSQLTime extends FieldSQLString{
	public function __construct($dbLink,$dbName, $tableName,$id, $options=FALSE) {
		if(!$options){
			$options = array();
		}
		$options['dataType'] = DT_TIME;
	
		parent::__construct($dbLink,$dbName, $tableName,$id, $options);
	}
	/*
	public function formatVal($val){
		if ($val=='null'){
			$val = '00:00';
		}
		$formated = null;
		self::formatForDb($val,$formated);
		return $formated;		
	}
	public function getValueForDb(){
		$val = parent::getValueForDb();
		return $this->formatVal($val);
	}

	public static function formatForDb($valIn,&$valOut){
		$valOut = "'".$valIn."'";
	}
	*/
}
?>
