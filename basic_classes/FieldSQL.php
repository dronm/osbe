<?php
require_once(FRAME_WORK_PATH.'basic_classes/Field.php');

class FieldSQL extends Field{
	const SQL_ASSIGNE = '%s=%s';
	const SQL_FIELD_ALIAS = '%s AS "%s"';
	const SQL_EXPR_FIELD_ALIAS = '%s AS "%s"';
	
	const ER_LOOK_UP_DB_NOT_DEFINED = 'База данных сопоставляемого поля "%s" не определена.';
	const ER_LOOK_UP_TABLE_NOT_DEFINED = 'Таблица сопоставляемого поля "%s" не определена.';
	const ER_LOOK_UP_KEYS_NOT_DEFINED = 'Ключи сопоставляемого поля "%s" не заданы.';
	const ER_NO_FAST_EDIT_MODEL = 'Включен режим быстрого выбора, но модель не определена!';
	
	private $dbLink;	
	private $dbName;
	private $tableName;
	private $fieldName;
	private $expression;
	private $pattern;
	private $autoInc=FALSE;
	
	private $fieldType;
	private $lookUpDbName;
	private $lookUpTableName;
	private $lookUpKeys;
	private $lookUpIdValue;
	
	private $oldValue;
	private $sqlExpression;
	private $retAfterInsert;
	
	/*if TRUE and field type is FT_LOOK_UP
		the join table data is being taken
		out in edit mode for <select> tag
		for instance in HTML client
	*/
	private $fastEdit=FALSE;
	private $fastEditModelId;
	
	public function __construct($dbLink,$dbName, $tableName, $fieldName,$dataType, $options=FALSE) {
	
		//parent::__construct($dbName.'.'.$tableName.'.'.$fieldName,$dataType,$options);
		parent::__construct($fieldName,$dataType,$options);
		
		$this->setDbLink($dbLink);
		$this->setDbName($dbName);
		$this->setTableName($tableName);
		$this->setFieldName($fieldName);
		
		if (isset($options['expression'])){
			$this->setExpression($options['expression']);
		}
		if (isset($options['pattern'])){
			$this->setPattern($options['pattern']);
		}
		if (isset($options['autoInc'])){
			$this->setAutoInc($options['autoInc']);
		}		
		$fieldType = (isset($options['fieldType']))?
			$options['fieldType']:FT_DATA;
		$this->setFieldType($fieldType);
		
		if (isset($options['retAfterInsert'])){
			$this->setRetAfterInsert($options['retAfterInsert']);
		}
		
		/*
		if ($fieldType==FT_LOOK_UP){
			if (!isset($options['lookUpDbName'])){
				throw new Exception(
				sprintf(FieldSQL::ER_LOOK_UP_DB_NOT_DEFINED,$name)
				);
			}
			$this->setLookUpDbName($options['lookUpDbName']);
			if (!isset($options['lookUpTableName'])){
				throw new Exception(
				sprintf(FieldSQL::ER_LOOK_UP_TABLE_NOT_DEFINED,$name)
				);
			}
			$this->setLookUpTableName($options['lookUpTableName']);			
			if (!isset($options['lookUpKeys'])
			|| !is_array($options['lookUpKeys'])
			|| !count($options['lookUpKeys'])){
				throw new Exception(
				sprintf(FieldSQL::ER_LOOK_UP_KEYS_NOT_DEFINED,$this->getId())
				);
			}
			$this->setLookUpKeys($options['lookUpKeys']);
			
			if (isset($options['fastEdit'])){
				if ($options['fastEdit']){
					$this->setFastEdit(TRUE);
					if (isset($options['fastEditModelName'])){
						$this->setFastEditModelName($options['fastEditModelName']);
					}
					else{
						throw new Exception(FieldSQL::ER_NO_FAST_EDIT_MODEL);
					}
				}
			}
		}
		*/
	}
	public function __serialize() {
		//remove dbLink - it cannot be serialized	
		return array(
			'id' => $this->getId(),
			'dataType' => $this->getDataType(),
			'value' => $this->getValue(),
			'primaryKey' => $this->getPrimaryKey(),
			'length' => $this->getLength(),
				'required' => $this->getRequired(),
				'defaultValue' => $this->getDefaultValue(),
				'readOnly' => $this->getReadOnly(),
				'minLength' => $this->getMinLength(),
				'sysCol' => $this->getSysCol(),
				'noValueOnCopy' => $this->getNoValueOnCopy(),
				'dbName' => $this->dbName,
				'tableName' => $this->tableName,
				'fieldName' => $this->fieldName,
				'expression' => $this->expression,
				'pattern' => $this->pattern,
				'autoInc' => $this->autoInc,
				'fieldType' => $this->fieldType,
				'lookUpDbName' => $this->lookUpDbName,
				'lookUpTableName' => $this->lookUpTableName,
				'lookUpKeys' => $this->lookUpKeys,
				'lookUpIdValue' => $this->lookUpIdValue,
				'oldValue' => $this->oldValue,
				'sqlExpression' => $this->sqlExpression,
				'retAfterInsert' => $this->retAfterInsert,
				'fastEdit' => $this->fastEdit,
				'fastEditModelId' => $this->fastEditModelId
		);
    	}
	
	public function getDbLink(){
		return $this->dbLink;
	}
	public function setDbLink($dbLink){
		return $this->dbLink = $dbLink;
	}
	public function getDbName(){
		return $this->dbName;
	}
	public function setDbName($dbName){
		$this->dbName = $dbName;
	}
	
	public function getTableName(){
		return $this->tableName;
	}
	public function setTableName($tableName){
		$this->tableName = $tableName;
	}
	public function getFieldName(){
		return $this->fieldName;
	}
	public function setFieldName($fieldName){
		$this->fieldName = $fieldName;
	}
	
	public function getExpression(){
		return $this->expression;
	}
	public function setExpression($expression){
		$this->expression = $expression;
	}
	public function getPattern(){
		return $this->pattern;
	}
	public function setPattern($pattern){
		$this->pattern = $pattern;
	}
	public function getAutoInc(){
		return $this->autoInc;
	}
	public function setAutoInc($autoInc){
		return $this->autoInc = $autoInc;
	}
	public function getFieldType(){
		return $this->fieldType;
	}
	public function setFieldType($fieldType){
		return $this->fieldType = $fieldType;
	}
	public function getLookUpDbName(){
		return $this->lookUpDbName;
	}
	public function setLookUpDbName($lookUpDbName){
		return $this->lookUpDbName = $lookUpDbName;
	}
	public function getLookUpTableName(){
		return $this->lookUpTableName;
	}
	public function setLookUpTableName($lookUpTableName){
		return $this->lookUpTableName = $lookUpTableName;
	}
	public function getLookUpKeys(){
		return $this->lookUpKeys;
	}
	public function setLookUpKeys($lookUpKeys){
		return $this->lookUpKeys = $lookUpKeys;
	}	
	public function getOldValue(){
		return $this->oldValue;
	}
	public function getOldValueForDb(){
		return $this->oldValue;
	}	
	public function setOldValue($oldValue){
		$this->oldValue = $oldValue;
	}
	public function setLookUpIdValue($lookUpIdValue){
		$this->lookUpIdValue = $lookUpIdValue;
	}
	public function getLookUpIdValue(){
		return $this->lookUpIdValue;
	}
	public function getFastEdit(){
		return ($this->getFieldType()==FT_LOOK_UP 
		&& $this->fastEdit);
	}
	public function setFastEdit($fastEdit){
		$this->fastEdit = $fastEdit;
	}
	public function getFastEditModelId(){
		return $this->fastEditModelId; 
	}
	public function setFastEditModelId($fastEditModelId){
		$this->fastEditModelId = $fastEditModelId;
	}
	public function getSQLExpression(){
		return $this->sqlExpression;
	}
	public function setSQLExpression($expr){
		$this->sqlExpression = $expr;
	}
	public function getRetAfterInsert(){
		return $this->retAfterInsert;
	}
	public function setRetAfterInsert($v){
		$this->retAfterInsert = $v;
	}
		
    public function getValueForDb(){
		$val = $this->getValue();				
		if (is_null($val)){
			$val = $this->getDefValueForDb();			
		}
		if (is_null($val)){
			$val = 'null';
		}		
		return $val;
    }
    public function getDefValueForDb(){    
		return $this->getDefaultValue();
    }
    public function getValueForView(){
        return $this->getFormattedValue();
    }
    public function __toString(){
        return $this->getValueForView();
    }
    public function getFormattedValue(){
        if ($pattern = $this->getPattern()){
            return sprintf($pattern, $this->getValue());
        }
		else{
			return $this->getValue();
		}
	}
	
	public function getSQLLookUpNoAlias(){
		$res = '';
		$keys = $this->getLookUpKeys();
		//$pref = $this->getDbName().'_'.$this->getTableName().'_';
		$db = $this->getLookUpDbName();
		$table = $this->getLookUpTableName();
		foreach ($keys as $lookup_key=>$key){
			$res.=($res=='')? '':',';
			$res.= sprintf(FieldSQL::SQL_FIELD,
					$db, $table,$key);
		}
		return $res;	
	}
	
	public function getSQLNoAlias($short=TRUE){
		if ($expr = $this->getExpression()){
			return $expr;
		}			
		else if(!$short){
			$tb = $this->getTableName();
			return ( ($tb&&strlen($tb))? $this->getTableName().'.':'').$this->getId();
		}
		else{
			return $this->getId();
		}
	}
	
	public function getSQL(){
		if ($expr = $this->getExpression()){
			return sprintf(Field::SQL_EXPR_FIELD_ALIAS,
				$expr,$this->getFieldAlias());
		}
		else{
			return sprintf(FieldSQL::SQL_FIELD_ALIAS,
				$this->getId(), $this->getId());
			//$this->getAlias()
		}
	}
	public function getSQLLookUp(){
		$res = '';
		$keys = $this->getLookUpKeys();
		$pref = $this->getDbName().'_'.$this->getTableName().'_';
		$db = $this->getLookUpDbName();
		$table = $this->getLookUpTableName();
		foreach ($keys as $lookup_key=>$key){
			$res.=($res=='')? '':',';
			$res.= sprintf(FieldSQL::SQL_FIELD_ALIAS,
					$db, $table,
					$key, $pref.$lookup_key);
		}
		return $res;
	}
	
	public function getSQLLookUpDefValue(){
		//ToDo
		$def = $this->getDefValueForDb();
		$def_val= (isset($def))? $def:'NULL';
		$res = '';
		$keys = $this->getLookUpKeys();
		$pref = $this->getDbName().'_'.$this->getTableName().'_';
		foreach ($keys as $lookup_key=>$key){
			$res.=($res=='')? '':',';
			$res.= sprintf(FieldSQL::SQL_EXPR_FIELD_ALIAS,
					$def_val,$pref.$lookup_key);
		}
		return $res;		
	}
	
	public function getSQLDefValue(){
		$def = $this->getDefValueForDb();
		if ($this->getFieldType()==FT_LOOK_UP || !isset($def)){
			$def='NULL';
		}
		else{
			$data_type = $this->getDataType();
			if ($data_type==DT_STRING
			|| $data_type==DT_PWD
			|| $data_type==DT_DATE
			|| $data_type==DT_DATETIME
			|| $data_type==DT_EMAIL
			|| $data_type==DT_TEXT
			|| $data_type==DT_TIME
			|| $data_type==DT_TIME
				){
				$def = '"'.$def.'"';
			}
		}
		return sprintf(FieldSQL::SQL_EXPR_FIELD_ALIAS,
			$def,$this->getAlias());
	}
	
	public function getSQLLookUpAssigne(){
		$res = '';
		$key_values = explode(',',$this->getLookUpIdValue());
		$keys = $this->getLookUpKeys();
		$pref = $this->getDbName().'_'.$this->getTableName().'_';
		$db = $this->getLookUpDbName();
		$table = $this->getLookUpTableName();
		$ind = 0;
		foreach ($keys as $lookup_key=>$key){
			$res.=($res=='')? '':',';
			$res.= sprintf(FieldSQL::SQL_ASSIGNE,
					$db, $table,
					$key,$key_values[$ind]);
			$ind++;
		}
		return $res;	
	}
	
	public function getSQLAssigne(){
			return sprintf(
				FieldSQL::SQL_ASSIGNE,
				$this->getId(),
				$this->getValueForDb()
				);	
	
	}
	public function getSQLAssigneOldValue(){
			return sprintf(
				FieldSQL::SQL_ASSIGNE,
				$this->getId(),
				$this->getOldValueForDb()
				);	
	}
	
	public function dataToXML(){
		if ($this->getFieldType()==FT_LOOK_UP){
			$res = sprintf('<%s refId="%s">%s</%s>',
					$this->getId(),
					$this->getLookUpIdValue(),
					$this->getValue(),
					$this->getId()
				);
		}
		else{
			$res = sprintf('<%s>%s</%s>',
					$this->getId(),
					$this->getValue(),
					$this->getId()
				);		
		}
		return $res;
	}
	
}
?>
