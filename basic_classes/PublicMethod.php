<?phprequire_once(FRAME_WORK_PATH.'basic_classes/Field.php');class PublicMethod {	const ER_PARAM_NOT_FOUND = 'Параметр "%s" метода "%s" не найден.';	const ER_INVALID_FIELDS = 'Обнаружены следующие ошибки: %s';	const ER_INVALID_FIELD = 'Обнаружена ошибка: %s';		private $id;	private $params;		public function paramExists($paramId){		return  (is_array($this->params) 				&& array_key_exists($paramId, $this->params));	}		public function __construct($id){		$this->setId($id);		$this->params = array();	}	public function getid(){		return $this->id;	}	public function setId($id){		$this->id = $id;	}		public function setParam($paramId,FieldExt $field){		$this->params[$paramId] = $field;	}	public function setParamValue($paramId,$fieldValue){		$this->params[$paramId]->setValue($fieldValue);	}	public function getParamValue($paramId,$defValue=NULL){		if ($this->paramExists($paramId)){			return $this->getParamById($paramId)->getValue();		}		else{			return $defValue;		}	}		public function addParam(FieldExt $field){		$this->params[$field->getId()] = $field;	}		public function checkParam($paramId){		if (!$this->paramExists($paramId)){			throw new Exception(				sprintf(PublicMethod::ER_PARAM_NOT_FOUND,$paramId,				$this->id));					}		return TRUE;	}		public function &getParamById($paramId){				return $this->params[$paramId];	}	    public function __set($property, $value){		if ($this->checkParam($property)){			$this->setParam($property, $value);		}    }		public function __get($property) {		$this->checkParam($property);		$this->getParamById($property);	}	public function getParamIterator(){		$arrayobject = new ArrayObject($this->params);		return $arrayobject->getIterator();				}		/* Param Validation*/	public function setValues(array $paramsArray){		$paramIt = $this->getParamIterator();		$errorStr = '';		$errorCnt = 0;		while($paramIt->valid()) {			$paramId = $paramIt->key();			$paramVal = $paramIt->current();						$val = null;			//setting value			if (isset($paramsArray[$paramId])){				$val = $paramsArray[$paramId];				//$_REQUEST IS ALREADY DECODED!!!				/*				if (				(!isset($_SERVER["CONTENT_TYPE"]) || !strlen($_SERVER["CONTENT_TYPE"]))				||( (isset($_SERVER["CONTENT_TYPE"]) && strlen($_SERVER["CONTENT_TYPE"]) && $_SERVER["CONTENT_TYPE"]=='application/x-www-form-urlencoded') )				){					if ('cond_vals'==$paramId){					throw new Exception('ID='.$paramId.' VAL='.$val);					}					$val = urldecode($val);				}				*/			}			//check for alias			else if (isset($paramsArray[$paramVal->getAlias()])){				$val = $paramsArray[$paramVal->getAlias()];			}			try{				$paramVal->setValue($val);							}			catch(Exception $e){				$errorCnt++;				$errorStr.= ($errorStr=='')? '':', ';				$errorStr.=$e->getMessage();			}			$paramIt->next();		}		if ($errorCnt){			if ($errorCnt==1){				$er = PublicMethod::ER_INVALID_FIELD;			}			else{				$er = PublicMethod::ER_INVALID_FIELDS;			}				throw new Exception(sprintf($er,$errorStr));		}	}	}?>	