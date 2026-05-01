<?php
/*я*/
class Field {
	private $id;	
	private $dataType;
	private $value;
	
	private $primaryKey=FALSE;
	private $length;
	private $required=FALSE;
	private $defaultValue;
	private $readOnly=FALSE;
	private $minLength=0;
	private $sysCol=FALSE;
	private $noValueOnCopy=FALSE;
	
	public function __construct($id,$dataType,$options=false) {
		$this->setId($id);
		$this->setDataType($dataType);
		if ($options && is_array($options)){
			if (isset($options['primaryKey'])){
				$this->setPrimaryKey($options['primaryKey']);
			}		
			if (isset($options['alias'])){
				$this->setAlias($options['alias']);
			}		
			if (isset($options['length'])){
				$this->setLength($options['length']);
			}
			if (isset($options['required'])){
				$this->setRequired($options['required']);
			}
			if (isset($options['defaultValue'])){
				$this->setDefaultValue($options['defaultValue']);
			}
			if (isset($options['readOnly'])){
				$this->setReadOnly($options['readOnly']);
			}
			if (isset($options['minLength'])){
				$this->setMinLength($options['minLength']);
			}
			if (isset($options['value'])){
				$this->setValue($options['value']);
			}
			if (isset($options['sysCol'])){
				$this->setSysCol($options['sysCol']);
			}			
			if (isset($options['noValueOnCopy'])){
				$this->setNoValueOnCopy($options['noValueOnCopy']);
			}			
			
		}
	}
	public function setId($id){
		return $this->id = $id;
	}	
	public function getId(){
		return $this->id;
	}
	
	public function setAlias($alias){
		return $this->alias = $alias;
	}	
	public function getAlias(){
		return (isset($this->alias))? $this->alias:$this->getId();
	}
	
	public function getDataType(){
		return $this->dataType;
	}
	public function setDataType($dataType){
		return $this->dataType = $dataType;
	}
	public function getSysCol(){
		return $this->sysCol;
	}
	public function setSysCol($sysCol){
		return $this->sysCol = $sysCol;
	}

	public function getNoValueOnCopy(){
		return $this->noValueOnCopy;
	}
	public function setNoValueOnCopy($v){
		return $this->noValueOnCopy = $v;
	}
	
	public function getLength(){
		return $this->length;
	}
	public function setLength($length){
		$this->length = $length;
	}
	
	public function getRequired(){
		return $this->required;
	}
	public function setRequired($required){
		$this->required = $required;
	}
	
	public function getDefaultValue(){
		return $this->defaultValue;
	}
	public function setDefaultValue($val){
		$this->defaultValue = $val;
	}
	
	public function getMinLength(){
		return $this->minLength;
	}
	public function setMinLength($minLength){
		$this->minLength = $minLength;
	}
	public function getReadOnly(){
		return $this->readOnly;
	}
	public function setReadOnly($readOnly){
		$this->readOnly = $readOnly;
	}
	public function getPrimaryKey(){
		return $this->primaryKey;
	}
	public function setPrimaryKey($primaryKey){
		$this->primaryKey = $primaryKey;
	}
	
	public function getValue(){
		return $this->value;
	}
	public function setValue($new_val){
		$this->value = $new_val;
	}
	
	private function addAttr(&$str,$name,$val){
		if (isset($val)){
			$str.=' '.$name.'="'.$val.'"';
		}
	}
	public function dataToXML(){
		$id = $this->getId();
		$v = $this->getValue();
		$val = (isset($v) && strlen($v))? htmlspecialchars($v, ENT_XML1, 'UTF-8', FALSE) : NULL;
		return (is_null($val)? sprintf('<%s xsi:nil="true"/>', $id) : sprintf('<%s>%s</%s>',$id, $val, $id)
		);
	}
	public function metadataToXML(){
		return sprintf('<field id="%s" alias="%s" dataType="%s" sysCol="%s"/>',
			$this->getId(),
			$this->getAlias(),
			$this->getDataType(),
			($this->getSysCol())? "TRUE":"FALSE"
		);
	}
	
}
?>
