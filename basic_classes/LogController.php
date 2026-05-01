<?php
require_once(FRAME_WORK_PATH.'basic_classes/PublicMethod.php');
require_once(FRAME_WORK_PATH.'basic_classes/ControllerSQL.php');
require_once(FRAME_WORK_PATH.'basic_classes/Field.php');
require_once(FRAME_WORK_PATH.'basic_classes/FieldExtInt.php');
require_once(FRAME_WORK_PATH.'basic_classes/FieldExtString.php');

/**
 * Base controller for viewing log files
 * Use derived classes, like LogPHP_Controller,LogPG_Controller
 */



require_once(FRAME_WORK_PATH.'basic_classes/Model.php');

class LogController extends ControllerSQL{

	const LOG_NOT_DEFINED = 'Лог файл не определен.';
	const LOG_NOT_FOUND = 'Лог файл отсутствует';
	const DEF_LINE_COUNT = 100;

	private $logFile;
	private $count;

	public function __construct($dbLinkMaster=NULL,$dbLink=NULL,$logFile=NULL,$modelId='LogList_Model',$count=NULL){
	
		parent::__construct($dbLinkMaster,$dbLink);
		
		$this->setLogFile($logFile);
		$this->setCount(isset($count)? $count:self::DEF_LINE_COUNT);
			
		/* get_list */
		$pm = new PublicMethod('get_list');
		
		$pm->addParam(new FieldExtInt('count'));
		$pm->addParam(new FieldExtInt('from'));
		$pm->addParam(new FieldExtString('cond_fields'));
		$pm->addParam(new FieldExtString('cond_sgns'));
		$pm->addParam(new FieldExtString('cond_vals'));
		$pm->addParam(new FieldExtString('cond_ic'));
		$pm->addParam(new FieldExtString('ord_fields'));
		$pm->addParam(new FieldExtString('ord_directs'));
		$pm->addParam(new FieldExtString('field_sep'));

		$this->addPublicMethod($pm);

		
	}	
	
	public function get_list($pm){
		
		if(!$this->logFile){
			throw new Exception(self::LOG_NOT_DEFINED);
		}
		if(!file_exists($this->logFile)){
			throw new Exception(self::LOG_NOT_FOUND);
		}
		
		$from = 0;
		if($pm->getParamValue('from')){
			$from = $this->getExtDbVal($pm,'from');
		}
		
		$count = 0;
		if($pm->getParamValue('count')){
			$count = $this->getExtDbVal($pm,'count');
		}
		else{
			$count = $this->getCount();
		}
	
		$linecount = 0;
		$handle = fopen($this->logFile, "r");
		try{
			while(!feof($handle)){
				$line = fgets($handle);
				$linecount++;
			}
			$linecount--;
			
			$from_ind = $linecount - $from - $count;
			$shown = 0;
		
			$lines_to_print = [];
			rewind($handle);
			$l = 0;
			while(!feof($handle)){
				$line = fgets($handle);
				if($shown>=$count){
					break;
				}
				else if($l >= $from_ind){
					array_push($lines_to_print,$line);
					$shown++;
				}
				$l++;
			}
			
			$model = new Model(
				array('id'=>$this->getListModelId(),
					'rowsPerPage'=>$count
				)
			);	
			$model->addField(new Field('message_text',DT_STRING));		
	
			for($i=count($lines_to_print)-1;$i>=0;$i--){
				$row = [
					new Field('message_text',DT_STRING,array('value'=>$lines_to_print[$i]))
				];
				$model->insert($row);
			}
			
			//ПОМЕНЯТЬ МОДЕЛЬ!!!
			$this->addModel($model);
		}
		finally{
			fclose($handle);
		}
	}

	public function getLogFile(){
		return $this->logFile;
	}
	public function setLogFile($logFile){
		$this->logFile = $logFile;
	}
	public function getCount(){
		return $this->count;
	}
	public function setCount($count){
		$this->count = $count;
	}
	
}
?>
