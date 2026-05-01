<?php
require_once(FRAME_WORK_PATH.'basic_classes/View.php');
require_once(FRAME_WORK_PATH.'basic_classes/ModelStyleSheet.php');
require_once(FRAME_WORK_PATH.'basic_classes/ModelJavaScript.php');
require_once(FRAME_WORK_PATH.'basic_classes/ModelVars.php');

class ViewHTML extends View{	
	private $varModel;
	private $cssModels=array();
	private $jsModels=array();
	
	public function __construct($id=NULL){
		parent::__construct($id);
		
		$this->varModel = new ModelVars(array('sysModel'=>TRUE));
		$this->varModel->addField(new Field('basePath',DT_STRING));
		$this->varModel->addField(new Field('scriptId',DT_STRING));
		$this->varModel->addField(new Field('title',DT_STRING));
		$this->varModel->addField(new Field('author',DT_STRING));
		$this->varModel->addField(new Field('keywords',DT_STRING));
		$this->varModel->addField(new Field('description',DT_STRING));		
		$this->varModel->addField(new Field('curDate',DT_STRING));		
		$this->varModel->addField(new Field('version',DT_STRING));
		$this->varModel->addField(new Field('locale_id',DT_STRING));
		$this->varModel->addField(new Field('debug',DT_STRING));
	}
	
	public function getVarModel(){
		return $this->varModel;
	}
	public function getVarValue($field){
		return $this->varModel->getFieldById($field)->getValue();
	}
	public function setVarValue($var,$val){
		return $this->varModel->getFieldById($var)->setValue($val);
	}
	
	public function addCssModel($cssModel){
		$this->cssModels[] = $cssModel;
	}
	public function getCssModelIterator(){
		$arrayobject = new ArrayObject($this->cssModels);
		return $arrayobject->getIterator();		
	}
	
	public function addJsModel($jsModels){
		$this->jsModels[] = $jsModels;
	}

	public function getJsModelIterator(){
		$arrayobject = new ArrayObject($this->jsModels);
		return $arrayobject->getIterator();		
	}
	
	public function write(ArrayObject &$models,$errorCode=NULL){
		//ob_clean();		
		header('Content-Type: text/html; charset="utf-8"');
		header("Expires: Mon, 26 Jul 1997 05:00:00 GMT");  // disable IE caching
		header("Last-Modified: " . gmdate( "D, d M Y H:i:s") . " GMT");
	
		$models->append($this->varModel);
		foreach ($this->cssModels as $model){
			$models->append($model);
		}
		foreach ($this->jsModels as $model){
			$models->append($model);
		}		
	}
}

?>
