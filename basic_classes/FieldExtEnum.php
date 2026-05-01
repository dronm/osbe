<?php
require_once(FRAME_WORK_PATH.'basic_classes/FieldExt.php');
require_once(FRAME_WORK_PATH.'Constants.php');
require_once(FRAME_WORK_PATH.'basic_classes/ValidatorString.php');

class FieldExtEnum extends FieldExt {
	const ER_NOT_IN_ENUM_VALUE = "поле '%s' - значение поля не входит в множество";
	const DEF_ENUM_DELIM = ',';

	private $enumDelim;
	private $enumValues;
	
	public function __construct($id,$enumDelim=NULL,$enumValues=NULL,$options=FALSE) {
		parent::__construct($id,DT_ENUM,$options);
		$this->setValidator(new ValidatorString());
		
		$this->setEnumDelim(!is_null($enumDelim)? $enumDelim:self::DEF_ENUM_DELIM);
		$this->setEnumValues($enumValues);
	}
	public function getEnumDelim(){
		return $this->enumDelim;
	}
	public function setEnumDelim($enumDelim){
		$this->enumDelim = $enumDelim;
	}
	public function getEnumValues(){
		return $this->enumValues;
	}
	public function setEnumValues($enumValues){
		$this->enumValues = $enumValues;
	}
	
	/* extra checking */
	public function isInEnum($val){
		if ($this->isEmpty($val)||$val=='undefined'){
			return TRUE;
		}
		if ($this->enumValues){
			$enumValues = array_flip(explode($this->getEnumDelim(),$this->getEnumValues()));
			$values = explode($this->getEnumDelim(),$val);
			foreach ($values as $value){
				if (!array_key_exists($value,$enumValues)){
					return FALSE;
				}
			}
		}
		return TRUE;
	}
	
	public function validate($val){
		if (!is_null($val) && strtolower($val)!='null'){
			$val = parent::validate($val);
			//one of the enum checking
			if (!$this->isInEnum($val)){
				throw new Exception(
				sprintf(FieldExtEnum::ER_NOT_IN_ENUM_VALUE,$this->getAlias()));
			}
		}
		return $val;
	}
}
?>
