<?php
require_once(FRAME_WORK_PATH.'basic_classes/Field.php');

class FieldExt extends Field{
	const FIELD_DESCR = "поле '%s' ";
	const ER_NO_VALUE = "- пустое значение";
	const ER_TOO_LONG_VALUE = "- значение слишком длинное";
	const ER_TOO_SHORT_VALUE = "- значение слишком короткое";	

	private $validator;
	
	public function __construct($id,$dataType,$options=false){
		parent::__construct($id,$dataType,$options);
	}
	
	public function setValue($val){
		$cor_val = $this->validate($val);
		parent::setValue($cor_val);
	}
	public function getValidator(){
		return $this->validator;
	}
	public function setValidator($validator){
		$this->validator = $validator;
	}
	/*
		value validation && correction
		1) not filled but required and has no de value		
		2) too long
		3) too short
		4) not valid value
	*/
	public function isEmpty($val){
		return (!isset($val));
	}
	public function isTooLong($val){
		$len = $this->getLength();
		return (isset($val) && isset($len) && $len < strlen($val));
	}
	public function isTooShort($val){
		$min_len = $this->getMinLength();
		return (isset($val) && isset($min_len) && $min_len>strlen($val));
	}
	
	public function validate($val){
		$no_val = $this->isEmpty($val);
		if ($no_val){
			$def = $this->getDefaultValue();
			if (isset($def)){
				$no_val = FALSE;
			}
		}
		if ($no_val && $this->getRequired()){
			throw new Exception(
				sprintf(FieldExt::FIELD_DESCR,$this->getAlias()).FieldExt::ER_NO_VALUE);
		}
		else if ($this->isTooLong($val)){
			throw new Exception(
				sprintf(FieldExt::FIELD_DESCR,$this->getAlias()).FieldExt::ER_TOO_LONG_VALUE);
		}
		else if ($this->isTooShort($val)){
			throw new Exception(
				sprintf(FieldExt::FIELD_DESCR,$this->getAlias()).FieldExt::ER_TOO_SHORT_VALUE);
		}
		else if (!$no_val){
			$v = $this->getValidator();
			if (isset($v)){
				try{
					$val = $v->validate($val);
				}
				catch(Exception $e){
					throw new Exception(
						sprintf(FieldExt::FIELD_DESCR,$this->getAlias()).$e->getMessage());
				}
			}
		}
		return $val;
	}

}

?>
