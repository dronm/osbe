<?php
//require_once(FRAME_WORK_PATH.'basic_classes/ModelSQL.php');
//require_once(FRAME_WORK_PATH.'basic_classes/ModelWhereSQL.php');
//require_once(FRAME_WORK_PATH.'basic_classes/ModelVars.php');

class ModelSQLDOCT20 extends ModelSQL{	
	public function __construct($dbLink,$options=NULL){
		parent::__construct($dbLink,$options);
	}

	public function correct_keys(){
		$this->getFieldById('login_id')->setValue($_SESSION['LOGIN_ID']);
	}
	
	public function insert($needId=FALSE, $row=NULL){
		$this->correct_keys();
		return parent::insert($needId, $row);
	}
			
	public function update(){
		$this->correct_keys();
		parent::update();
	}				
}
