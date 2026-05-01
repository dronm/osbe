<?php

require_once(FRAME_WORK_PATH.'basic_classes/ModelWhereSQL.php');
require_once(FRAME_WORK_PATH.'basic_classes/FieldSQLString.php');

class VariantStorage{

	static public function save($tmpl,$val){
		$_SESSION['vstor'.$tmpl] = serialize($val);
	}
	
	static public function restore($tmpl,$link){		
		$storage = NULL;
		if (isset($_SESSION['vstor'.$tmpl])){
			$storage = unserialize($_SESSION['vstor'.$tmpl]);
		}
		else{
			$storage = self::getDefaultStorageForTemplate($tmpl,$link);
			self::save($tmpl,$storage);
		}
		
		self::applyPredefinedPeriodValues($storage,$tmpl);
		
		return $storage;
	}	
	static public function clear($tmpl){
		unset($_SESSION['vstor'.$tmpl]);
	}		
	
	static protected function field_to_where($fId,$sign,$fIcase,$fVal,&$model,&$modelWhere){
		$COND_FIELD_MULTY_VAL_SEP = ';';
		
		$field = clone $model->getFieldById($fId);
		$ext_class = str_replace('SQL','Ext',get_class($field));						
		$ext_field = new $ext_class($field->getId());							
		if ($sign=='IN' || $sign=='=ANY' || $sign=='&&'){
			$condFiledVals = explode($COND_FIELD_MULTY_VAL_SEP,$condVals[$i]);
			$condFiledValsStr = '';
			for ($k=0;$k<count($condFiledVals);$k++){
				//validation
				$ext_field->setValue($condFiledVals[$k]);
				$field->setValue($ext_field->getValue());
		
				$condFiledValsStr.=($condFiledValsStr=='')? '':',';
				$condFiledValsStr.=$field->getValueForDb();
			}
		
			if ($sign=='IN'){
				$field->setSQLExpression(sprintf('(%s)',$condFiledValsStr));
			}
			else if ($sign=='=ANY'){
				$field->setSQLExpression(sprintf('(ARRAY[%s])',$condFiledValsStr));
			}
			else if ($sign=='&&'){
				$field->setSQLExpression(sprintf('ARRAY[%s]',$condFiledValsStr));
			}
		}
		else{
			//validation
			$ext_field->setValue($fVal);
			
			$field->setValue($ext_field->getValue());
		}
		
		//if ($field->getValue()!='null'){
		if (is_null($modelWhere)){
			$modelWhere = new ModelWhereSQL();
		}		
		$modelWhere->addField($field, $sign, NULL, $fIcase);
		//}		
	}
	
	/** This function can be overridden in inhereted classes to handle custom periods
	 * like shift for example
	 */
	static protected function getPredefinedPeriodValue($period,$val,$isFrom){
		$res = NULL;
		if ($period=='all'){
			return $val;
		}
		else if ($period=='day'){
			//this day
			$dt = getdate();
			if ($isFrom){				
				$res = mktime(0,0,0,$dt['mon'],$dt['mday'],$dt['year']);
			}
			else{
				$res = mktime(23,59,59,$dt['mon'],$dt['mday'],$dt['year']);
			}			
		}				
		else if ($period=='week'){
			//this week
			$dif = date("w") - 1;
			if ($dif<0)$dif = 6;
			$dt = getdate();
			$today = mktime(0,0,0,$dt['mon'],$dt['mday'],$dt['year']);
			$res = $today - $dif*24*60*60;
			if (!$isFrom){
				$end = getdate($res + 7*24*60*60 - 1);
				$res = mktime(23,59,59,$end['mon'],$end['mday'],$end['year']);
			}
		}		
		else if ($period=='month'){
			//this month
			$dt = getdate();
			$res = mktime(0,0,0,$dt['mon'],1,$dt['year']);
			if (!$isFrom){
				$dt = getdate($res + date('t')*24*60*60 - 1);
				$res = mktime(23,59,59,$dt['mon'],$dt['mday'],$dt['year']);
			}		
		}				
		else if ($period=='quarter'){
			//this quarter
			$m = date('n');
			if ($m<=3){
				$m = ($isFrom)? 1:3;
			}
			else if ($m<=6){
				$m = ($isFrom)? 4:6;
			}
			else if ($m<=9){
				$m = ($isFrom)? 7:9;
			}
			else{
				$m = ($isFrom)? 10:12;
			};
			$year = date('Y');
			$res = mktime(0,0,0,$m,1,$year);
			if (!$isFrom){
				$res = mktime(23,59,59,$m,date('t',$res),$year);
			}
		}						
		else if ($period=='year'){
			//this year
			$dt = getdate();
			if ($isFrom){
				$res = mktime(0,0,0,1,1,$dt['year']);
			}
			else{
				$res = mktime(23,59,59,12,31,$dt['year']);
			}
		}
		return $res? date('Y-m-d H:i:s',$res) : null;
	}
	
	/**
	 * Applies filter from storage to modelWhere
	 * sets predefined periods to current values
	 */
	static public function applyFilters(&$storage,&$model,&$modelWhere,$template){
		/**
		 * @toDo merge with ControllerSQL->conditionFromParams		 
		 */	
		if(!isset($storage)||!isset($storage['filter_data'])){
			return;
		}
		 
		$sgn_keys_ar = explode(',',COND_SIGN_KEYS);
		$sgn_ar = explode(',',COND_SIGNS);		
	
		$data_modif = FALSE;
		$filter_data = json_decode($storage['filter_data'],TRUE);
		foreach($filter_data as $filter_fld){
			if (isset($filter_fld['field'])){
				//ordinary control, simple or reference
				if (is_array($filter_fld['value'])){			
					if (
						isset($filter_fld['value']['RefType']) && is_array($filter_fld['value']['RefType'])
						&&
						isset($filter_fld['value']['RefType']['keys']) && is_array($filter_fld['value']['RefType']['keys'])
					){
						foreach($filter_fld['value']['RefType']['keys'] as $key_id=>$key_val){
							//throw new Exception('key_id='.$key_id.' key_val='.$key_val.'*');
							$fIcase = (isset($filter_fld['icase']))? $filter_fld['icase']:FALSE;
						
							$ind = array_search($filter_fld['sign'],$sgn_keys_ar);
							if ($ind>=0){
								self::field_to_where($filter_fld['field'],$sgn_ar[$ind],$fIcase,trim($key_val),$model,$modelWhere);
								//$key_id
							}
							//echo 'field='.$key_id.' sign='.$filter_fld['sign'].' val='.$key_val.'</br>';
						}
					}
				}
				else{
					$fIcase = (isset($filter_fld['icase']))? $filter_fld['icase']:FALSE;
					
					$ind = array_search($filter_fld['sign'],$sgn_keys_ar);
					if ($ind>=0){
						self::field_to_where($filter_fld['field'],$sgn_ar[$ind],$fIcase,trim($filter_fld['value']),$model,$modelWhere);
					}
				
					//echo 'field='.$filter_fld['field'].' sign='.$filter_fld['sign'].' val='.$filter_fld['value'].'</br>';
				}		
			}
			else{
				/** complex control like period
				 * {value:string,bindings:[{field,sign,value}]}
				 */
				if (is_array($filter_fld['value']) && isset($filter_fld['value']['period'])){
					//period control with predefined periods
					//0 - date_from, 1 - date_to
					for($k=0;$k<=1;$k++){
						if (isset($filter_fld['bindings'][$k]['field'])){
							$ind = array_search($filter_fld['bindings'][$k]['sign'],$sgn_keys_ar);
							if ($ind>=0){
								$per_val = '';								
								if($filter_fld['value']['period']!="all"){
									$data_modif = TRUE;
									$filter_fld['bindings'][$k]['value'] = self::getPredefinedPeriodValue($filter_fld['value']['period'],trim($filter_fld['bindings'][$k]['value']),($k==0));
								}
								self::field_to_where($filter_fld['bindings'][$k]['field'],$sgn_ar[$ind],FALSE,$filter_fld['bindings'][$k]['value'],$model,$modelWhere);
							}						
						}					
					}
				}
				else{
					foreach($filter_fld['bindings'] as $fld){
						if (is_array($fld['value'])){			
							if (
								isset($fld['value']['RefType']) && is_array($fld['value']['RefType'])
								&&
								isset($fld['value']['RefType']['keys']) && is_array($fld['value']['RefType']['keys'])
							){
								foreach($fld['value']['RefType']['keys'] as $key_id=>$key_val){
									$fIcase = (isset($fld['icase']))? $fld['icase']:FALSE;
						
									$ind = array_search($fld['sign'],$sgn_keys_ar);
									if ($ind>=0){
										self::field_to_where($filter_fld['field'],$sgn_ar[$ind],$fIcase,trim($key_val),$model,$modelWhere);
										//$key_id
									}
						
									//echo 'field='.$key_id.' sign='.$fld['sign'].' val='.$key_val.'</br>';
								}
							}
						}
						else if (isset($fld['field'])){
							$fIcase = (isset($fld['icase']))? $fld['icase']:FALSE;
					
							$ind = array_search($fld['sign'],$sgn_keys_ar);
							if ($ind>=0){
								self::field_to_where($fld['field'],$sgn_ar[$ind],$fIcase,trim($fld['value']),$model,$modelWhere);
							}
					
							//echo 'field='.$fld['field'].' sign='.$fld['sign'].' val='.$fld['value'].'</br>';
						}
					}
				}
			}
		}
	}		
	
	public static function getDefaultStorageForTemplate($tmpl,$link){
		$tmpl_for_db = "";
		FieldSQLString::formatForDb($link,$tmpl,$tmpl_for_db);

		$varq = sprintf(
			"SELECT sub.* 
			FROM (
				(SELECT
					filter_data,
					col_visib_data,
					col_order_data,
					1 AS prior
				FROM variant_storages
				WHERE user_id=%d AND storage_name=%s AND default_variant=TRUE)
				UNION ALL
				(SELECT
					filter_data,
					col_visib_data,
					col_order_data,
					0 AS prior
				FROM variant_storages
				WHERE user_id IS NULL AND storage_name=%s AND default_variant=TRUE)		
			) AS sub
			ORDER BY prior DESC
			LIMIT 1",
		(isset($_SESSION['user_id']))? $_SESSION['user_id']:0,
		$tmpl_for_db,$tmpl_for_db
		);				
		$stvar = $link->query_first($varq);
		//file_put_contents(OUTPUT_PATH.'stvar.txt',$stvar);
		return $stvar;
	}
	
	static public function applyPredefinedPeriodValues(&$storage,$template){	
		$data_modif = FALSE;
		$filter_data = (isset($storage['filter_data'])&&gettype($storage['filter_data'])=='string')? json_decode($storage['filter_data'],TRUE):NULL;
		if(!$filter_data)return;
		$sgn_keys_ar = explode(',',COND_SIGN_KEYS);
		foreach($filter_data as &$filter_fld){
			if (!isset($filter_fld['field'])){
				/** complex control like period
				 * {value:string,bindings:[{field,sign,value}]}
				 */
				if (is_array($filter_fld['value']) && isset($filter_fld['value']['period'])){
					//period control with predefined periods
					//0 - date_from, 1 - date_to
					for($k=0;$k<=1;$k++){
						if (isset($filter_fld['bindings'][$k]['field'])){
							$ind = array_search($filter_fld['bindings'][$k]['sign'],$sgn_keys_ar);
							if ($ind>=0){
								$per_val = '';								
								if($filter_fld['value']['period']!="all"){
									$data_modif = TRUE;
									$filter_fld['bindings'][$k]['value'] = self::getPredefinedPeriodValue($filter_fld['value']['period'],trim($filter_fld['bindings'][$k]['value']),($k==0));
								}
							}						
						}					
					}
				}
			}
		}		
		if ($data_modif){
			$storage['filter_data'] = json_encode($filter_data);
			self::save($template,$storage);
		}			
	}
}

?>
