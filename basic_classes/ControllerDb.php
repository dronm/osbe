<?php
require_once(FRAME_WORK_PATH.'basic_classes/Controller.php');
require_once(FRAME_WORK_PATH.'basic_classes/FilterController.php');
require_once(FRAME_WORK_PATH.'basic_classes/Model.php');
require_once(FRAME_WORK_PATH.'basic_classes/ModelVars.php');
require_once(FRAME_WORK_PATH.'basic_classes/SessionVarManager.php');
require_once(FRAME_WORK_PATH.'basic_classes/LSNPosition.php');

if(defined('SRV_EVENT_CLASS') && defined('FUNC_PATH')){
	require_once(FUNC_PATH.SRV_EVENT_CLASS.'.php');
}

function model_loader($modelId) {
    require_once USER_MODELS_PATH.$modelId.'.php';
}
spl_autoload_register('model_loader');

/*
ф
*/
class ControllerDb extends Controller{
	/*errors*/
	const ER_NO_INSERT_MODEL = 'Insert model is not defined.';
	const ER_NO_UPDATE_MODEL = 'Update model is not defined.';
	const ER_NO_DELETE_MODEL = 'Delete model is not defined.';
	const ER_NO_LIST_MODEL = 'List model is not defined.';
	const ER_NO_OBJECT_MODEL = 'Object model is not defined.';
	const ER_NO_COMLETE_MODEL = 'Complete model is not defined.';
	/*defalt operation names*/
	const METH_INSERT = 'insert';
	const METH_UPDATE = 'update';
	const METH_DELETE = 'delete';
	const METH_GET_LIST = 'get_list';
	const METH_GET_OBJECT = 'get_object';
	const METH_COMPLETE = 'complete';
	
	private $dbLink;
	private $dbLinkMaster;
	
	private $updateModelId;
	private $insertModelId;
	private $deleteModelId;
	private $listModelId;
	private $completeModelId;
	private $objectModelId;
	
	public function __construct($dbLinkMaster=NULL, $dbLink=NULL){
		parent::__construct();
		$this->setDbLinkMaster($dbLinkMaster);
		$this->setDbLink($dbLink);
	}
	public function getDbLink(){
		//return (isset($this->dbLink))? $this->dbLink:$this->dbLinkMaster;
		return $this->getReadDbLink();
	}
	public function setDbLink($dbLink){
		$this->dbLink = $dbLink;
	}
	public function getDbLinkMaster(){
		return $this->dbLinkMaster;
	}
	public function setDbLinkMaster($dbLinkMaster){
		$this->dbLinkMaster = $dbLinkMaster;
	}
	public function getUpdateModelId(){
		return $this->updateModelId;
	}
	public function setUpdateModelId($updateModelId){
		$this->updateModelId = $updateModelId;
	}
	public function getInsertModelId(){
		return $this->insertModelId;
	}
	public function setInsertModelId($insertModelId){
		$this->insertModelId = $insertModelId;
	}
	public function getDeleteModelId(){
		return $this->deleteModelId;
	}
	public function getCompleteModelId(){
		return $this->completeModelId;
	}	
	public function setDeleteModelId($deleteModelId){
		$this->deleteModelId = $deleteModelId;
	}
	public function setCompleteModelId($modelId){
		$this->completeModelId = $modelId;
	}
	
	public function getListModelId(){
		return $this->listModelId;
	}
	public function setListModelId($listModelId){
		$this->listModelId = $listModelId;
	}
	public function getObjectModelId(){
		return $this->objectModelId;
	}
	public function setObjectModelId($objectModelId){
		$this->objectModelId = $objectModelId;
	}

	/*
		model functions
	*/	
	public function modelGetList($model){		
		$this->beforeSelect();
		$this->addModel($model);		
		$this->afterSelect();	
	}
	
	public function modelGetObject($model){
		$this->beforeSelect();
		$model->select();
		$this->addModel($model);		
		$this->afterSelect();		
	}
	
	/*
		executes insert on a given model
		gets params from insert public method
	*/
	public function modelInsert($model,$needId=FALSE){
		$this->beforeInsert();
		$this->methodParamsToModel(
			$this->getPublicMethod(ControllerDb::METH_INSERT),
			$model);
		$ret = $model->insert($needId);
		$this->afterInsert();
		return $ret;
	}

	/*
		executes update on a given model
		gets params from update public method
	*/	
	public function modelUpdate($model){		
		$this->methodParamsToModel(
			$this->getPublicMethod(ControllerDb::METH_UPDATE),
			$model
		);
		$model->update();		
	}
	
	/*
		executes delete on a given model
		gets params from delete public method
	*/		
	public function modelDelete($model){
		$this->beforeDelete();
		$this->methodParamsToModel(
			$this->getPublicMethod(ControllerDb::METH_DELETE),
			$model);
		$model->delete();
		$this->afterDelete();
	}

	public function modelComplete($model){
		$this->methodParamsToModel(
			$this->getPublicMethod(ControllerDb::METH_COMPLETE),
			$model);
		$pm = $this->getPublicMethod(ControllerDb::METH_COMPLETE);
		$count = $pm->getParamValue('count');
		$ic = $pm->getParamValue('ic');
		$mid = $pm->getParamValue('mid');
		$model->complete($count,$ic,$mid,true);
	}
	
	/* ToDo
	*/
	public function modelUnSetFilter($modelId){
		FilterController::delete(get_class($this),$modelId);
	}
	
	/* events */
	public function beforeInsert(){
	}
	public function afterInsert(){
	}
	public function beforeUpdate(){
	}
	public function afterUpdate(){
	}
	public function beforeDelete(){
	}
	public function afterDelete(){
	}
	public function beforeSelect(){
	}
	public function afterSelect(){
	}
	public function beforeSetFilter(){
	}
	public function afterSetFilter(){
	}
	public function beforeUnSetFilter(){
	}
	public function afterUnSetFilter(){
	}
	
	/**
	 *	public method realization
	 */
	
	public function addInsertedIdModel($insertedIdAr){
		$fields = array();
		foreach($insertedIdAr as $key=>$val){
			array_push($fields, new Field($key,DT_STRING,array('value'=>$val)));
		}
		$this->addModel(new ModelVars(
				array('id'=>'InsertedId_Model', 'values'=>$fields)
			)
		);
	}
	
	/**
	 *	Makes insert command on a model defined
	 *	in insertModelId
	 */
	public function insert($pm){
		if (!$this->getStatelessClient()){
			//STATE client - ajax
			$model_id = $this->getInsertModelId();
			if (!isset($model_id)){
				throw new Exception(self::ER_NO_INSERT_MODEL);
			}
			//$pm = $this->getPublicMethod(ControllerDb::METH_INSERT);
			$need_id = ($pm->getParamValue('ret_id')==1);
			$model = new $model_id($this->getDbLinkMaster());
			
			//always return inserted ids
			$inserted_id_ar = $this->modelInsert($model,TRUE);//$need_id

			//last inserted id
			$this->addInsertedIdModel($inserted_id_ar);

			//add lsn this methos is deprecated
			$lsn = $this->addLsnModel();

			//event
			if(defined('SRV_EVENT_CLASS')
			&& !$pm->getEventsFired()
			){
				$events = $pm->getEventIterator();
				if(!is_null($events)){
					while($events->valid()) {
						$event = $events->current();			
						if(!isset($event['dbTrigger']) || $event['dbTrigger']===FALSE){
							//trigger event
							$event_par = $inserted_id_ar;
							$event_par['emitterId'] = SessionVarManager::getEmitterId();//eventServerClientId
							$cl = SRV_EVENT_CLASS;
							if(!is_null($lsn)){
								$event_par['lsn'] = $lsn;
							}
							$cl::publishAsync($events->key(),$event_par);
						}
						$events->next();
					}
				}
				$pm->setEventsFired(TRUE);
			}

			/*
			$this->addModel(new ModelVars(
				array('id'=>'InsertedId_Model',
					'values'=>$fields)
				)
			);
			*/
			//depricated			
			if ($need_id){
				$fields = array();
				foreach($inserted_id_ar as $key=>$val){
					array_push($fields,new Field($key,DT_STRING,array('value'=>$val)));
				}			
				//last inserted id
				$this->addModel(new ModelVars(
					array('id'=>'LastIds',
						'values'=>$fields)
					)
				);				
			}
			
			return $inserted_id_ar;
			
		}
		else{
			//no state client - HTTP
			$e = NULL;
			$list_model_name = $this->getListModelId();
			if (!isset($list_model_name)){
				throw new Exception(ControllerDb::ER_NO_LIST_MODEL);
			}
			$list_model = new $list_model_name($this->getDbLink());
			try{
				$insert_model_name = $this->getInsertModelId();
				if (!isset($insert_model_name)){
					throw new Exception(ControllerDb::ER_NO_INSERT_MODEL);
				}						
				$this->modelInsert(
					new $insert_model_name($this->getDbLinkMaster()));				
				//TODo count id position
				$this->getPublicMethod(
					ControllerDb::METH_GET_LIST)->setParamValue(
						'browse_mode',BROWSE_MODE_VIEW);
				$this->modelGetList($list_model);				
			}
			catch (Exception $e){
				$obj_mode = ($meth_update->getParamValue('obj_mode')==1);
				if ($obj_mode){
					//object mode
					$object_model_name = $this->getObjectModelId();
					if (!isset($object_model_name)){
						throw new Exception(ControllerDb::ER_NO_OBJECT_MODEL);
					}											
					$this->getPublicMethod(
						ControllerDb::METH_GET_OBJECT)->setParamValue(
						'browse_mode',BROWSE_MODE_INSERT);					
					$object_model = new $object_model_name($this->getDbLink());
					$this->modelGetObject($object_model);								
					$select_model = &$object_model;
				}
				else{
					$this->getPublicMethod(
						ControllerDb::METH_GET_LIST)->setParamValue(
						'browse_mode',BROWSE_MODE_INSERT);									
					$select_model = &$list_model;
				}
				$fields = $select_model->getFieldIterator();
				//copy all params
				foreach ($paramsArray as $name=>$val){
					if ($select_model->fieldExists($name)){
						$select_model->getFieldById($name)->setDefaultValue($val);
					}
					else if ($select_model->lookUpFieldExists($name)){
						$select_model->getLookUpFieldById($name)->setDefaultValue($val);
					}
				}
				while ($fields->valid()){
					if ($fields->current()->getFastEdit()){
						$model_name = $fields->current()->getFastEditModelId();
						$model = new $model_name($this->getDbLink());
						$model->select();
						$this->addModel($model);						
					}
					$fields->next();
				}
			}						
			//exit with error if any
			if (!is_null($e))
				throw new Exception($e->getMessage());
			
		}
	}
	
	// actually it adds lsn position to the header and returns it
	// no model is added from 28/03/26.
	// Client check LSN position based on header, not payload.
	public function addLsnModel(){
		/*		
		$ar = $this->getDbLinkMaster()->query_first("SELECT pg_current_wal_lsn() AS lsn");
		if(is_array($ar) && count($ar) && isset($ar['lsn'])){
			$fields = array(new Field('lsn', DT_STRING, array('value' => $ar['lsn'])));
			$this->addModel(new ModelVars(
					array('id'=>'MethodResult', 'values'=>$fields)
				)
			);
			return $ar['lsn'];
		}
		*/
		
		$lsn = LSNPosition::add($this->getDbLinkMaster());
		$fields = array(new Field('lsn', DT_STRING, array('value' => $lsn)));
		$this->addModel(new ModelVars(
				array('id'=>'MethodResult', 'values'=>$fields)
			)
		);		
		return $lsn;
	}
	
	
	public function update($pm){
		if (!$this->getStatelessClient()){
			//STATE client - ajax		
			$model_name = $this->getUpdateModelId();
			if (!isset($model_name)){
				throw new Exception(self::ER_NO_INSERT_MODEL);
			}
			$model = new $model_name($this->getDbLinkMaster());
			$this->modelUpdate($model);	
			
			//add lsn
			$lsn = $this->addLsnModel();
			
			//event
			if(defined('SRV_EVENT_CLASS')
			&& !$pm->getEventsFired()
			){
				$events = $pm->getEventIterator();
				if(!is_null($events)){
					while($events->valid()) {
						$event = $events->current();			
						if(!isset($event['dbTrigger']) || $event['dbTrigger']===FALSE){
							//trigger event
							$event_par = array('emitterId'=>SessionVarManager::getEmitterId());
							//keys to params old_
							$fields = $model->getFieldIterator();
							while($fields->valid()) {
								$field = $fields->current();
								if ($field->getFieldType()==FT_DATA){
									if(!is_null($v = $field->getOldValue())){
										$event_par[$field->getId()] = $v;
									}
								}
								$fields->next();
							}							
							$cl = SRV_EVENT_CLASS;
							if(!is_null($lsn)){
								$event_par['lsn'] = $lsn;
							}
							$cl::publishAsync($events->key(), $event_par);
						}
						$events->next();
					}
				}
				$pm->setEventsFired(TRUE);
			}
		}
		else{
			/**
			 * Depricated not used
			 */
			$e = NULL;
			//$meth_update = $this->getPublicMethod(ControllerDb::METH_UPDATE);			
			$list_model_name = $this->getListModelId();							
			if (!isset($list_model_name)){
				throw new Exception(ControllerDb::ER_NO_LIST_MODEL);
			}
			try{				
				$update_model_name = $this->getUpdateModelId();
				if (!isset($update_model_name)){
					throw new Exception(ControllerDb::ER_NO_UPDATE_MODEL);
				}
				$update_model = new $update_model_name($this->getDbLinkMaster());			
				$this->modelUpdate($update_model);
				$browse_mode = BROWSE_MODE_VIEW;
				$list_model = new $list_model_name($this->getDbLink());
				$meth_get_list = $this->getPublicMethod(
					ControllerDb::METH_GET_LIST);
				$meth_get_list->setParamValue(
					'browse_mode',$browse_mode);
				//copy params values from update method
				$meth_get_list->setParamValue(
					'from',
					$pm->getParamValue('from'));								
				$this->modelGetList($list_model);
			}
			catch (Exception $e){
				$browse_mode = BROWSE_MODE_EDIT;
				/* if error - always edit mode */
				$obj_mode = ($pm->getParamValue('obj_mode')==1);
				if ($obj_mode){
					//object mode
					$object_model_name = $this->getObjectModelId();
					if (!isset($object_model_name)){
						throw new Exception(ControllerDb::ER_NO_OBJECT_MODEL);
					}											
					$this->getPublicMethod(
						ControllerDb::METH_GET_OBJECT)->setParamValue(
						'browse_mode',$browse_mode);					
					$object_model = new $object_model_name($this->getDbLink());
					//ToDo multy id
					$object_model->setParamValue('browse_id',
						$pm->getParamValue('old_id')
					);
					$this->modelGetObject($object_model);								
					$fields = $object_model->getFieldIterator();
				}
				else{
					$list_model = new $list_model_name($this->getDbLink());
					$meth_get_list = $this->getPublicMethod(
						ControllerDb::METH_GET_LIST);
					$meth_get_list->setParamValue(
						'browse_mode',$browse_mode);
					//copy params values from update method
					$meth_get_list->setParamValue(
						'from',
						$pm->getParamValue('from'));								
						
					$this->modelGetList($list_model);
					$fields = $list_model->getFieldIterator();
				}
				while ($fields->valid()){
					if ($fields->current()->getFastEdit()){
						$model_name = $fields->current()->getFastEditModelId();
						$model = new $model_name($this->getDbLink());
						$model->select();
						$this->addModel($model);						
					}
					$fields->next();
				}				
			}
			
			if (!is_null($e))
				throw new Exception($e->getMessage());		
		
		}
	}
	
	public function delete($pm){
		if (!$this->getStatelessClient()){
			$model_name = $this->getDeleteModelId();
			if (!isset($model_name)){
				throw new Exception(ControllerDb::ER_NO_DELETE_MODEL);
			}
			$model = new $model_name($this->getDbLinkMaster());
			$this->modelDelete($model);	
			
			//add lsn
			$lsn = $this->addLsnModel();
			
			//event
			if(defined('SRV_EVENT_CLASS')
			&& !$pm->getEventsFired()
			){				
				$events = $pm->getEventIterator();
				if(!is_null($events)){
					while($events->valid()) {
						$event = $events->current();			
						if(!isset($event['dbTrigger']) || $event['dbTrigger']===FALSE){
							//trigger event
							$event_par = array('emitterId'=>SessionVarManager::getEmitterId());
							//keys to params old_
							$fields = $model->getFieldIterator();
							while($fields->valid()){
								$field = $fields->current();
								if ($field->getFieldType()==FT_DATA
								&& !is_null($v=$field->getValue())
								){
									$event_par[$field->getId()] = $v;
								}
								$fields->next();
							}
							$cl = SRV_EVENT_CLASS;
							if(!is_null($lsn)){
								$event_par['lsn'] = $lsn;
							}
							$cl::publishAsync($events->key(),$event_par);
							
						}
						$events->next();
					}
				}
				$pm->setEventsFired(TRUE);
			}
		}
		else{
			/**
			 * Depricated not used
			 */		
			$e = NULL;
			try{
				$model_name = $this->getDeleteModelId();
				if (!isset($model_name)){
					throw new Exception(ControllerDb::ER_NO_DELETE_MODEL);
				}			
				$this->modelDelete(new $model_name($this->getDbLinkMaster()));
			}
			catch (Exception $e){
			}
			$list_model_name = $this->getListModelId();
			if (!isset($list_model_name)){
				throw new Exception(ControllerDb::ER_NO_LIST_MODEL);
			}			
			//copy params values from delete method
			$this->getPublicMethod(
				ControllerDb::METH_GET_LIST)->setParamValue(
					'from',
					$this->getPublicMethod(
					ControllerDb::METH_DELETE)->getParamValue(
					'from')
					);
			
			$list_model = new $list_model_name($this->getDbLink());
			$this->modelGetList($list_model);
			
			if (!is_null($e))
				throw new Exception($e->getMessage());						
		}
	}
	
	//smart data aware server based on lsn (wal log position)
	public function getReadDbLink(){
		$data_srv = null;

		$lsn = NULL;
		if ( isset($_REQUEST['lsn']) ) {
			$lsn = $_REQUEST['lsn']; //priority, comes from other inserts
		}
		if ( is_null($lsn) || !isset($lsn) || $lsn === 'null' ) {
			$lsn = LSNPosition::getRequestHeader();
		}

		if (isset($lsn)) {
			$lsn = trim($lsn);
		}

		if (isset($lsn) && strlen($lsn) && $lsn !== 'null') {
			// validate LSN format: HEX/HEX
			if (!preg_match('/^[0-9A-Fa-f]+\/[0-9A-Fa-f]+$/', $lsn)) {
				$lsn = null;
			}
		}
//file_put_contents('/home/andrey/www/htdocs/beton_new/output/lsn.txt', date('Y-m-dTH:i:s').' getReadDbLink LSN:'.$lsn.PHP_EOL, FILE_APPEND);
		if (isset($lsn) && $lsn !== 'null' && $this->dbLink &&
			($this->dbLink->host != $this->dbLinkMaster->host || $this->dbLink->port != $this->dbLinkMaster->port)
		) {
			$tries = 3;

			while ($tries > 0) {
				$ar = $this->dbLink->query_first(sprintf(
					"SELECT (
						coalesce(
							pg_wal_lsn_diff(pg_last_wal_replay_lsn(), '%s'),
							-1::numeric
						) >= 0
					) AS suits",
					$lsn
				));
//file_put_contents('/home/andrey/www/htdocs/beton_new/output/lsn.txt', date('Y-m-dTH:i:s').' pg_wal_lsn_diff LSN:'.$lsn.PHP_EOL, FILE_APPEND);

				if (!is_array($ar) || !count($ar) || !isset($ar['suits'])) {
					break;
				}

				if ($ar['suits'] == 't') {
					$data_srv = $this->dbLink;
					break;
				}

				usleep(100000); // 100 ms
				$tries--;
			}
		}
		else {
			// if no lsn requirement then slave is a priority
			$data_srv = $this->dbLink;
		}

		if (is_null($data_srv)) {
			$data_srv = $this->dbLinkMaster;
		}

		return $data_srv;
	}
		
	public function get_list($pm){
		$model_name = $this->getListModelId();
		if (!isset($model_name)){
			throw new Exception(ControllerDb::ER_NO_LIST_MODEL);
		}
		$list_model = new $model_name($this->getDbLink());//
		$this->modelGetList($list_model,$pm);
		/*
		if (isset($_REQUEST['t'])){
			$this->addNewModel(sprintf("SELECT
				param AS paramId,
				param_type,
				val
			FROM teplate_params_get_list('%s'::text, %d)",
			$_REQUEST['t'],
			(isset($_SESSION['user_id']))? $_SESSION['user_id']:0
			),
			'TemplateParamValList_Model'
			);					
		}
		*/
		if (!$this->getStatelessClient()){
		}
		else{
			//all select fields
			/*
			$browse_mode = $this->getPublicMethod(
				ControllerDb::METH_GET_LIST)->getParamValue(
				'browse_mode');
			*/
			$browse_mode = $pm->getParamValue('browse_mode');
			if ($browse_mode!=BROWSE_MODE_VIEW){
				$fields = $list_model->getFieldIterator();
				while ($fields->valid()){
					if ($fields->current()->getFastEdit()){
						$model_name = $fields->current()->getFastEditModelId();
						$model = new $model_name($this->getDbLink());
						$model->select();
						$this->addModel($model);						
					}
					$fields->next();
				}							
			}
		}
	}
	
	public function get_object($pm){
		$model_name = $this->getObjectModelId();
		if (!isset($model_name)){
			throw new Exception(ControllerDb::ER_NO_OBJECT_MODEL);
		}
		$object_model = new $model_name($this->getDbLink());
		$this->modelGetObject($object_model,$pm);	
		if (!$this->getStatelessClient()){
		}
		else{
			//all select fields
			/*
			$browse_mode = $this->getPublicMethod(
				ControllerDb::METH_GET_OBJECT)->getParamValue(
				'browse_mode');
			*/
			$browse_mode = $pm->getParamValue('browse_mode');
			if ($browse_mode!=BROWSE_MODE_VIEW){
				$fields = $list_model->getFieldIterator();
				while ($fields->valid()){
					if ($fields->current()->getFastEdit()){
						$model_name = $fields->current()->getFastEditModelId();
						$model = new $model_name($this->getDbLink());
						$model->select();
						$this->addModel($model);						
					}
					$fields->next();
				}							
			}
		}
		
	}
	
	//extra params for stateless client
	public function setStatelessClient($statelessClient){
		parent::setStatelessClient($statelessClient);
		if ($statelessClient){
			if ($this->checkPublicMethod(ControllerDb::METH_INSERT)){
				$pm = $this->publicMethods[ControllerDb::METH_INSERT];
				$pm->addParam(new FieldExtInt('obj_mode'));
				$pm->addParam(new FieldExtInt('from'));				
			}
			if ($this->checkPublicMethod(ControllerDb::METH_UPDATE)){
				$pm = $this->publicMethods[ControllerDb::METH_UPDATE];
				$pm->addParam(new FieldExtInt('obj_mode'));
				$pm->addParam(new FieldExtInt('from'));				
			}
			if ($this->checkPublicMethod(ControllerDb::METH_DELETE)){
				$pm = $this->publicMethods[ControllerDb::METH_DELETE];
				$pm->addParam(new FieldExtInt('from'));
			}
			if ($this->checkPublicMethod(ControllerDb::METH_GET_LIST)){
				$pm = $this->publicMethods[ControllerDb::METH_GET_LIST];
			}
			if ($this->checkPublicMethod(ControllerDb::METH_GET_OBJECT)){
				$pm = $this->publicMethods[ControllerDb::METH_GET_OBJECT];
			}
			
		}
	}
	public function complete($pm){
		$model_name = $this->getCompleteModelId();
		if (!isset($model_name)){
			throw new Exception(ControllerDb::ER_NO_COMLETE_MODEL);
		}
		$model = new $model_name($this->getDbLink());
		$this->modelComplete($model);		
		$this->addModel($model);
	}
	
}
?>
