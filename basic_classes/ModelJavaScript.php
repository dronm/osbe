<?php
require_once(FRAME_WORK_PATH.'basic_classes/Model.php');
require_once(FRAME_WORK_PATH.'basic_classes/Field.php');

class ModelJavaScript extends Model {
	public function __construct($href, $tp='', $modified=NULL){
		parent::__construct(array('sysModel'=>TRUE));
		$this->addField(new Field('href',DT_STRING));
		
		$tp_exists = ($tp && strlen($tp));
		if($tp_exists){
			$this->addField(new Field('type',DT_STRING));
		}
		$this->addField(new Field('modified',DT_DATETIME));
		
		$this->insert();
		$this->href = $href;
		$this->modified = $modified;
		if($tp_exists){
			$this->type = $tp;
		}
	}
}
?>
