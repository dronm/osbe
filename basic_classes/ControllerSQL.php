<?php
require_once(FRAME_WORK_PATH.'basic_classes/ControllerDb.php');
require_once(FRAME_WORK_PATH.'basic_classes/Model.php');
require_once(FRAME_WORK_PATH.'basic_classes/ModelSQL.php');
require_once(FRAME_WORK_PATH.'basic_classes/ModelOrderSQL.php');
require_once(FRAME_WORK_PATH.'basic_classes/ModelLimitSQL.php');
require_once(FRAME_WORK_PATH.'basic_classes/ModelWhereSQL.php');

require_once(FRAME_WORK_PATH.'basic_classes/FieldExtString.php');
require_once(FRAME_WORK_PATH.'basic_classes/ModelVars.php');
require_once(FRAME_WORK_PATH.'basic_classes/ParamsSQL.php');
require_once(FRAME_WORK_PATH.'basic_classes/VariantStorage.php');

/* data base support*/
//require_once("DbPg.php");
//require_once(FRAME_WORK_PATH."db/db_mysql.php");

class ControllerSQL extends ControllerDb{
	
	private $extParams;
	/*
	public function __construct($dbLinkMaster=NULL,$dbLink=NULL){
		parent::__construct($dbLinkMaster,$dbLink);
	}
	*/
	/*
	public function getDbLink(){
		$dbLink = parent::getDbLink();
		if (!isset($dbLink)){
			$dbLink = new DB_Sql();
			$dbLink->appname = APP_NAME;
			$dbLink->technicalemail = TECH_EMAIL;
			$dbLink->reporterror = DEBUG;
			$dbLink->database	= DB_NAME;			
			$dbLink->connect(DB_SERVER,DB_USER,DB_PASSWORD);		
			$this->setDbLink($dbLink);
		}
		return $dbLink;
	}
	public function getDbLinkMaster(){
		$dbLinkMaster = parent::getDbLinkMaster();
		if (!isset($dbLinkMaster)){
			if (DB_SERVER_MASTER!=DB_SERVER){
				$dbLinkMaster = new DB_Sql();
				$dbLinkMaster->appname = APP_NAME;
				$dbLinkMaster->technicalemail = TECH_EMAIL;
				$dbLinkMaster->reporterror = DEBUG;
				$dbLinkMaster->database	= DB_NAME;			
				$dbLinkMaster->connect(DB_SERVER_MASTER,DB_USER,DB_PASSWORD);		
				$this->setDbLinkMaster($dbLinkMaster);
			}
			else{
				$dbLinkMaster = $this->getDbLink();
			}
		}
		return $dbLinkMaster;
	}
	*/
	
	public function setQueryOptionsFromParams(&$model,&$pm,&$isInsert,&$where,&$order,
			&$limit,&$fields,&$grpFields,&$aggFields,&$calcTotal){	
			
		$from = null; $count = null;
		$limit = $this->limitFromParams($pm,$from,$count);
		$calcTotal = ($count>0);
		if ($from){
			$model->setListFrom($from);
		}
		if ($count){
			$model->setRowsPerPage($count);
		}			
		$order = $this->orderFromParams($pm,$model);
		$where = $this->conditionFromParams($pm,$model);
		$fields = $this->fieldsFromParams($pm);		
		$grpFields = $this->grpFieldsFromParams($pm);		
		$aggFields = $this->aggFieldsFromParams($pm);		
			
		$browse_mode = $pm->getParamValue('browse_mode');
		if (!isset($browse_mode)){
			$browse_mode = BROWSE_MODE_VIEW;
		}
		$model->setBrowseMode($browse_mode);
			
		$isInsert = ($browse_mode==BROWSE_MODE_INSERT);			
	}
	
	/*
	*/
	public function modelGetList($model,$pm=null){	
		$is_insert = NULL;
		$where = NULL;
		$order = NULL;
		$limit = NULL;
		$fields = NULL;
		$grp_fields = NULL;
		$agg_fields = NULL;
		$calc_total = NULL;
		$this->setQueryOptionsFromParams($model,$pm,$is_insert,$where,$order,
			$limit,$fields,$grp_fields,$agg_fields,$calc_total
		);	
		/*
		$this->beforeSelect();
		if (is_null($pm)){
			$pm = $this->getPublicMethod(ControllerDb::METH_GET_LIST);		
		}
		$from = null; $count = null;
		$limit = $this->limitFromParams($pm,$from,$count);
		$calc_total = ($count>0);
		if ($from){
			$model->setListFrom($from);
		}
		if ($count){
			$model->setRowsPerPage($count);
		}			
		$order = $this->orderFromParams($pm,$model);
		$where = $this->conditionFromParams($pm,$model);
		$fields = $this->fieldsFromParams($pm);		
		$grp_fields = $this->grpFieldsFromParams($pm);		
		$agg_fields = $this->aggFieldsFromParams($pm);		
			
		$browse_mode = $pm->getParamValue('browse_mode');
		if (!isset($browse_mode)){
			$browse_mode = BROWSE_MODE_VIEW;
		}
		$model->setBrowseMode($browse_mode);
			
		$is_insert = ($browse_mode==BROWSE_MODE_INSERT);
		*/
		$model->select($is_insert,$where,$order,
			$limit,$fields,$grp_fields,$agg_fields,
			$calc_total,TRUE);
		//
		$this->addModel($model);
		$this->afterSelect();	
	}
	
	protected function methodParamsToWhere(&$where,$pm,$model){
		$params = $pm->getParamIterator();		
		while($params->valid()) {
			$param = $params->current();
			$id = $param->getId();
			
			if ($model->fieldExists($id)){			
				$field = $model->getFieldById($id);
				if($field->getDataType()==DT_JSON||$field->getDataType()==DT_JSONB){
					$val_ar = json_decode($param->getValue(),TRUE);
					if(array_key_exists('keys',$val_ar)){
						$expr = '';						
						$field_id = $field->getId();
						foreach($val_ar['keys'] as $key_id=>$key_val){							
							$key_id_db = NULL;
							FieldSQLString::formatForDb($this->getDbLink(),$key_id,$key_id_db);
							$key_val_db = NULL;
							FieldSQLString::formatForDb($this->getDbLink(),$key_val,$key_val_db);
						
							$expr.= ($expr=='')? '':' AND ';
							$expr.= sprintf("%s->'keys'->>%s=%s::text",
								$field_id,
								$key_id_db,
								$key_val_db
							);
						}
						$where->addExpression($field_id,$expr);
					}
					else{
						throw new Exception('Keys not found on JSON value!');
					}					
				}
				else{								
					$field->setValue($param->getValue());
					$where->addField($field);
				}
			}			
			$params->next();
		}	
	}
	
	public function modelGetObject($model,$pm=NULL,$toXML=TRUE){
		$this->beforeSelect();
		$model->setDefaultModelOrder(NULL);
		if (is_null($pm)){
			//$pm = $this->getPublicMethod(ControllerDb::METH_GET_LIST);		
			$pm = $this->getPublicMethod(ControllerDb::METH_GET_OBJECT);
		}		
		
		//$this->methodParamsToModel($pm,$model);
		$where = new ModelWhereSQL();
		$this->methodParamsToWhere($where,$pm,$model);
		
		$copyMode = FALSE;
		$mode_par = $pm->getParamById('mode');
		if(isset($mode_par)){
			$mode = $pm->getParamById('mode')->getValue();
			$copyMode = (isset($mode) && strtolower($mode)=='copy');
		}
		/*
		$browse_mode = $pm->getParamById('browse_mode')->getValue();
		if (!isset($browse_mode)){
			$browse_mode = BROWSE_MODE_VIEW;
		}		
		$this->browseMode = $browse_mode;
		*/
		
		$limit = new ModelLimitSQL(1);
		//($browse_mode==BROWSE_MODE_INSERT)
		$model->select(
				FALSE,
				$where,NULL,$limit,NULL,NULL,NULL,NULL,$toXML,$copyMode);
		//
		
		$this->addModel($model);
		
		$this->afterSelect();		
	}
	
	public function addNewModel($query,$modelId=NULL,$toXML=TRUE){
		if (!isset($modelId)){
			$modelId = str_replace('_Controller','',$this->getId()).'_Model';
		}
		$model = new ModelSQL($this->getDbLink(), array('id'=>$modelId));
		$model->query($query,$toXML);
		$this->addModel($model);
		return $model;
	}
	
	public function conditionFromParams($pm,$model){	

		$where = null;
		$val = $pm->getParamValue('cond_fields');
		if (isset($val) && $val!=''){
			
			//ToDo flexible
			$field_sep = $pm->getParamValue('field_sep');			
			$field_sep = ($field_sep)? $field_sep:',';
			$condFields = explode($field_sep,$val);
			
			$cnt = count($condFields);						
			
			if ($cnt>0){				
				$val = $pm->getParamValue('cond_sgns');
				$condSgns = (isset($val))? explode($field_sep,$val):array();
				
				$val = $pm->getParamValue('cond_vals');
				//throw new Exception($val);
				$condVals = (isset($val))? explode($field_sep,$val):array();				
				$val = $pm->getParamValue('cond_ic');
				$condInsen = (isset($val))? explode($field_sep,$val):array();
				
				$sgn_keys_ar = explode(',',COND_SIGN_KEYS);
				$sgn_ar = explode(',',COND_SIGNS);
				if (count($condVals)!=$cnt){
					throw new Exception('Количество значений условий не совпадает с количеством полей! '.count($condVals).'<>'.$cnt);
				}
				
				//ToDo flexible
				$COND_FIELD_MULTY_VAL_SEP = ';';
				
				$where = new ModelWhereSQL();
				for ($i=0;$i<$cnt;$i++){					
					if (count($condSgns)>$i){
						$ind = array_search($condSgns[$i],$sgn_keys_ar);
					}
					else{
						//default param
						$ind = array_search('e',$sgn_keys_ar);
					}
					if ($ind>=0){
						$ic = NULL;
						
						//JSON!!!
						$json_marker = strpos($condFields[$i],'->');
						if($json_marker!==FALSE && !$model->fieldExists($condFields[$i]) && $model->fieldExists($fid=substr($condFields[$i],0,$json_marker))){						
							$json_fid = substr($condFields[$i],$json_marker+2);							
							$condFields[$i] = $fid;
							if(strpos($json_fid,'->')!==FALSE){							
								//field->keys->id								
								$json_far = explode('->',$json_fid);																
								for($j=0;$j<count($json_far)-1;$j++){									
									$condFields[$i].= sprintf("->'%s'",$json_far[$j]);
								}
								$json_fid = $json_far[count($json_far)-1];								
							}
							$condFields[$i].= sprintf("->>'%s'",$json_fid);							
							
							$ext_class = 'FieldExtString';
							$field = new FieldSQLString($this->getDbLink(),null,null,$condFields[$i]);
						}
						
						else if ($sgn_ar[$ind]=='LIKE'){							
							$f_dt = $model->getFieldById($condFields[$i])->getDataType();
							if ($f_dt==DT_DATETIME||$f_dt==DT_DATETIMETZ){
								//date part condition									
								if($condVals[$i][0]=="%"){
									$condVals[$i] = substr($condVals[$i],1);
								}
								$v_len = strlen($condVals[$i]);
								if($condVals[$i][$v_len-1]=="%"){
									$condVals[$i] = substr($condVals[$i],0,$v_len-1);
								}								
								$field = new FieldSQLDate($this->getDbLink(),null,null,$condFields[$i]);//,$model->getTableName()
								$ext_field = new FieldExtDate($field->getId());
								$ext_field->setValue($condVals[$i]);								
								$field->setValue($ext_field->getValue());
								$where->addExpression($condFields[$i], sprintf("%s::date=%s",$condFields[$i],$field->getValueForDb()));
								continue;
							}
							else{
								//soft validation: all values considered strings
								$ext_class = 'FieldExtString';
								$field = new FieldSQLString($this->getDbLink(),null,null,$condFields[$i]);//,$model->getTableName()
							}
						}
						else{							
							$field = clone $model->getFieldById($condFields[$i]);
							$ext_class = str_replace('SQL','Ext',get_class($field));													
						}
					
						// || $sgn_ar[$ind]=='=ANY'
						if ($sgn_ar[$ind]=='IN' || $sgn_ar[$ind]=='&&'){
							$ext_field = new $ext_class($field->getId());
							$condFiledVals = explode($COND_FIELD_MULTY_VAL_SEP,$condVals[$i]);
							$condFiledValsStr = '';
							for ($k=0;$k<count($condFiledVals);$k++){
								//validation
								$ext_field->setValue($condFiledVals[$k]);
								$field->setValue($ext_field->getValue());
							
								$condFiledValsStr.=($condFiledValsStr=='')? '':',';
								$condFiledValsStr.=$field->getValueForDb();
							}
							
							if ($sgn_ar[$ind]=='IN'){
								$field->setSQLExpression(sprintf('(%s)',$condFiledValsStr));
							}
							else if ($sgn_ar[$ind]=='=ANY'){
								$field->setSQLExpression(sprintf('(ARRAY[%s])',$condFiledValsStr));
							}
							else if ($sgn_ar[$ind]=='&&'){
								$field->setSQLExpression(sprintf('ARRAY[%s]',$condFiledValsStr));
							}
							
							$ic = FALSE;
							
						//field is an array type
						}else if ($sgn_ar[$ind]=='=ANY'){
							$field = new FieldSQLString($this->getDbLink(),null,null,$condFields[$i]);//,$model->getTableName()
							$ext_field = new FieldExtString($field->getId());
							$ext_field->setValue($condVals[$i]);								
							$field->setValue($ext_field->getValue());
							$where->addExpression($condFields[$i], sprintf("%s = ANY(%s)", $field->getValueForDb(), $condFields[$i]));
							continue;
						
						}else{
							$ext_field = new $ext_class($field->getId());
							//validation
							$ext_field->setValue($condVals[$i]);
							//throw new Exception('='.$condVals[$i]);
							$field->setValue($ext_field->getValue());
							//echo 'ind='.$i.' val='.$ext_field->getValue();
							if (is_null($ic))
								$ic = (count($condInsen)>$i)? ($condInsen[$i]=='1'):FALSE;
							/*
							if (count($condInsen)>$i){
								$ic = ($condInsen[$i]=='1');
							}
							else{
								$ic = false;
							}
							*/
						}						
						$where->addField($field, $sgn_ar[$ind], NULL, $ic);
						//throw new Exception('val='.$where->getSQL());
					}
				}
			}
		}		
		return $where;
	}
	
	public function orderFromParams($pm,$model){	
		$order = null;
		$val = $pm->getParamValue('ord_fields');
		if (isset($val)){
			$field_sep = $pm->getParamValue('field_sep');			
			$field_sep = ($field_sep)? $field_sep:',';
		
			$ordFields = explode($field_sep,$val);
			if (count($ordFields)>0){
				$order = new ModelOrderSQL();
				$val = $pm->getParamValue('ord_directs');
				$ordFieldsDirects = NULL;
				if (isset($val)){
					$ordFieldsDirects = explode($field_sep,$val);
				}
				for ($i=0;$i<count($ordFields);$i++){
					$dir = (is_null($ordFieldsDirects))? NULL:(($i<count($ordFieldsDirects))? $ordFieldsDirects[$i]:NULL);					
					
					$json_marker = strpos($ordFields[$i],'->');
					if($json_marker!==FALSE && !$model->fieldExists($ordFields[$i]) && $model->fieldExists($fid=substr($ordFields[$i],0,$json_marker))){						
						$json_fid = substr($ordFields[$i], $json_marker+2);					
						if(strlen($json_fid) && $json_fid[0] == '>'){
							$json_fid = substr($json_fid, 1);
							//quotes?
							if($json_fid[0] == "'" && $json_fid[strlen($json_fid)-1]=="'"){
								$json_fid = substr($json_fid, 1, strlen($json_fid)-2);
							}
						}
						$ordFields[$i] = $fid;						
						if(strpos($json_fid,'->')!==FALSE){													
							//field->keys->id								
							$json_far = explode('->',$json_fid);																
							for($j=0;$j<count($json_far)-1;$j++){									
								$ordFields[$i].= sprintf("->'%s'",$json_far[$j]);
							}
							$json_fid = $json_far[count($json_far)-1];								
						}
						//throw new Exception($json_fid);
						$ordFields[$i].= sprintf("->>'%s'", $json_fid);							
						//throw new Exception($ordFields[$i]);
						$field = new FieldSQLString($this->getDbLink(),null,null,$ordFields[$i]);
						
					}else if($model->fieldExists($ordFields[$i])){
						
						$field = $model->getFieldById($ordFields[$i]);
						
						if($field->getDataType()==DT_JSON||$field->getDataType()==DT_JSONB){					
							$json_f_p = strpos($ordFields[$i],'->');
							if($json_f_p!==FALSE){
								$json_f = substr($ordFields[$i],0,$json_f_p)."->>"."'".substr($ordFields[$i],$json_f_p+2)."'";							
							}
							else{
								//default
								$json_f = $ordFields[$i]."->>'descr'";
							}
							
							$field = new FieldSQLString($this->getDbLink(),null,null,$json_f);
						}
					}
					$order->addField($field, $dir);
				}
			}
		}
		return $order;
	}
	public function limitFromParams($pm,&$from,&$count){
		$limit = null;
		$count = $pm->getParamValue('count');
		$from = $pm->getParamValue('from');
		if (isset($from) || isset($count)){
			$limit = new ModelLimitSQL($count,$from);
		}
		return $limit;
	}
	public function fieldsFromParams($pm){
		$fields = null;
		$val = $pm->getParamValue('fields');
		if (isset($val)){
			$field_sep = $pm->getParamValue('field_sep');			
			$field_sep = ($field_sep)? $field_sep:',';
		
			$fields = explode($field_sep,$val);
		}
		return $fields;
	}
	public function grpFieldsFromParams($pm){
		$fields = null;
		$val = $pm->getParamValue('grp_fields');
		if (isset($val)){
			$field_sep = $pm->getParamValue('field_sep');			
			$field_sep = ($field_sep)? $field_sep:',';
		
			$fields = explode($field_sep,$val);
		}
		return $fields;
	}
	public function aggFieldsFromParams($pm){
		$fields = null;
		$val = $pm->getParamValue('agg_fields');
		if (isset($val)){
			$field_sep = $pm->getParamValue('field_sep');			
			$field_sep = ($field_sep)? $field_sep:',';
		
			$fields = explode($field_sep,$val);
		}
		return $fields;
	}
	public function aggTypesFromParams($pm){
		$fields = null;
		$val = $pm->getParamValue('agg_types');
		if (isset($val)){
			$field_sep = $pm->getParamValue('field_sep');			
			$field_sep = ($field_sep)? $field_sep:',';
		
			$fields = explode($field_sep,$val);
		}
		return $fields;
	}
	
	public function write($viewClassId,$viewId,$errorCode=NULL){
		if (defined('PARAM_TEMPLATE') && isset($_REQUEST[PARAM_TEMPLATE])){		
		
			$storage_class = defined('STORAGE_CLASS')? STORAGE_CLASS:'VariantStorage';
			$stvar = $storage_class::restore($_REQUEST[PARAM_TEMPLATE], $this->getDbLink());
			if (is_array($stvar) && count($stvar)>0){
				$this->addModel(new ModelVars(
					array('name'=>'Vars',
						'id'=>'VariantStorage_Model',
						'values'=>array(
							new Field('filter_data',DT_STRING,
								array('value'=>$stvar['filter_data'])),
							new Field('col_visib_data',DT_STRING,
								array('value'=>$stvar['col_visib_data'])),
							new Field('col_order_data',DT_STRING,
								array('value'=>$stvar['col_order_data']))
						)
					)
				));					
			}
		}			
	
		parent::write($viewClassId,$viewId,$errorCode);		
	}

	private function assignParams($pm){
		if (is_null($this->extParams) || $pm!=$this->extParams->getPublicMethod()){
			$this->extParams = new ParamsSQL($pm,$this->getDbLink());
			$this->extParams->addAll();
		}
	}
	
	public function getExtVal($pm,$id){
		$this->assignParams($pm);
		return $this->extParams->getVal($id);
	}
	public function getExtDbVal($pm,$id){
		$this->assignParams($pm);
		return $this->extParams->getDbVal($id);
	}	
}
?>
