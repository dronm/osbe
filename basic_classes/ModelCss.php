<?php
require_once(FRAME_WORK_PATH.'basic_classes/Model.php');
require_once(FRAME_WORK_PATH.'basic_classes/Field.php');

class ModelCss extends Model {
	public function __construct($href, $modofied){
		parent::__construct(array('sysModel'=>TRUE));
		$this->addField(new Field('href',DT_STRING));
		$this->addField(new Field('modified',DT_DATETIME));
		$this->insert();
		$this->href = $href;
		$this->modified = $modified;
	}
}
?>
