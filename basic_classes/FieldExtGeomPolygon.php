<?php
require_once(FRAME_WORK_PATH.'basic_classes/FieldExt.php');
require_once(FRAME_WORK_PATH.'Constants.php');
require_once(FRAME_WORK_PATH.'basic_classes/Validator.php');

class FieldExtGeomPolygon extends FieldExt {
	public function __construct($id,$options=false) {
		parent::__construct($id,DT_DATE, $options);
		$this->setValidator(new Validator());
	}
}
?>