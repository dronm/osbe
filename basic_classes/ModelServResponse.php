<?php
require_once(FRAME_WORK_PATH.'basic_classes/Model.php');
require_once(FRAME_WORK_PATH.'basic_classes/Field.php');

class ModelServResponse extends Model {
	public function __construct($options=NULL){
		$options['sysModel'] = TRUE;
		parent::__construct($options);		
		$this->addField(new Field('result',DT_INT));
		$this->addField(new Field('descr',DT_STRING));
		$this->addField(new Field('app_version',DT_STRING));
		$this->insert();
		$this->result = 0;
		$this->descr = '';
		if (defined('VERSION')){
			$this->app_version = VERSION;
		}
	}
	public function metaDataToXML(){
		return "";
	}
}
?>
