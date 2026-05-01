<?php
require_once(FRAME_WORK_PATH.'Constants.php');
require_once(FRAME_WORK_PATH.'basic_classes/FieldExtBool.php');
require_once(FRAME_WORK_PATH.'basic_classes/FieldExtChar.php');
require_once(FRAME_WORK_PATH.'basic_classes/FieldExtDate.php');
require_once(FRAME_WORK_PATH.'basic_classes/FieldExtDateTime.php');
require_once(FRAME_WORK_PATH.'basic_classes/FieldExtDateTimeTZ.php');
require_once(FRAME_WORK_PATH.'basic_classes/FieldExtFloat.php');
require_once(FRAME_WORK_PATH.'basic_classes/FieldExtInt.php');
require_once(FRAME_WORK_PATH.'basic_classes/FieldExtString.php');
require_once(FRAME_WORK_PATH.'basic_classes/FieldExtEnum.php');
require_once(FRAME_WORK_PATH.'basic_classes/FieldExtTime.php');
require_once(FRAME_WORK_PATH.'basic_classes/FieldExtGeomPolygon.php');
require_once(FRAME_WORK_PATH.'basic_classes/FieldExtGeomPoint.php');
require_once(FRAME_WORK_PATH.'basic_classes/FieldExtJSON.php');
require_once(FRAME_WORK_PATH.'basic_classes/FieldExtJSONB.php');
require_once(FRAME_WORK_PATH.'basic_classes/FieldExtArray.php');
require_once(FRAME_WORK_PATH.'basic_classes/FieldExtXML.php');

require_once(FRAME_WORK_PATH.'basic_classes/FieldSQLBool.php');
require_once(FRAME_WORK_PATH.'basic_classes/FieldSQLChar.php');
require_once(FRAME_WORK_PATH.'basic_classes/FieldSQLDate.php');
require_once(FRAME_WORK_PATH.'basic_classes/FieldSQLDateTime.php');
require_once(FRAME_WORK_PATH.'basic_classes/FieldSQLDateTimeTZ.php');
require_once(FRAME_WORK_PATH.'basic_classes/FieldSQLFloat.php');
require_once(FRAME_WORK_PATH.'basic_classes/FieldSQLInt.php');
require_once(FRAME_WORK_PATH.'basic_classes/FieldSQLString.php');
require_once(FRAME_WORK_PATH.'basic_classes/FieldSQLTime.php');

require_once(FRAME_WORK_PATH.'basic_classes/FieldSQLGeomPolygon.php');
require_once(FRAME_WORK_PATH.'basic_classes/FieldSQLGeomPoint.php');
require_once(FRAME_WORK_PATH.'basic_classes/FieldSQLJSON.php');
require_once(FRAME_WORK_PATH.'basic_classes/FieldSQLJSONB.php');
require_once(FRAME_WORK_PATH.'basic_classes/FieldSQLArray.php');
require_once(FRAME_WORK_PATH.'basic_classes/FieldSQLXML.php');
require_once(FRAME_WORK_PATH.'basic_classes/FieldSQLBigInt.php');
require_once(FRAME_WORK_PATH.'basic_classes/FieldSQLSmallInt.php');

class ParamsSQL {
	private $dbLink;
	private $publicMethod;
	private $params;//значение для БД с кавычками
	private $validated_params;//значение проверенное

	public function __construct($pm,$dbLink){
		$this->dbLink = $dbLink;
		$this->publicMethod = $pm;
	}
	public function getPublicMethod(){
		return $this->publicMethod;
	}
	public function addAll(){
		$it=$this->publicMethod->getParamIterator();
		while($it->valid()) {
			$paramVal = $it->current();
			$this->addValidated(
				$it->key(),
				$paramVal->getDataType(),
				$paramVal->getValue());
			$it->next();
		}
	}
	public function setValidated($id,$dataType=NULL){
		$pm_param = $this->publicMethod->getParamById($id);		
		if (!isset($dataType)){
			$dataType = $pm_param->getDataType();
		}
		$val = $pm_param->getValue();
		$this->addValidated($id,$dataType,$val);
	}
	public function set($id,$dataType,$options=NULL){
		$val = $this->publicMethod->getParamValue($id);
		$this->add($id,$dataType,$val,$options);
	}
	public function add($id,$dataType,$val,$options=NULL){
		$val_db = NULL;
		
		if ($dataType==DT_INT || $dataType==DT_INT_UNSIGNED){
			$f = new FieldExtInt($id,$options);
			$val_validated = $f->validate($val);
			FieldSQLInt::formatForDb($val_validated,$val_db);
		}
		else if ($dataType==DT_STRING || $dataType==DT_EMAIL){
			$f = new FieldExtString($id,$options);
			$val_validated = $f->validate($val);
			FieldSQLString::formatForDb($this->dbLink,$val_validated,$val_db);
		}
		else if ($dataType==DT_FLOAT_UNSIGNED || $dataType==DT_FLOAT){
			$f = new FieldExtFloat($id,$options);
			$val_validated = $f->validate($val);
			FieldSQLFloat::formatForDb($val_validated,$val_db);
		}
		else if ($dataType==DT_BOOL){
			$f = new FieldExtBool($id,$options);
			$val_validated = $f->validate($val);
			FieldSQLBool::formatForDb($val_validated,$val_db);
		}
		else if ($dataType==DT_TEXT){
			$f = new FieldExtText($id,$options);
			$val_validated = $f->validate($val);
			FieldSQLString::formatForDb($this->dbLink,$val_validated,$val_db);
		}
		else if ($dataType==DT_DATETIME){
			$f = new FieldExtDateTime($id,$options);
			$val_validated = $f->validate($val);
			FieldSQLDateTime::formatForDb($val_validated,$val_db);
		}
		else if ($dataType==DT_DATETIMETZ){
			$f = new FieldExtDateTimeTZ($id,$options);
			$val_validated = $f->validate($val);
			FieldSQLDateTimeTZ::formatForDb($val_validated,$val_db);
		}		
		else if ($dataType==DT_DATE){
			$f = new FieldExtDate($id,$options);
			$val_validated = $f->validate($val);
			FieldSQLDate::formatForDb($val_validated,$val_db);
		}
		else if ($dataType==DT_TIME||$dataType==DT_INTERVAL){
			$f = new FieldExtTime($id,$options);
			$val_validated = $f->validate($val);
			FieldSQLTime::formatForDb($val_validated,$val_db);
		}
		else if ($dataType==DT_PWD){
			$f = new FieldExtString($id,$options);
			$val_validated = $f->validate($val);
			FieldSQLString::formatForDb($this->dbLink,$val_validated,$val_db);
		}
		else if ($dataType==DT_ENUM){
			$f = new FieldExtEnum($id,$options);
			$val_validated = $f->validate($val);
			$f = new FieldExtEnum($id,$options);
			FieldSQLString::formatForDb($this->dbLink,$val_validated,$val_db);
		}
		else if ($dataType==DT_GEOM_POLYGON){
			$f = new FieldExtGeomPolygon($id,$options);
			$val_validated = $f->validate($val);
			FieldSQLGeomPolygon::formatForDb($this->dbLink,$val_validated,$val_db);
		}
		else if ($dataType==DT_GEOM_POINT){
			$f = new FieldExtGeomPoint($id,$options);
			$val_validated = $f->validate($val);
			FieldSQLGeomPoint::formatForDb($this->dbLink,$val_validated,$val_db);
		}
		
		$this->params[$id] = $val_db;
		$this->validated_params[$id] = $val_validated;
	}
	
	public function addValidated($id,$dataType,$val,$options=NULL){
		$val_db = NULL;
		if ($dataType==DT_INT || $dataType==DT_INT_UNSIGNED){
			FieldSQLInt::formatForDb($val,$val_db);
		}
		else if ($dataType==DT_STRING || $dataType==DT_EMAIL){
			FieldSQLString::formatForDb($this->dbLink,$val,$val_db);
		}
		else if ($dataType==DT_FLOAT_UNSIGNED || $dataType==DT_FLOAT){
			FieldSQLFloat::formatForDb($val,$val_db);
		}
		else if ($dataType==DT_BOOL){
			FieldSQLBool::formatForDb($val,$val_db);
		}
		else if ($dataType==DT_TEXT){
			FieldSQLString::formatForDb($this->dbLink,$val,$val_db);
		}
		else if ($dataType==DT_DATETIME){
			FieldSQLDateTime::formatForDb($val,$val_db);
		}
		else if ($dataType==DT_DATE){
			FieldSQLDate::formatForDb($val,$val_db);
		}
		else if ($dataType==DT_TIME||$dataType==DT_INTERVAL){		
			FieldSQLTime::formatForDb($this->dbLink,$val,$val_db);
		}
		else if ($dataType==DT_PWD){
			FieldSQLString::formatForDb($this->dbLink,$val,$val_db);
		}
		else if ($dataType==DT_ENUM){
			FieldSQLString::formatForDb($this->dbLink,$val,$val_db);
		}		
		else if ($dataType==DT_GEOM_POLYGON){
			FieldSQLGeomPolygon::formatForDb($this->dbLink,$val,$val_db);
		}				
		else if ($dataType==DT_GEOM_POINT){
			FieldSQLGeomPoint::formatForDb($this->dbLink,$val,$val_db);
		}						
		$this->params[$id] = $val_db;
		$this->validated_params[$id] = $val;
	}
	
	public function getArray(){
		return $this->params;
	}
	public function paramExists($id){
		return (isset($this->params[$id]));
	}
	
	/*Значение для DB*/
	public function getDbVal($id){
		return $this->getParamById($id);
	}	
	public function getParamById($id){
		return (isset($this->params[$id]))? $this->params[$id]:NULL;
	}
	
	/*Значение НЕ для DB*/
	public function getVal($id){
		return (isset($this->validated_params[$id]))? $this->validated_params[$id]:NULL;
	}
	
}

?>
