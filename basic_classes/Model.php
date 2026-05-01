<?php
require_once(FRAME_WORK_PATH.'basic_classes/Field.php');

class Model {
	const ER_PROPERTY_NOT_FOUND = 'Атрибут "%s" класса "%s" не найден.';
	const ER_OUT_OF_ROW_BOUNDS = 'Индекс строк вышел за границы.';
	const DATA_NODE_NAME = 'model';
	const ROW_NODE_NAME = 'row';
	
	const DEF_NAMESPACE = 'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"';
	
	private $id;	
	
	protected $fields;
	protected $fieldAlias;
	
	protected $rows;	
	private $rowPos;
	
	private $readOnly=FALSE;
	
	protected $rowsPerPage=0;
	protected $listFrom=0;
	protected $totalCount=0;
	
	//current browse element id
	private $browseId;	
	private $browseMode;
	
	private $sysModel;
	private $nameSpace;
	
	private $calcHash;
	
	public function __construct($options=NULL){
		$this->rows=array();
		$this->setRowBOF();
		$this->fields=array();	
		$this->fieldAlias=array();			
		
		if (!is_null($options) && is_array($options)){
			if (isset($options['id'])){
				$this->setId($options['id']);
			}
			if (isset($options['rowsPerPage'])
			&& $options['rowsPerPage']){
				$this->setRowsPerPage($options['rowsPerPage']);
			}
			if (isset($options['readOnly'])){
				$this->setReadOnly($options['readOnly']);
			}
			
			if (isset($options['sysModel'])){
				$this->setSysModel($options['sysModel']);
			}

			if (isset($options['calcHash'])){
				$this->setCalcHash($options['calcHash']);
			}
			
		}
	}
	
	public function checkField($id){
		if (!$this->fieldExists($id)){
			throw new Exception(sprintf(self::ER_PROPERTY_NOT_FOUND,$id,get_class($this)));
		}
		return TRUE;
	}	
	
	/*
		fields
	*/
	public function addField($field){
		$this->fields[$field->getId()] = $field;
		$this->fieldAlias[$field->getAlias()] = $field;
	}
	public function getFieldCount(){
		return count($this->fields);
	}
	
	public function getFieldById($fieldId){
		if ($this->checkField($fieldId)){
			return $this->rows[$this->getRowPos()][$fieldId];
		}
	}
	public function getFieldByAlias($fieldAlias){
		if (array_key_exists($fieldAlias,$this->fieldAlias)){
			return $this->fieldAlias[$fieldAlias];
		}
		else{
			throw new Exception(sprintf(Model::ER_PROPERTY_NOT_FOUND,$fieldAlias, $this->getId()));
		}
	}
	
	public function fieldExists($id){
		return (is_array($this->fields) && array_key_exists($id,$this->fields));
	}
	public function aliasExists($alias){
		return (is_array($this->fieldAlias) && array_key_exists($alias,$this->fieldAlias));
	}
	
	public function __set($property, $value){
		$this->getFieldById($property)->setValue($value);
	}	
	
	public function __get($property) {		
		return $this->getFieldById($property)->getValue();
	}
	
	public function getFieldIterator(){
		if ($this->getRowCount()>0){
			$arrayobject = new ArrayObject($this->rows[$this->getRowPos()]);
		}
		else{
			$arrayobject = new ArrayObject($this->fields);
		}		
		return $arrayobject->getIterator();
	}
	public function getId(){
		return (isset($this->id)? $this->id:get_class($this));
	}
	public function setId($id){
		$this->id = $id;
	}
	public function getReadOnly(){
		return $this->readOnly;
	}
	public function setReadOnly($readOnly){
		$this->readOnly = $readOnly;
	}
	public function getSysModel(){
		return $this->sysModel;
	}
	public function setSysModel($v){
		$this->sysModel = $v;
	}
	public function getCalcHash(){
		return $this->calcHash;
	}
	public function setCalcHash($v){
		$this->calcHash = $v;
	}
	
	public function getRowsPerPage(){
		return $this->rowsPerPage;
	}
	public function setRowsPerPage($rowsPerPage){
		$this->rowsPerPage = $rowsPerPage;
	}
	public function getListFrom(){
		return $this->listFrom;
	}
	public function setListFrom($listFrom){
		$this->listFrom = $listFrom;
	}
	public function getBrowseId(){
		return $this->browseId;
	}
	public function setBrowseId($browseId){
		$this->browseId = $browseId;
	}
	public function getBrowseMode(){
		return $this->browseMode;
	}
	public function setBrowseMode($browseMode){
		$this->browseMode = $browseMode;
	}
	
	public function getTotalCount(){
		return $this->totalCount;
	}
	public function setTotalCount($totalCount){
		$this->totalCount = $totalCount;
	}

	public function getNameSpace(){
		return !is_null($this->nameSpace)? $this->nameSpace : self::DEF_NAMESPACE;
	}
	public function setNameSpace($nameSpace){
		$this->nameSpace = $nameSpace;
	}
	
	/**
	 * needId can be row object for backward compatibility
	 */
	public function insert($needId=FALSE,$row=NULL){
		if (!is_bool($needId) && is_null($row)){
			$row = $needId;
		}
		array_push($this->rows, (!is_null($row))? $row : $this->fields);
		/*
		$f = clone $this->fields;
		if (!is_null($row)){
			foreach($row as $r_f){
				$f->setValue($r_f->getValue());
			}
		}		
		array_push($this->rows,$f);
		*/
		//array_push($this->rows, ($row)? $row:$this->fields);
		
		/*
		$row = array();
		foreach($this->fields as $f){
			array_push($row,clone $f);
		}
		
		//$arrayobject = new ArrayObject($this->fields);
		//array_push($this->rows,$arrayobject->getArrayCopy());
		
		array_push($this->rows,$row);
		*/
		$this->rowPos++;
		//echo '$this->rowPos='.$this->rowPos;
	}
	public function update(){
	}
	public function delete(){
	}
	
	/*
	*/
	public function isLastRow(){
		return (($this->getRowPos()+1)==$this->getRowCount());
	}
	
	public function getNextRow(){
		if (!$this->isLastRow()){
			$this->rowPos++;
			return TRUE;
		}
		return FALSE;
	}
	
	public function getRowPos(){
		return $this->rowPos;
	}
	
	public function getRowCount(){
		return count($this->rows);
	}	
	public function setRowPos($rowPos){
		if ($rowPos < $this->getRowCount()){
			$this->rowPos = $rowPos;		
		}
		else{
			//$this->rowPos = -1;
			throw new Exception(Model::ER_OUT_OF_ROW_BOUNDS);
		}
	}
	
	public function setRowBOF(){
		$this->setRowPos(-1);
	}
	public function setLastRow(){
		$this->setRowPos($this->getRowCount()-1);
	}
	
	/*
	*/
	private function addAttr(&$str,$name,$val){
		if (isset($val)){
			$str.=' '.$name.'="'.$val.'"';
		}
	}
	
	public function dataToXML(){
		$this->setRowBOF();
		//echo 'Model->dataToXML ROWPos='.$this->getRowPos();
		$result = sprintf('<%s id="%s" sysModel="%d"
		rowsPerPage="%d" listFrom="%d" totalCount="%d">',
		Model::DATA_NODE_NAME,$this->getId(), ($this->getSysModel())? "1":"0",
		$this->getRowsPerPage(),$this->getListFrom(),$this->getTotalCount()
		);
		while ($this->getNextRow()){
			//echo 'Model->dataToXML ROWPos='.$this->getRowPos();
			$data='';
			//$id = '';
			$fields = $this->getFieldIterator();
			while($fields->valid()) {
				$field = $fields->current();
				//echo 'Model->dataToXML field id='.$field->getAlias();
				$data.= $field->dataToXML();
				/*if ($field->getPrimaryKey()){
					//primary key
					$id.=($id=='')?'':',';
					$id.=$field->getValue();
				}*/
				$fields->next();
			}
			/*
			$result.= '<'.Model::ROW_NODE_NAME.' id="'.$id.'">';
			$result.= $data;
			$result.= '</'.Model::ROW_NODE_NAME.'>';
			*/
			$result.= sprintf('<%s %s>%s</%s>',
				Model::ROW_NODE_NAME,
				$this->getNameSpace(),
				$data,
				Model::ROW_NODE_NAME);
		}
		$result.='</'.Model::DATA_NODE_NAME.'>';
		return $result;
	}
	public function metadataToXML(){
		$result = sprintf('<metadata modelId="%s">',$this->getId());
		foreach($this->fields as $field){
			$result.=$field->metadataToXML();
		}
		$result.='</metadata>';
		return $result;
	}
}
?>
