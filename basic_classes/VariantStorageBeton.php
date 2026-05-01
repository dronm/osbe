<?php

require_once(FRAME_WORK_PATH.'basic_classes/VariantStorage.php');

class VariantStorageBeton extends VariantStorage{

	static protected function getShiftParams(&$shiftFrom,&$shiftTo){		
		if(isset($_SESSION['first_shift_start_time'])){
			$shiftFrom = array();
			$a = explode(':',$_SESSION['first_shift_start_time']);
			if(count($a)>=1){
				$shiftFrom['h'] = intval($a[0]);
			}
			if(count($a)>=2){
				$shiftFrom['m'] = intval($a[1]);
			}
			if(count($a)>=3){
				$shiftFrom['s'] = intval($a[2]);
			}			
		}
		else{
			$shiftFrom = array('h'=>6,'m'=>0,'s'=>0);
		}
		
		if(isset($_SESSION['first_shift_end_time'])){
			$shiftTo = array();
			$a = explode(':',$_SESSION['first_shift_end_time']);
			if(count($a)>=1){
				$shiftTo['h'] = intval($a[0]);
			}
			if(count($a)>=2){
				$shiftTo['m'] = intval($a[1]);
			}
			if(count($a)>=3){
				$shiftTo['s'] = intval($a[2]);
			}
			
		}
		else{
			$shiftTo = array('h'=>5,'m'=>59,'s'=>59);
		}
		
	}

	static protected function getPredefinedPeriodValue($period,$val,$isFrom){
		if ($period=='shift'){
			$shiftFrom = NULL;
			$shiftTo = NULL;
			self::getShiftParams($shiftFrom,$shiftTo);
			
			if ($isFrom){				
				$dt = getdate();
				$res = mktime($shiftFrom['h'],$shiftFrom['m'],$shiftFrom['s'],$dt['mon'],$dt['mday'],$dt['year']);
			}
			else{
				$dt = getdate(time()+24*60*60);
				$res = mktime($shiftTo['h'],$shiftTo['m'],$shiftTo['s'],$dt['mon'],$dt['mday'],$dt['year']);
			}
			return date('Y-m-d H:i:s',$res);			
		}
		else if ($period=='prev_shift'){
			$shiftFrom = NULL;
			$shiftTo = NULL;
			self::getShiftParams($shiftFrom,$shiftTo);
			
			if ($isFrom){				
				$dt = getdate(time()-24*60*60);
				$res = mktime($shiftFrom['h'],$shiftFrom['m'],$shiftFrom['s'],$dt['mon'],$dt['mday'],$dt['year']);
			}
			else{
				$dt = getdate(time());
				$res = mktime($shiftTo['h'],$shiftTo['m'],$shiftTo['s'],$dt['mon'],$dt['mday'],$dt['year']);
			}
			return date('Y-m-d H:i:s',$res);			
		}		
		else{
			return parent::getPredefinedPeriodValue($period,$val,$isFrom);
		}
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
	static public function applyPredefinedPeriodValues(&$storage,$template){	
		if(!isset($storage)||!isset($storage['filter_data'])){
			return;
		}
		
		$sgn_keys_ar = explode(',',COND_SIGN_KEYS);
	
		$data_modif = FALSE;
		$filter_data = json_decode($storage['filter_data'],TRUE);
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
		}			
	}
	
}
