<?php
/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>
 
 * @class
 * @classdesc
 *	List model:
 *		- adds virtual model to metadata based on base model
 *
 *	List javascript view
 *		- creates javascript file _View.js and adds it to metadata if selected
 *		- creates javascript file _View.rs_{{LOCALE}}.js and adds it to metadata  
 *
 *	Create list form
 *		Creates javascript list form
 *
 *	Add list to server templates
 *		- adds list model to serverTemplates
 *
 *	Add to views
 *		- Adds list model to menu and if selected "List javascript view" adds header
 *
 *	Make controller
 *		Adds Controller to metadata on template
 * 
 * @requires Config.php
  
 */

require_once('Manager.php');
require_once('Logger.php');

class CatHelper extends Manager{

	const HELPER_DIR = 'helpers';

	const CAT_TMPL_DIR = 'cat';
	const CAT_LIST_TMPL = 'List_model_md.xml.tmplm';
	const CAT_DIALOG_TMPL = 'Dialog_model_md.xml.tmplm';
	const CAT_VIEW_LIST_TMPL = '{{BASE_MODEL_ID}}List_View.js.tmplm';
	const CAT_VIEW_DIALOG_TMPL = '{{BASE_MODEL_ID}}Dialog_View.js.tmplm';
	const CAT_FORM_LIST_TMPL = '{{BASE_MODEL_ID}}List_Form.js.tmplm';
	const CAT_FORM_DIALOG_TMPL = '{{BASE_MODEL_ID}}Dialog_Form.js.tmplm';
	const CAT_CONTROLLER_TMPL = '{{BASE_MODEL_ID}}Controller_md.xml.tmplm';

	private static $ER_BASE_MODEL_NOT_FOUND = array(
		'ru' => 'Базовая модель не найдена!'
	);
	private static $ER_BASE_MODEL_VIRTUAL = array(
		'ru' => 'Базовая модель не должна быть виртуальной!'
	);
	private static $ER_TEMPLAT_NOT_FOUND = array(
		'ru' => 'Шаблон %s не найден!'
	);
	private static $ER_JS_SCRIPTS_NOT_FOUND = array(
		'ru' => 'Тэг метаданных "jsScripts" не найден!'
	);
	private static $ER_CONTROLLERS_NOT_FOUND = array(
		'ru' => 'Тэг метаданных "Controllers" не найден!'
	);
	

	public function makeCatalogObjects(&$params){
	
		$dom = new DOMDocument();
		$dom->load($this->getMdFile());
		$xpath = new DOMXPath($dom);
		$model_collect = $xpath->query(sprintf("/metadata/models/model[@id='%s']", $params[PARAM_CAT_BASE_MODEL_ID]));		
		if (!$model_collect->length){
			throw new Exception(self::$ER_BASE_MODEL_NOT_FOUND[LOCALE]);
		}		
		$model = $model_collect->item(0);
		if ($model->getAttribute('virtual')=='TRUE'){
			throw new Exception(self::$ER_BASE_MODEL_VIRTUAL[LOCALE]);
		}
	
		$log = new Logger(dirname($this->getMdFile()).DIRECTORY_SEPARATOR.'build.log',array(
			'buildGroup' => $this->buildGroup,
			'buildFilePermission' => $this->buildFilePermission,
			'buildDirPermission' => $this->buildDirPermission,
			'logLevel' => 'error'
			)
		);

		//Params
		$LIST_MODEL = (isset($params[PARAM_CAT_LIST_MODEL]) && $params[PARAM_CAT_LIST_MODEL]=='1');
		$LIST_VIEW = (isset($params[PARAM_CAT_LIST_VIEW]) && $params[PARAM_CAT_LIST_VIEW]=='1');
		$LIST_FORM = (isset($params[PARAM_CAT_LIST_FORM]) && $params[PARAM_CAT_LIST_FORM]=='1');
		
		$DIALOG_MODEL = (isset($params[PARAM_CAT_DIALOG_MODEL]) && $params[PARAM_CAT_DIALOG_MODEL]=='1');
		$DIALOG_VIEW = (isset($params[PARAM_CAT_DIALOG_VIEW]) && $params[PARAM_CAT_DIALOG_VIEW]=='1');
		$DIALOG_FORM = (isset($params[PARAM_CAT_DIALOG_FORM]) && $params[PARAM_CAT_DIALOG_FORM]=='1');
		
		$CONTROLLER = (isset($params[PARAM_CAT_CONTROLLER]) && $params[PARAM_CAT_CONTROLLER]=='1');

		$template_params = array(
			'BASE_MODEL_ID' => $params[PARAM_CAT_BASE_MODEL_ID]
			,'PARENT_MODEL' => 'ModelSQL'
		);

		//iterate fields
		$model_fields = array();
		$template_params['FIELDS'] = array();
		$model_fields_collect = $xpath->query(sprintf("/metadata/models/model[@id='%s']/field",$params[PARAM_CAT_BASE_MODEL_ID]));		
		for($i=0;$i<$model_fields_collect->length;$i++){
			$ref_t = $model_fields_collect->item($i)->getAttribute('refTable');
			array_push($template_params['FIELDS'],array(
				'NOT_FIRST' => (count($template_params['FIELDS'])? TRUE:FALSE)
				,'FIELD_ID' => $model_fields_collect->item($i)->getAttribute('id')
				,'FIELD_DATA_TYPE' => $model_fields_collect->item($i)->getAttribute('dataType')
				,'FIELD_SQL_DATA_TYPE' => $this->getSQLDataType($model_fields_collect->item($i))
				,'FIELD_REF_TABLE' => $ref_t
				,'FIELD_NOT_REF_TABLE' => !isset($ref_t)
				,'FIELD_REF_FIELD' => $model_fields_collect->item($i)->getAttribute('refField')
				,'FIELD_ALIAS' => $model_fields_collect->item($i)->getAttribute('alias')
				,'FIELD_PRIMARY_KEY' => ($model_fields_collect->item($i)->getAttribute('primaryKey')=='TRUE')
			));
		}
	
		$m = new Mustache_Engine;
		
		$md_modif = FALSE;
		
		$cat_tmpl_dir = $this->projectDir.DIRECTORY_SEPARATOR. self::BUILD_DIR.DIRECTORY_SEPARATOR. self::TEMPL_DIR.DIRECTORY_SEPARATOR. self::HELPER_DIR.DIRECTORY_SEPARATOR. self::CAT_TMPL_DIR;

		//********** List model to metadata **********
		if($LIST_MODEL){
			$model_collect = $xpath->query(sprintf("/metadata/models/model[@id='%sList']", $params[PARAM_CAT_BASE_MODEL_ID]));
			if (!$model_collect->length){
				$log->add('Generating List catalogue model','note');
				$tmpl_f = $cat_tmpl_dir.DIRECTORY_SEPARATOR.self::CAT_LIST_TMPL;
				if(!file_exists($tmpl_f)){
					throw new Exception(sprintf(self::$ER_TEMPLAT_NOT_FOUND[LOCALE],$tmpl_f));
				}
		
				$this->appendStrToMD($dom,$model->parentNode,$m->render(file_get_contents($tmpl_f),$template_params));
			
				$md_modif = TRUE;
			}
		}	
		
		//********** Dialog model to metadata **********
		if($DIALOG_MODEL){
			$model_collect = $xpath->query(sprintf("/metadata/models/model[@id='%sDialog']", $params[PARAM_CAT_BASE_MODEL_ID]));
			if (!$model_collect->length){
				$log->add('Generating Dialog catalogue model','note');
				$tmpl_f = $cat_tmpl_dir.DIRECTORY_SEPARATOR.self::CAT_DIALOG_TMPL;
				if(!file_exists($tmpl_f)){
					throw new Exception(sprintf(self::$ER_TEMPLAT_NOT_FOUND[LOCALE],$tmpl_f));
				}
		
				$this->appendStrToMD($dom,$model->parentNode,$m->render(file_get_contents($tmpl_f),$template_params));
			
				$md_modif = TRUE;
			}
		}	
		
		//********** List View **********
		if($LIST_VIEW){
			//add to DOM if not exists
			$model_collect = $xpath->query(sprintf("/metadata/jsScripts/jsScript[@file='views/%sList_View.js']", $params[PARAM_CAT_BASE_MODEL_ID]));
			if (!$model_collect->length){
				//add js script to metadata
				$s = sprintf('<jsScript file="views/%sList_View.js" />',$params[PARAM_CAT_BASE_MODEL_ID]);
				$app_tmpl_coll = $xpath->query("/metadata/jsScripts/jsScript[@file='tmpl/App.templates.js']");
				if($app_tmpl_coll->length){
					//before templates
					$this->insertStrToMD($dom,$app_tmpl_coll->item(0),$s);
				}
				else{
					//append to jsScripts
					$js_coll = $xpath->query("/metadata/jsScripts");
					if(!$js_coll->length){
						throw new Exception(self::$ER_JS_SCRIPTS_NOT_FOUND[LOCALE]);
					}
					$this->appendStrToMD($dom,$js_coll->item(0),$s);
				}
				$md_modif = TRUE;
			}
			
			//_View file on template to OUTPUT_PATH
			$this->generateFileOnTemplate(
				$m, $log, $template_params,
				'Generating javascript list View on template',
				$cat_tmpl_dir.DIRECTORY_SEPARATOR.self::CAT_VIEW_LIST_TMPL,
				sprintf(self::CAT_VIEW_LIST_TMPL,$params[PARAM_CAT_BASE_MODEL_ID])
			);
		}
		
		//********** Dailog view **********
		if($DIALOG_VIEW){
			//add to DOM if not exists
			$model_collect = $xpath->query(sprintf("/metadata/jsScripts/jsScript[@file='views/%sDialog_View.js']", $params[PARAM_CAT_BASE_MODEL_ID]));
			if (!$model_collect->length){
				//add js script to metadata
				$s = sprintf('<jsScript file="views/%sDialog_View.js" />',$params[PARAM_CAT_BASE_MODEL_ID]);
				$app_tmpl_coll = $xpath->query("/metadata/jsScripts/jsScript[@file='tmpl/App.templates.js']");
				if($app_tmpl_coll->length){
					//before templates
					$this->insertStrToMD($dom,$app_tmpl_coll->item(0),$s);
				}
				else{
					//append to jsScripts
					$js_coll = $xpath->query("/metadata/jsScripts");
					if(!$js_coll->length){
						throw new Exception(self::$ER_JS_SCRIPTS_NOT_FOUND[LOCALE]);
					}
					$this->appendStrToMD($dom,$js_coll->item(0),$s);
				}
				$md_modif = TRUE;
			}
			
			//_View file on template to OUTPUT_PATH
			$this->generateFileOnTemplate(
				$m, $log, $template_params,
				'Generating javascript dialog View on template',
				$cat_tmpl_dir.DIRECTORY_SEPARATOR.self::CAT_VIEW_DIALOG_TMPL_TMPL,
				sprintf(self::CAT_VIEW_DIALOG_TMPL,$params[PARAM_CAT_BASE_MODEL_ID])
			);
		}	
		
		//********** List Form **********
		if($LIST_FORM){
			//add to DOM if not exists
			$model_collect = $xpath->query(sprintf("/metadata/jsScripts/jsScript[@file='views/%sList_Form.js']", $params[PARAM_CAT_BASE_MODEL_ID]));
			if (!$model_collect->length){
				//add to md
				$s = sprintf('<jsScript file="views/%sList_Form.js" />',$params[PARAM_CAT_BASE_MODEL_ID]);
				//add before views
				$app_tmpl_coll = $xpath->query("/metadata/jsScripts/jsScript[@file='tmpl/App.templates.js']");
				if($app_tmpl_coll->length){
					//before templates
					$this->insertStrToMD($dom,$app_tmpl_coll->item(0),$s);
				}
				else{
					//append to jsScripts
					$js_coll = $xpath->query("/metadata/jsScripts");
					if(!$js_coll->length){
						throw new Exception(self::$ER_JS_SCRIPTS_NOT_FOUND[LOCALE]);
					}
					$this->appendStrToMD($dom,$js_coll->item(0),$s);
				}
				$md_modif = TRUE;
			}
			
			//_View file on template to OUTPUT_PATH
			$this->generateFileOnTemplate(
				$m, $log, $template_params,
				'Generating javascript list Form on template',
				$cat_tmpl_dir.DIRECTORY_SEPARATOR.self::CAT_FORM_LIST_TMPL,
				sprintf(self::CAT_VIEW_LIST_TMPL,$params[PARAM_CAT_BASE_MODEL_ID])
			);
		}

		//********** DIALOG Form **********
		if($DIALOG_FORM){
			//add to DOM if not exists
			$model_collect = $xpath->query(sprintf("/metadata/jsScripts/jsScript[@file='views/%Dialog_Form.js']", $params[PARAM_CAT_BASE_MODEL_ID]));
			if (!$model_collect->length){
				//add to md
				$s = sprintf('<jsScript file="views/%sDialog_Form.js" />',$params[PARAM_CAT_BASE_MODEL_ID]);
				//add before views
				$app_tmpl_coll = $xpath->query("/metadata/jsScripts/jsScript[@file='tmpl/App.templates.js']");
				if($app_tmpl_coll->length){
					//before templates
					$this->insertStrToMD($dom,$app_tmpl_coll->item(0),$s);
				}
				else{
					//append to jsScripts
					$js_coll = $xpath->query("/metadata/jsScripts");
					if(!$js_coll->length){
						throw new Exception(self::$ER_JS_SCRIPTS_NOT_FOUND[LOCALE]);
					}
					$this->appendStrToMD($dom,$js_coll->item(0),$s);
				}
				$md_modif = TRUE;
			}
			
			//_View file on template to OUTPUT_PATH
			$this->generateFileOnTemplate(
				$m, $log, $template_params,
				'Generating javascript dialog Form on template',
				$cat_tmpl_dir.DIRECTORY_SEPARATOR.self::CAT_FORM_DIALOG_TMPL,
				sprintf(self::CAT_VIEW_DIALOG_TMPL,$params[PARAM_CAT_BASE_MODEL_ID])
			);
		}
		
		//********* Controller *******************
		if($CONTROLLER){
			//add to DOM if not exists
			$contr = $xpath->query(sprintf("/metadata/controllers/controller[@id='%s']", $params[PARAM_CAT_BASE_MODEL_ID]));
			if (!$contr->length){
				$log->add('Generating controller','note');
				$tmpl_f = $cat_tmpl_dir.DIRECTORY_SEPARATOR.self::CAT_CONTROLLER_TMPL;
				if(!file_exists($tmpl_f)){
					throw new Exception(sprintf(self::$ER_TEMPLAT_NOT_FOUND[LOCALE],$tmpl_f));
				}
				$contr_collect = $xpath->query('/metadata/controllers');
				if(!$contr_collect->length){
					throw new Exception(self::$ER_JCONTROLLERS_NOT_FOUND[LOCALE]);
				}
				
				$this->appendStrToMD($dom,$contr_collect->item(0),$m->render(file_get_contents($tmpl_f),$template_params));
			
				$md_modif = TRUE;			
			}
		}
	}
	
	private function generateFileOnTemplate(&$m,&$log,&$templateParams,$logNote,$tmplFile,$outFileName){
		$log->add($logNote,'note');
		if(!file_exists($tmplFile)){
			throw new Exception(sprintf(self::$ER_TEMPLAT_NOT_FOUND[LOCALE],$tmplFile));
		}
		
		echo OUTPUT_PATH.$outFileName.'</BR>';
		file_put_contents(
			$outFileName,
			$m->render(file_get_contents($tmplFile),$templateParams)
		);
	
	}
}
