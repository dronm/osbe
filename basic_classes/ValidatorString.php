<?php
require_once(FRAME_WORK_PATH.'basic_classes/Validator.php');

class ValidatorString extends Validator {
	public function validate($val){
		$l = strtolower($val);
		if (!$val || !strlen($val) || $l=='undefined' || $l=='null'){
			return 'NULL';
		}	
	
		/*
			check for SQL injection!!!
		*/
		$newVal = strval($val);
		if(PHP_VERSION_ID<=70400) {
			if(get_magic_quotes_gpc()){
				$newVal = stripslashes($newVal);
			}
		}
		
		return $newVal;
	}	
	
}

?>
