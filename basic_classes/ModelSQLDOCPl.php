<?php
require_once(FRAME_WORK_PATH.'basic_classes/ModelSQL.php');
require_once(FRAME_WORK_PATH.'basic_classes/ModelWhereSQL.php');
require_once(FRAME_WORK_PATH.'basic_classes/ModelVars.php');

class ModelSQLDOCPl extends ModelSQL{	
	public function __construct($dbLink,$options=NULL){
		parent::__construct($dbLink,$options);
	}
	
	public function insert($needId=FALSE,$row=NULL){
		//throw new Exception($this->getInsertQuery(TRUE));
		
		$view_id_set = isset($_REQUEST['view_id']);
		$view_id_for_db = "'".$_REQUEST['view_id']."'";
		//throw new Exception("view_id_for_db=".$view_id_for_db);
		
		$link = $this->getDbLink();
		$link->query('BEGIN');
		try{			
			$ids_ar = $link->query_first($this->getInsertQuery(TRUE));
			
			if ($view_id_set){
				$link->query(
					sprintf("SELECT %s_before_write(%s,%d)",
					$this->getTableName(), $view_id_for_db,
					$ids_ar['id'])
				);
			}
			
			$link->query(
				sprintf("UPDATE %s SET processed=%s WHERE id=%d",
				$this->getTableName(),$this->getFieldById('processed')->getValueForDb(),
				$ids_ar['id']));
			
			$link->query('COMMIT');
		}
		catch(Exception $e){
			$link->query('ROLLBACK');
			throw $e;
		}
		return $ids_ar['id'];
	}
	
	
	public function update(){
		$view_id_set = isset($_REQUEST['view_id']);
		$view_id_for_db = "'".$_REQUEST['view_id']."'";
		//throw new Exception("view_id_for_db=".$view_id_for_db);
		
		//$this->getFieldById('processed')->setValue(TRUE);
		
		$link = $this->getDbLink();
		$link->query('BEGIN');
		try{		
			if ($view_id_set){				
				$link->query(
					sprintf("SELECT %s_before_write(%s,%d)",
					$this->getTableName(), $view_id_for_db,
					$this->getFieldById('id')->getOldValue())
				);
			}
			
			$q = $this->getUpdateQuery();
			//throw new Exception($q);
			if ($q!=''){
				$link->query($q);
			}
			$link->query('COMMIT');
		}
		catch(Exception $e){
			$link->query('ROLLBACK');
			throw $e;
		}
	}	
	
	/* DEFAULT DATE FILTER ON JOURNALS */
	public function getJournalDefDates(&$dateFrom,&$dateTo,$paramName='date_time'){
		$template_name = get_class($this);
		$p = strpos($template_name,'_Model');
		if ($p>=0){
			$template_name = substr($template_name,0,$p);
		}
		$ar = $this->getDbLink()->query_first(sprintf(
		"WITH params AS (
			SELECT * FROM teplate_params_get_list('%s'::text, %d)
		)
		SELECT
			(SELECT val FROM params WHERE param='date_from') AS date_from,
			(SELECT val FROM params WHERE param='date_to') AS date_to",
		$template_name,
		$paramName,
		(isset($_SESSION['user_id']))? $_SESSION['user_id']:0
		));
		
		if ($ar && count($ar)){
			$dateFrom = strtotime($ar['date_from']);
			$dateTo = strtotime($ar['date_to']);
		}
	}
	public function select($insertMode=FALSE,
					$modelWhere=NULL,
					$modelOrder=NULL,
					$modelLimit=NULL,
					$fieldArray=NULL,
					$grpFieldArray=NULL,
					$aggFieldArray=NULL,
					$calcTotalCount=NULL,
					$toXML=NULL,
					$copyMode=FALSE){
		
		if (!isset($modelWhere)){
			$modelWhere = new ModelWhereSQL();
			$date_from = NULL;
			$date_to = NULL;
			$date_field = 'date_time';			
			$this->getJournalDefDates($date_from,$date_to,$date_field);
			//throw new Exception(date('d/m/Y',$date_from));
			if (!$modelWhere->getFieldsById($date_field,'>=')){
				//no date from
				$field1 = clone $this->getFieldById($date_field);
				$field1->setValue($date_from);
				$modelWhere->addField($field1,'>=');
				//throw new Exception('date_from='.$date_from);
			}
			if (!$modelWhere->getFieldsById($date_field,'<=')){
				//no date to
				$field2 = clone $this->getFieldById($date_field);
				$field2->setValue($date_to);
				$modelWhere->addField($field2,'<=');
			}
			
		}
		//throw new Exception('Where='.$modelWhere->getSQL());
		parent::select(
			$insertMode,
			$modelWhere,
			$modelOrder,
			$modelLimit,
			$fieldArray,
			$grpFieldArray,
			$aggFieldArray,
			$calcTotalCount,
			$toXML
		);
	}		
	
}
