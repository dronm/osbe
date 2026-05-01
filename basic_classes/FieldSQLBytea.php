<?php
require_once(FRAME_WORK_PATH.'basic_classes/FieldSQL.php');
require_once(FRAME_WORK_PATH.'Constants.php');

class FieldSQLBytea extends FieldSQL{
	/*
	private function correctForDb($val){
		return "'".$this->getDbLink()->escape_string($val)."'";
	}
	*/
	public function __construct($dbLink,$dbName, $tableName,
					$id, $options=false) {
		parent::__construct($dbLink,$dbName, $tableName,
				$id, DT_BYTEA,$options);
	}	
    	public function formatVal($val){
		$formatted = null;
		FieldSQLBytea::formatForDb($this->getDbLink(),$val,$formatted);
		return $formatted;
	    }
	
	public function getValueForDb(){		
		return $this->formatVal($this->getValue());
	}
	    
	public function getOldValueForDb(){		
		return $this->formatVal($this->getOldValue());
	}
	
	public static function formatForDb($dbLink,$valIn,&$valOut){
		$valOut = (!isset($valIn) || !strlen($valIn) || $valIn=='null')? 'null':"'".pg_escape_bytea($valIn)."'";				
		//$valOut = (!isset($valIn) || !strlen($valIn) || strtolower($valIn)=='null')? 'NULL':"E'\\\\x".bin2hex($valIn)."'";
		//throw new Exception($valOut);
	}	
	
}
?>
