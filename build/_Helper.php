<?php
/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>
 
 * @class
 * @classdesc Manages all pakcage operations
 
 * @requires Config.php
  
 */

require_once('Manager.php');


class Helper extends Manager{

	const TEMPLATES_DIR = 'helper_templates';
	const TMPL_MODEL = 'Model.tmpl';

	private static $ER_BASE_MODEL_NOT_FOUND = array(
		'ru' => 'Базовая модель не найдена!'
	);
	private static $ER_BASE_MODEL_VIRTUAL = array(
		'ru' => 'Базовая модель не должна быть виртуальной!'
	);
	private static $ER_REF_KEY_COUNT_DIFFER = array(
		'ru' => "Количество ключевых полей таблицы '%s' отличается от базовой модели."
	);
	private static $ER_TMPL_MODEL_MISSING = array(
		'ru' => "Шаблон для модели не найден в каталоге %s";
	);

	private static get_param_bool_val(&$params,$id){
		return (isset($params[$id]) && $params[$id]=='1');
	}

	public function makeCatalogObjects(&$params){
		$dom = new DOMDocument();
		$dom->load($this->getMdFile());
		$xpath = new DOMXPath($dom);
		$model_collect = $xpath->query(sprintf("/metadata/models/model[@id='%s']", $params[PARAM_BASE_MODEL_ID]));		
		if (!$model_collect->length){
			throw new Exception(self::$ER_BASE_MODEL_NOT_FOUND[LOCALE]);
		}		
		$model = $model_collect->item(0);
		if ($model->getAttribute('virtual')=='TRUE'){
			throw new Exception(self::$ER_BASE_MODEL_VIRTUAL[LOCALE]);
		}
	
		//parameters
		$LIST_VIEW = self::get_param_bool_val($params,PARAM_LIST_VIEW);
		$LIST_MODEL = self::get_param_bool_val($params,PARAM_LIST_MODEL);
		$LIST_FORM = self::get_param_bool_val($params,PARAM_LIST_FORM);
		$LIST_TEMPLATE = self::get_param_bool_val($params,PARAM_LIST_SRV_TEMPLATE);
		$DLG_VIEW = self::get_param_bool_val($params,PARAM_DIALOG_VIEW);
		$DLG_MODEL = self::get_param_bool_val($params,PARAM_DIALOG_MODEL);
		$DLG_FORM = self::get_param_bool_val($params,PARAM_DIALOG_FORM);
		$DLG_TEMPLATE = self::get_param_bool_val($params,PARAM_DIALOG_SRV_TEMPLATE);
		
		$CONTROLLER = self::get_param_bool_val($params,PARAM_ADD_CONTROLLER);
		$VIEWS =  self::get_param_bool_val($params,PARAM_VIEWS);
		
		$base_model_id = $params[PARAM_BASE_MODEL_ID];
		
		if($LIST_MODEL){
			if($fl=self::TEMPLATES_DIR.DIRECTORY_SEPARATOR.self::TMPL_MODEL){
				throw new Exception(self::$ER_REF_KEY_COUNT_DIFFER[LOCALE])
			}
			
			$fields = [];
			$model_f_collect = $xpath->query(sprintf("/metadata/models/model[@id='%s']/field",$base_model_id));		
			for($i=0;$i<$model_f_collect->length;$i++){
				$f_attrs = $model_f_collect->item($i)->attributes();
				$fields_attrs = [
					'id' => $f_attrs->id,
					'' => $f_attrs->dataType
				];
				foreach($f_attrs as $f_attr_id=>$f_attr_v){
					array_push($fields_attrs,array(
						$f_attr_id => $f_attr_v
					));
			
				}
				array_push($fields,$fields_attrs);
			}
						
			$tmpl_params = [
				'id' => $base_model_id.'List',
				'dataTable' => $model->getAttribute('dataTable').'_list',
				'virtual' => 'TRUE',
				'fields' => $fields
			];
			$m = new Mustache_Engine;
			$model_xml = simplexml_load_string($m->render(file_get_contents($fl),$tmpl_params));
		}
	}
}

?>
