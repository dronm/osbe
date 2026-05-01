<?php
/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>
 
 * @class
 * @classdesc Manages all pakcage operations
 
 * @requires Config.php
  
 */

require_once('Manager.php');
require_once('Logger.php');

class RegHelper extends Manager{
	
	const HELPER_DIR = 'helpers';
	const REG_TMPL_DIR = 'reg';
	const REG_RG_TMPL = 'RG_model_md.xml.tmplm';

	private static $ER_BASE_MODEL_NOT_FOUND = array(
		'ru' => 'Модель движений регистра не найдена!'
	);
	private static $ER_BASE_MODEL_VIRTUAL = array(
		'ru' => 'Базовая модель не должна быть виртуальной!'
	);
	private static $ER_BASE_MODEL_NOT_RA = array(
		'ru' => 'Базовая модель должна иметь атрибут  modelType=RA!'
	);
	private static $ER_BASE_MODEL_NO_REG_TYPE = array(
		'ru' => 'Базовая модель должна иметь атрибут  regTypeId с указанием идентификатора регистра!'
	);
	private static $ER_TEMPLAT_NOT_FOUND = array(
		'ru' => 'Шаблон %s не найден!'
	);
	

	public function getSQLDataType($fieldNode){
		$d_tp = $fieldNode->getAttribute('dataType');
		if($d_tp=='Int'){
			$res = 'int';
		}
		else if($d_tp=='BigInt'){
			$res = 'bigint';
		}
		else if($d_tp=='SmallInt'){
			$res = 'smallint';
		}
		else if($d_tp=='String'||$d_tp=='Password'){
			$res = 'varchar('.$fieldNode->getAttribute('length').')';
		}
		else if($d_tp=='Char'){
			$res = 'varchar(1)';
		}
		else if($d_tp=='Bool'||$d_tp=='Boolean'){
			$res = 'bool';
		}
		else if($d_tp=='Date'){
			$res = 'bool';
		}
		else if($d_tp=='DateTime'){
			$res = 'timestamp';
		}
		else if($d_tp=='DateTimeTZ'){
			$res = 'timestampTZ';
		}
		else if($d_tp=='Time'){
			$res = 'time';
		}
		else if($d_tp=='TimeTZ'){
			$res = 'timeTZ';
		}
		else if($d_tp=='Text'){
			$res = 'text';
		}
		else if($d_tp=='Interval'){
			$res = 'interval';
		}
		else if($d_tp=='XML'){
			$res = 'xml';
		}
		else if($d_tp=='JSON'){
			$res = 'json';
		}
		else if($d_tp=='JSONB'){
			$res = 'jsonb';
		}
		else if($d_tp=='Numeric'||$d_tp=='Float'){
			$res = 'numeric('.$fieldNode->getAttribute('length').','.$fieldNode->getAttribute('precision').')';
		}
		else if($d_tp=='Bytea'){
			$res = 'bytea';
		}
		else if($d_tp=='GeomPoint'){
			$res = 'geometry';
		}
		else if($d_tp=='GeomPolygon'){
			$res = 'geometry';
		}
		else if($d_tp=='TSVector'){
			$res = 'tsvector';
		}
		else if($d_tp=='Array'){
			$res = $fieldNode->getAttribute('enumId').'[]';
		}
		else if($d_tp=='Enum'){
			$res = $fieldNode->getAttribute('arrayType').'[]';
		}
		
		return $res;
	}

	public function makeRegisterObjects(&$params){	
		$dom = new DOMDocument();
		$dom->load($this->getMdFile());
		$xpath = new DOMXPath($dom);
		$model_collect = $xpath->query(sprintf("/metadata/models/model[@id='%s']", $params[PARAM_RA_MODEL_ID]));		
		if (!$model_collect->length){
			throw new Exception(self::$ER_BASE_MODEL_NOT_FOUND[LOCALE]);
		}		
		$model = $model_collect->item(0);
		if ($model->getAttribute('virtual')!='FALSE'){
			throw new Exception(self::$ER_BASE_MODEL_VIRTUAL[LOCALE]);
		}
		if ($model->getAttribute('modelType')!='RA'){
			throw new Exception(self::$ER_BASE_MODEL_NOT_RA[LOCALE]);
		}
		$base_reg_type_id = $model->getAttribute('regTypeId');
		if (is_null($base_reg_type_id)||!isset($base_reg_type_id)){
			throw new Exception(self::$ER_BASE_MODEL_NO_REG_TYPE[LOCALE]);
		}
		
		$reg_id = substr($model->getAttribute('id'),2);//Skeep RA
		$reg_type_id = $model->getAttribute('regTypeId');
		
		$metadata_collect = $xpath->query("/metadata");				
		$template_params = array(
			'SCHEMA' => $metadata_collect->item(0)->getAttribute('dataSchema')
			,'REG_MODEL_ID' => $reg_id
			,'REG_ID' => $reg_type_id
			,'REG_TABLE' => substr($model->getAttribute('dataTable'),3)//Skeep ra_
			,'BALANCE_PERIOD' => '1 month'
			,'PARENT_MODEL' => 'ModelSQL'
		);
		
		$log = new Logger(dirname($this->getMdFile()).DIRECTORY_SEPARATOR.'build.log',array(
			'buildGroup' => $this->buildGroup,
			'buildFilePermission' => $this->buildFilePermission,
			'buildDirPermission' => $this->buildDirPermission,
			'logLevel' => 'error'
			)
		);
		
		//iterate fields
		$model_fields = array();
		$template_params['DIMENSIONS'] = array();
		$template_params['FACTS'] = array();
		$model_fields_collect = $xpath->query(sprintf("/metadata/models/model[@id='%s']/field",$params[PARAM_RA_MODEL_ID]));		
		for($i=0;$i<$model_fields_collect->length;$i++){
			$f_type = $model_fields_collect->item($i)->getAttribute('regFieldType');
			if($f_type=="dimension"){
				array_push($template_params['DIMENSIONS'],array(
					'NOT_FIRST' => (count($template_params['DIMENSIONS'])? TRUE:FALSE)
					,'FIELD_ID' => $model_fields_collect->item($i)->getAttribute('id')
					,'FIELD_DATA_TYPE' => $model_fields_collect->item($i)->getAttribute('dataType')
					,'FIELD_SQL_DATA_TYPE' => $this->getSQLDataType($model_fields_collect->item($i))
					,'FIELD_REF_TABLE' => $model_fields_collect->item($i)->getAttribute('refTable')
					,'FIELD_REF_FIELD' => $model_fields_collect->item($i)->getAttribute('refField')
					,'FIELD_ALIAS' => $model_fields_collect->item($i)->getAttribute('alias')
				));
			}
			else if ($f_type=='fact'){
				array_push($template_params['FACTS'],array(
					'NOT_FIRST' => (count($template_params['FACTS'])? TRUE:FALSE)
					,'FIELD_ID' => $model_fields_collect->item($i)->getAttribute('id')
					,'FIELD_DATA_TYPE' => $model_fields_collect->item($i)->getAttribute('dataType')
					,'FIELD_ALIAS' => $model_fields_collect->item($i)->getAttribute('alias')
					,'FIELD_SQL_DATA_TYPE' => $this->getSQLDataType($model_fields_collect->item($i))
				));
			}
		}
		
		$m = new Mustache_Engine;
		
		$md_modif = FALSE;
		
		$reg_tmpl_dir = $this->projectDir.DIRECTORY_SEPARATOR. self::BUILD_DIR.DIRECTORY_SEPARATOR. self::TEMPL_DIR.DIRECTORY_SEPARATOR. self::HELPER_DIR.DIRECTORY_SEPARATOR. self::REG_TMPL_DIR;
		
		//RG
		$model_collect = $xpath->query(sprintf("/metadata/models/model[@id='RG%s']", $reg_id));		
		if (!$model_collect->length){
			$log->add('Generating RG model','note');
			$tmpl_f = $reg_tmpl_dir.DIRECTORY_SEPARATOR.self::REG_RG_TMPL;
			if(!file_exists($tmpl_f)){
				throw new Exception(sprintf(self::$ER_TEMPLAT_NOT_FOUND[LOCALE],$tmpl_f));
			}
		
			$this->insertStrToMD($dom,$model,$m->render(file_get_contents($tmpl_f),$template_params));
			
			$md_modif = TRUE;
		}
		else{
			$log->add('RG model exists','note');
		}
		
		//All sql templates
		foreach (glob($reg_tmpl_dir.DIRECTORY_SEPARATOR."*.sql.tmplm") as $filename) {
			$corrected_filename = $m->render(basename($filename),$template_params);
			$corrected_filename = substr($corrected_filename,0,strlen($corrected_filename)-6);//.tmplm
			echo OUTPUT_PATH.$corrected_filename.'</BR>';
			file_put_contents(
				OUTPUT_PATH.$corrected_filename,
				$m->render(file_get_contents($filename),$template_params)
			);
		}
			
		if($md_modif){
			//md backup
			$this->str_to_file($this->getMdFile().'.backup',file_get_contents($this->getMdFile()));
			self::saveDOM($dom,$this->getMdFile());
		}		
	}	
}

?>
