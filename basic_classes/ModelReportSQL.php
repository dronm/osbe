<?php
//http://localhost/beton/index.php?c=Shipment_Controller&f=shipment_report&v=ViewHTMLXSLT&grp_fields=shift_descr,client_descr,concrete_descr&agg_fields=quant_shipped&cond_fields=ship_date_time,ship_date_time&cond_sgns=ge,le&cond_vals=01/06/13%2007:00:00,01/07/13%2006:59:59&cond_ic=0,0
require_once(FRAME_WORK_PATH.'basic_classes/ModelSQL.php');

class ModelReportSQL extends ModelSQL{
	const ER_NO_GROUP_SELECTED = 'Не задано ни одной группировки.';
	const ER_NO_AGG_SELECTED = 'Не задано ни одного числового значения.';
	
	public function select($insertMode=FALSE,
					$modelWhere=NULL,
					$modelOrder=NULL,
					$modelLimit=NULL,
					$fieldArray=NULL,
					$grpFieldArray=NULL,
					$aggFieldArray=NULL,
					$calcTotalCount=NULL,
					$toXML=NULL,
					$aggTypeArray=NULL
					){
		if (count($grpFieldArray)==0){
			throw new Exception(ModelReportSQL::ER_NO_GROUP_SELECTED);
		}
		if (count($aggFieldArray)==0){
			throw new Exception(ModelReportSQL::ER_NO_AGG_SELECTED);
		}
		
		$this->queryId = 0;
		$grp_q = array();
		$union_q = array();
		$grp_templ = '%s AS (SELECT %s
				FROM %s GROUP BY %s)';
		$grp_templ_tot = 'grp_totals AS
			(SELECT %s FROM %s)';
				
		//agg fields in a string
		$agg_str = implode(',',$aggFieldArray);
		$agg_str_sm = '';
		$custom_agg_funcs = ($aggTypeArray&&is_array($aggTypeArray)&&count($aggTypeArray)==count($aggFieldArray));
		$func = 'sum';
		$i = 0;
		foreach ($aggFieldArray as $agg){
			if ($custom_agg_funcs){
				$func = $aggTypeArray[$i];
			}
			$agg_str_sm.=($agg_str_sm=='')? '':',';
			$agg_str_sm.=sprintf('%s(%s) AS %s',$func,$agg,$agg);
			$i++;
		}
		
		//all grups string
		$grp_all_str = implode(',',$grpFieldArray);
		
		
		//reversed order groups
		$grp_reversed = array_reverse($grpFieldArray);
		
		$sys_level_val = 0;
		
		$orig_cnt = count($grp_reversed);
		$cnt = $orig_cnt;
		foreach ($grp_reversed as $grp){
			if ($cnt==$orig_cnt){
				//all groups
				$grp_str = $grp_all_str;
				$empty_grp_str = '';
				//base table first
				$prev_grp = $this->getDbName().'.'.$this->getTableName();
				if (isset($modelWhere)){
					$prev_grp.=' '.$modelWhere->getSQL();
				}
			}
			else{
				//part from start to current index
				$grp_str = implode(',',array_slice($grpFieldArray,0,$cnt,TRUE));
				$empty_grp_str = ','.implode(',',array_fill(0,$orig_cnt-$cnt,"''"));
			}
			array_push($grp_q,
				sprintf($grp_templ,
					'grp_'.$grp,
					$grp_str.','.$agg_str_sm,
					$prev_grp,
					$grp_str)
			);
			
			//Приведем к типу TEXT
			$grp_str_text = '';			
			$grp_ar = explode(',',$grp_str);
			foreach($grp_ar as $f){
				$grp_str_text.=($grp_str_text=='')? '':',';
				$grp_str_text.='grp_'.$grp.'.'.$f.'::text';
			}
			//throw new Exception($grp_str_text);
			array_push($union_q,
				sprintf(
				'SELECT
					%s,
					%d AS sys_level_val,
					%d AS sys_level_count
				FROM %s',
				$grp_str_text.$empty_grp_str.','.$agg_str,
				$sys_level_val,$orig_cnt,
				'grp_'.$grp)
			);
			
			$prev_grp = 'grp_'.$grp;
			
			$cnt--;
			
			$sys_level_val++;
		}
		
		//totals
		array_push($grp_q,sprintf(
			$grp_templ_tot,
			$agg_str_sm,
			$prev_grp)
		);
		array_push($union_q,
			sprintf('SELECT
				%s,
				%d AS sys_level_val,
				%d AS sys_level_count
			FROM %s',
			implode(',',array_fill(0,$orig_cnt,"''")).','.$agg_str,
			$sys_level_val,$orig_cnt,
			'grp_totals')
		);
		
		
		//make query string
		$query = sprintf('WITH %s %s ORDER BY %s',
			implode(',',$grp_q),
			implode(' UNION ',$union_q),
			$grp_all_str);
		
		//throw new Exception($query);
		if ($toXML){
			$query = str_replace("'","''",$query);
			$query = sprintf(ModelSQL::SQL_SELECT_XML,$query);
		}		
		
		$link = $this->getDbLink();
		$this->queryId = $link->query($query);
		$this->rowCount = $link->num_rows($this->queryId);
		$this->setRowBOF();				
	}
	
	public function metadataToXML(){
		$result = sprintf('<metadata modelId="%s">',$this->getId());
		foreach($this->fields as $field){
			$result.=$field->metadataToXML();
		}
		$result.='</metadata>';
		return $result;
	}
	
}
?>
