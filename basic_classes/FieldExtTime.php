<?php
require_once(FRAME_WORK_PATH.'basic_classes/FieldExt.php');
require_once(FRAME_WORK_PATH.'Constants.php');
require_once(FRAME_WORK_PATH.'basic_classes/ValidatorTime.php');

class FieldExtTime extends FieldExt {
	public function __construct($id,$options=FALSE) {
	
		parent::__construct($id,DT_TIME, $options);
		$this->setValidator(new ValidatorTime());
		
	}
}
?>
