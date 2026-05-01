<?php
require_once(FRAME_WORK_PATH.'basic_classes/FieldSQLTime.php');
require_once(FRAME_WORK_PATH.'Constants.php');

class FieldSQLInterval extends FieldSQLTime{
	public function __construct($dbLink,$dbName, $tableName,$id, $options=FALSE) {
		if(!$options){
			$options = array();
		}
		$options['dataType'] = DT_INTERVAL;
		
		parent::__construct($dbLink,$dbName, $tableName,$id, $options);
	}
}
?>
