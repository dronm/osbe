<?php
/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>
 
 * @class
 * @classdesc Manages all project operations
 
 * @requires Config.php
  
 */

require_once('Manager.php');

/* GIT repository */
require_once('Git.php-master/Git.php');	

class ProjectManager extends Manager{

	const ER_NO_GIT_USER = 'GIT user is not defined!';

	const TEPL_FILE_EXT = '.proj-tmpl';	
	const TEPLM_FILE_EXT = '.proj-tmplm';//Mustache template		
	const VERS_FILE_NAME = 'version.php';
	const CONFIG_FILE_NAME = 'Config.php';
	const README_FILE_NAME = 'README.md';
	
	const INIT_DB_SU_FILE_NAME = 'init_db_superuser.sql';
			
	const CONTROLLERS_DIR = 'controllers';
	const MODELS_DIR = 'models';
	const VIEWS_DIR = 'views';
	const TMPL_DIR = 'tmpl';
	const FUNC_DIR = 'functions';
	const PERM_DIR = 'permissions';
	const CSS_DIR = 'css';
	const DB_DIR = 'db';
	const DOC_DIR = 'doc';
	
	const UPDATES_DIR = 'updates';
	const JS_ENUM_DIR = 'enum_controls';
	const JS_CUSTOM_DIR = 'custom_controls';
	
	const APP_JS_TMPL = 'App.templates.js';
	
	const INIT_VERSION = '1.001';
	
	const JS_LIB_NAME = 'lib.js';	
	const CSS_LIB_NAME = 'styles.css';
	
	const CONTROLLER_PHP_TEMPL = 'Controller_php.tmpl';
	const CONTROLLER_PHP_XSL = 'Controller_php.xsl';
	const CONTROLLER_JS_TEMPL = 'Controller_js.tmpl';
	const CONTROLLER_JS_XSL = 'Controller_%s.xsl';
	const CONTROLLER_PHP_NAME_TEMPL = '%s_Controller_php.xsl';
	const CONTROLLER_JS_NAME_TEMPL = '%s_Controller_js.xsl';
	const TMPL_HTML_TEMPL = 'html.tmpl';
	const TMPL_HTML_XSL = 'html.xsl';
	const TMPL_HTML_NAME_TEMPL = '%s_html.xsl';
	
	const MODEL_PHP_TEMPL = 'Model_php.tmpl';
	const MODEL_JS_TEMPL = 'Model_js.tmpl';
	const MODEL_SQL_TEMPL = 'Model_sql.xsl';
	const MODEL_PHP_NAME_TEMPL = '%s_Model_php.xsl';
	const MODEL_JS_NAME_TEMPL = '%s_Model_js.xsl';
	
	const MENU_MODEL_PHP_TEMPL = 'MainMenu_Model_php.tmpl';
	const MENU_MODEL_PHP_NAME_TEMPL = 'MainMenu_Model_%s_php.xsl';

	const PERM_PHP_TEMPL = 'permission_php.tmpl';
	const PERM_PHP_NAME_TEMPL = 'permission_%s_php.xsl';
	
	const PRED_IT_APP_JS_TEMPL = 'App.predefinedItems_js.xsl';
	const ENUM_APP_JS_TEMPL = 'App.enums_js.xsl';
	
	const ENUM_JS_TEMPL = 'Enum_js.tmpl';
	const ENUM_JS_XSL = 'Enum_js.xsl';
	const ENUM_JS_NAME_TEMPL = 'Enum_%s_js.xsl';
	const ENUM_GRID_COL_JS_TEMPL = 'EnumGridColumn_js.tmpl';
	const ENUM_GRID_COL_JS_XSL = 'EnumGridColumn_js.xsl';
	const ENUM_GRID_COL_JS_NAME_TEMPL = 'EnumGridColumn_%s_js.xsl';
	
	const VIEW_BASE_PHP_TEMPL = 'ViewBase_php.xsl';
	
	const PERMIS_SCRIPT ='role_permissions.php';
	const PERMIS_TEMPL = 'role_permissions.xsl';
	
	const DB_TEMPL = 'SQL.PGSQL.xsl';
	const DB_UPDATE_SCRIPT = 'update.sql';
	const DB_LAST_UPDATE_SCRIPT = 'last_update.sql';
	
	const CHILD_FORM_JS_TEMPL = 'ChildForm_js.tmpl';
	
	const DOC_TEMPL = 'Doc_html.xsl';
	const DOC_JS_TEMPL = 'DOCJs20_json.xsl';
	const DOC_JS_CONF = 'conf.json';
	
	const UPDATE_SQL = 'update.sql';
	
	const PROJ_TAR_TEMPL = 'project%s.tar.gz';
	const DUMP_DB_TEMPL = 'database%s.dump.gz';
	
	//*******************************************************************
	private function transform($inFile,$templFile,$outFile,$log){
		if (!file_exists($templFile)){
			throw new Exception('Template not found: '.$templFile);
		}
		if (!file_exists($inFile)){
			throw new Exception('file not found: '.$inFile);
		}
		if (defined('XSLT_PROCESSOR_TEMPLATE')){
			$command = XSLT_PROCESSOR_TEMPLATE;
			$command = str_replace('#outFile',$outFile,$command);
			$command = str_replace('#inFile',$inFile,$command);
			$command = str_replace('#templFile',$templFile,$command);
			//$command = sprintf('xalan -out %s -in %s -xsl %s',$outFile,$inFile,$templFile);
		
			$log->add('XSLT transformation with external processor'.$command,'debug');
		
			//echo $command.'</br></br>';
			$this->run_shell_cmd($command);
			//passthru($command);			
			$this->set_file_permission($outFile);	
		}
		else{
			$log->add('XSLT transformation with built-in processor:'.$templFile.' => '.$outFile,'debug');
			
			//standart XSLTProcessor
			$xml = new DOMDocument;
			$xml->load($inFile);
//echo 'templFile='.$templFile.'</br>';
//echo debug_print_backtrace().'</br>';
			$xsl = new DOMDocument;
			$xsl->load($templFile);
			
			$proc = new XSLTProcessor;
			$proc->importStylesheet($xsl);
			$this->str_to_file($outFile,$proc->transformToXML($xml));
		}		
	}	

	/**
	 * builds js documentation.
	 * @public
	 * @param {Logger} log - reference to a Logger object
	*/
	public function buildJSDoc($log){		
		$tmpl_dir = $this->projectDir.DIRECTORY_SEPARATOR. self::BUILD_DIR.DIRECTORY_SEPARATOR. self::TEMPL_DIR.DIRECTORY_SEPARATOR. 'js'.DIRECTORY_SEPARATOR. self::DOC_DIR;
		$out_dir = $this->projectDir.DIRECTORY_SEPARATOR. $this->getJsDirectory().DIRECTORY_SEPARATOR. self::DOC_DIR;
		
		$conf_fl = $out_dir.DIRECTORY_SEPARATOR. self::DOC_JS_CONF;
		$doc_templ =  $tmpl_dir.DIRECTORY_SEPARATOR. self::DOC_JS_TEMPL;
		if (file_exists($doc_templ)){
			$this->transform(
				$this->getMdFile(),
				$doc_templ,
				$conf_fl,
				$log
			);		
			$log->add("JSDoc config file created",'note');		
	
			$cmd = sprintf('%s -d %s -c %s', JSDOC, $out_dir, $conf_fl);
			$log->add("JS documentation shell command:".$cmd,'note');		
			$this->run_shell_cmd($cmd);		
			/** @ToDo */
			//$this->set_file_permission($outFile);
		}		
	}

	/**
	 * Validate metadata firle with dtd.
	 * @public
	 * @param {Logger} log - reference to a Logger object
	*/
	public function DTDValid($log){		
		$md_file = $this->getMdFile();
		$dom = new DOMDocument();
		$dom->load($md_file);
		if (!$dom->validate()){
			throw new Exception('Document DTD validation error');
		}
		$log->add('Document successfully validated with DTD','note');	
	}

	/**
	 * Building activity log sql script.
	 * @public
	 * @param {Logger} log - reference to a Logger object
	*/
	public function activityLog($log){		
		$doc_templ = $this->projectDir.DIRECTORY_SEPARATOR. self::BUILD_DIR.DIRECTORY_SEPARATOR. self::TEMPL_DIR.DIRECTORY_SEPARATOR. 'build'.self::TEPL_FILE_EXT.DIRECTORY_SEPARATOR. self::DB_DIR.self::TEPL_FILE_EXT.DIRECTORY_SEPARATOR.'activityLog.xsl';
		echo 'ACTLOG='.$doc_templ.'</br>';
		$out_f = $this->projectDir.DIRECTORY_SEPARATOR. self::BUILD_DIR. self::SQL_DIR.DIRECTORY_SEPARATOR. 'activity_log.sql';
		if (file_exists($doc_templ)){
			$this->transform(
				$this->getMdFile(),
				$doc_templ,
				$out_f,
				$log
			);		
			$log->add('Activity log sql script created.','note');	
	
		}		
	
		
	}
	

	public function createVersionFile($versNum,$log){
		$file = $this->projectDir.DIRECTORY_SEPARATOR. self::VERS_FILE_NAME;
		if (file_exists($file)){
			unlink($file);
		}
		$this->str_to_file($file,
		"<?php
		define('VERSION','".$versNum."');
		?>");
		$log->add("Version file is created. Version: ".$versNum,'warn');
	}

	/** 
	 * Minifies all js files to one library
	 * @param {string} vers - version
	 * @param {Logger} log - reference to a Logger object
	*/
	public function minifyJs($vers,$log){
		include_once($this->repoDir.'/jsmin.php');
		
		$md_file = $this->getMdFile();
		
		//open metadata xml file
		$xml = simplexml_load_file($md_file);
		
		$js_res = '';
		$cnt = 0;
		foreach($xml->jsScripts->jsScript as $js_script){
			$file_name = $js_script->attributes()->file;
			if(substr($file_name, 0, 2) == "js"){
				//js dir is inside
				$file = $this->projectDir.DIRECTORY_SEPARATOR. $file_name;	
			}else{
				$file = $this->projectDir.DIRECTORY_SEPARATOR. $this->getJsDirectory().DIRECTORY_SEPARATOR. $file_name;
			}
			
			if (!file_exists($file)){
				throw new Exception('File not found: '.$file);
			}
			
			$js_res.=($js_res=='')? '':' ';						
			if (!isset($js_script->attributes()->standalone) || $js_script->attributes()->standalone=='FALSE'){
				$text = $this->convToUtf8(file_get_contents($file));
				
				//remove 'import {} from ""' lines
				while(1==1) {
					$p = mb_strpos($text, "import {", 0);
					if($p === FALSE){
						break;
					}
					$p2 = mb_strpos($text, "\n", $p);
					if($p2 === FALSE){
						break;
					}
					$text = mb_substr($text, 0, $p).mb_substr($text, $p2+1);
				}
				
				//compress OR include as is
				$cnt++;
				if (!isset($js_script->attributes()->compressed) || $js_script->attributes()->compressed=='FALSE'){
					$js_res.=JSMin::minify($text);
				}
				else{
					$js_res.=$text;
				}			
			}
		}
		if ($cnt){
			$this->str_to_file($this->projectDir.DIRECTORY_SEPARATOR. $this->getJsDirectory().DIRECTORY_SEPARATOR. self::JS_LIB_NAME,$js_res);
			$log->add("JScripts minified. File count: ".$cnt,'note');
		}
		
		//total compressed files
		return $cnt;
	}
	
	function minifyCSS($vers){
		include_once($this->repoDir.'/jsmin.php');
		
		$md_file = $this->getMdFile();
	
		//open metadata xml file
		$xml = simplexml_load_file($md_file);
		
		//css minify
		$res = '';
		$cnt = 0;
		foreach($xml->cssScripts->cssScript as $script){
			if (file_exists(ABSOLUTE_PATH.'css')){
				//depricated style
				$file = ABSOLUTE_PATH.'css/'.$script->attributes()->file;
			}
			else{
				if(substr($script->attributes()->file, 0, 2) == "js"){
					$file = $this->projectDir.DIRECTORY_SEPARATOR. $script->attributes()->file;
				}else{
					$file = $this->projectDir.DIRECTORY_SEPARATOR. $this->getJsDirectory().DIRECTORY_SEPARATOR. $script->attributes()->file;
				}
			}
			
			if (!file_exists($file)){
				throw new Exception('File not found: '.$file);
			}
			
			$res.=($res=='')? '':' ';			
			$text = $this->convToUtf8(file_get_contents($file));
			if (!isset($script->attributes()->standalone)||$script->attributes()->standalone=='FALSE'){
				$cnt++;
				
				if (!isset($script->attributes()->compressed)){
					$res.=JSMin::minify($text);
				}
				else{
					$res.=$text;
				}
			}
		}
		if ($cnt){
			$this->str_to_file($this->projectDir.DIRECTORY_SEPARATOR. $this->getJsDirectory().DIRECTORY_SEPARATOR. self::CSS_LIB_NAME,$res);
			$log->add("CSS scripts are minified. File count: ".$cnt,'warn');
		}
		
		return $cnt;
	}
	
	/**
	 * Crossplatform symbolic link creation
	 * @param {string} target
	 * @param {string} link
	*/
	private function make_symlink($target, $link){
		if ( (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') && defined(SYMLINK_TEMPLATE) ){
			$command = SYMLINK_TEMPLATE;
			$command = str_replace('#target',$target,$command);
			$command = str_replace('#link',$link,$command);
			$this->run_shell_cmd($command);
			
		}
		else{
			symlink($target,$link);
		}
	}
		
	/**
	 * Creates recursively all symbolic links in a project (to folders and to files) in $sourceDir.
	 * Files (or folders) that end on self::TEPL_FILE_EXT/self::TEPLM_FILE_EXT are skipped. These are templates. They are treated in copy_all_templates function.
	 * If a folder is not a template, symbolic link will be created to this folder without recursion. For example js/core
	 * @private
	 * @param {string} sourceDir
	 * @param {string} destDir
	*/
	private function copy_all_symlinks($sourceDir,$destDir){
		$dh  = opendir($sourceDir);
		while (false !== ($filename = readdir($dh))) {
		    if ($filename!='.' && $filename!='..'){
		    	if (
		    	substr($filename,strlen($filename)-strlen(self::TEPL_FILE_EXT))!=self::TEPL_FILE_EXT
		    	&& substr($filename,strlen($filename)-strlen(self::TEPLM_FILE_EXT))!=self::TEPLM_FILE_EXT
		    	&& substr($filename,strlen($filename)-1,1)!='~'
		    	){
		    		//Это НЕ шаблон
		    		
		    		//Exception or silent skeep???
		    		if (!file_exists($destDir)){
		    			throw new Exception('Directory not found '.$destDir);
		    		}
		    		
		    		if (!file_exists($destDir.DIRECTORY_SEPARATOR. $filename)){
		    			//broken link check
		    			if (is_link($destDir.DIRECTORY_SEPARATOR. $filename)){
		    				unlink($destDir.DIRECTORY_SEPARATOR. $filename);
		    			}
		    			symlink($sourceDir.DIRECTORY_SEPARATOR. $filename,$destDir.DIRECTORY_SEPARATOR. $filename);
		    			//add to .gitignore
		    			if (file_exists($fl=$this->projectDir.'/.gitignore')){
		    				$cont = file_get_contents($fl);
		    				$rel_path = str_replace($this->projectDir,'',$destDir.DIRECTORY_SEPARATOR. $filename);
		    				if (strpos($cont,$rel_path)===FALSE){
		    					$this->str_to_file($fl,$cont.$rel_path.PHP_EOL);
		    				}
		    				
		    			}
		    		}
		    	}
		    	else if (is_dir($sourceDir.DIRECTORY_SEPARATOR. $filename)){
		    		//Это папка ШАБЛОН, ищем там симлинки
				//убираем постфикс из имени файла
				if (substr($filename,strlen($filename)-strlen(self::TEPL_FILE_EXT))==self::TEPL_FILE_EXT){
					$ext = self::TEPL_FILE_EXT;
				}
				else{
					$ext = self::TEPLM_FILE_EXT;
				}
				$new_filename = substr($filename,0,strlen($filename)-strlen($ext));
		    		
		    		$this->copy_all_symlinks($sourceDir.DIRECTORY_SEPARATOR. $filename,$destDir.DIRECTORY_SEPARATOR. $new_filename);
		    	}		    	
		    }
		}
		closedir($dh);		
	
	}

	/**
	 * Makes recursively all project files (folders && files) from templates in sourceDir
	 * Templates are files (folders) that end on self::TEPL_FILE_EXT/self::TEPLM_FILE_EXT,
	 * If a folder is not a template it is skipped.
	 * @param {string} sourceDir
	 * @param {string} destDir
	 * @param {array} templParams
	 */
	private function copy_all_templates($sourceDir,$destDir,&$templParams){
		$m = new Mustache_Engine;
		$dh  = opendir($sourceDir);
		while (false !== ($filename = readdir($dh))) {
		    if ($filename!='.' && $filename!='..'){
		    	if (
		    	substr($filename,strlen($filename)-strlen(self::TEPL_FILE_EXT))==self::TEPL_FILE_EXT
		    	|| substr($filename,strlen($filename)-strlen(self::TEPLM_FILE_EXT))==self::TEPLM_FILE_EXT
		    	){
		    		//Это шаблон
		    		
				//убираем постфикс из имени файла TEPL_FILE_EXT/TEPLM_FILE_EXT
				if (substr($filename,strlen($filename)-strlen(self::TEPL_FILE_EXT))==self::TEPL_FILE_EXT){
					$ext = self::TEPL_FILE_EXT;
				}
				else{
					$ext = self::TEPLM_FILE_EXT;
				}
				$new_filename = substr($filename,0,strlen($filename)-strlen($ext));
				//file name ethrough mustache
				$new_filename = $m->render($new_filename,$templParams);
		    		
			    	if (is_dir($sourceDir.DIRECTORY_SEPARATOR. $filename)){
			    		if (!file_exists($destDir.DIRECTORY_SEPARATOR. $new_filename)){
				    		mkdir($destDir.DIRECTORY_SEPARATOR. $new_filename);
				    		$this->set_file_permission($destDir.DIRECTORY_SEPARATOR. $new_filename);
			    		}
			    		$this->copy_all_templates(
			    			$sourceDir.DIRECTORY_SEPARATOR. $filename,
			    			$destDir.DIRECTORY_SEPARATOR. $new_filename,
			    			$templParams
			    		);
			    	}
			    	else{
			    		//копирование шаблона
			    		if (!file_exists($destDir.DIRECTORY_SEPARATOR. $new_filename)){
			    			//пропускаем через mustache и пишем			    			
						$this->str_to_file(			
							$destDir.DIRECTORY_SEPARATOR. $new_filename,
							$m->render(file_get_contents($sourceDir.DIRECTORY_SEPARATOR.$filename),$templParams)
						);
					}
			    	}		    	
		    	}		    	
		    }
		}
		closedir($dh);		
	}

	public function createSymlinks($log){
		$this->copy_all_symlinks($this->repoDir.DIRECTORY_SEPARATOR. self::TEMPL_DIR, $this->projectDir);
		$log->add('Symbolic links are created.','warn');
	}
	
	private static function addJsToMD($script, &$xml, &$jsScriptsToAdd){
		//echo "adding script:".$script."</br>";
		if(substr($script,0,3)==="js/"){
			$script = substr($script,3);
		}
		if ($xml->xpath( sprintf("/metadata/jsScripts/jsScript[@file='%s']", $script) )==FALSE){
			array_push($jsScriptsToAdd, $script);
		}									
	}
	
	private static function check_php_file_syntax($fileName){
		$output = "";
		$returnVar = NULL;
		exec('php -l '.$fileName.' 2>&1', $output, $returnVar);
		if ($returnVar !== 0) {
			throw new Exception("file:".$fileName." syntax error detected:".implode("\n", $output));
		}
	}		
		
	public function build($log){
	
		$md_file = $this->getMdFile();

		//open metadata xml file
		$xml = simplexml_load_file($md_file);

		//last build date time
		$last_build_dt = strtotime('2000-01-01');
		$last_build_n = $xml->xpath('/metadata/versions/lastBuild');
		if (count($last_build_n)){	
			$last_build_str = (string) $last_build_n[0];		
		}
		else{
			//no build found,take version open date
			$vesr_n = $xml->xpath('/metadata/versions/version[last()]');
			if (count($vesr_n)){
				$last_build_str = $vesr_n[0]->attributes()->dateOpen;
			}
		}
		$last_build_dt = strtotime($last_build_str);	
		$md_modif = (filemtime($md_file)>$last_build_dt);
	
		//controllers	
		$js_scripts_to_add = array();
	
		//js
		$js_exists = (count($xml->jsScripts));
	
		$proj_templates_dir = $this->projectDir.DIRECTORY_SEPARATOR. self::BUILD_DIR.DIRECTORY_SEPARATOR. self::TEMPL_DIR;
	
		function php_script_name($templ){
			return str_replace('_php.xsl','.php',$templ);
		}
		function html_script_name($templ){
			return str_replace('_html.xsl','.html',$templ);
		}
		
		function js_script_name($templ){
			return str_replace('_js.xsl','.js',$templ);
		}
		
		//********************** CONTROLLERS ***************************
		$proj_contr_templ_dir = $proj_templates_dir.DIRECTORY_SEPARATOR. self::CONTROLLERS_DIR;		
				
		//$contr_list = $xml->controllers->controller;
		$contr_list = $xml->xpath("/metadata/controllers/controller[@cmd='alt' or @cmd='add' or @cmd='del']");
		foreach($contr_list as $contr){
			$id = $contr->attributes()->id;
			//if (!isset($contr->attributes()->cmd) || ($contr->attributes()->cmd != "add" && $contr->attributes()->cmd != "alt") ) {
			//	continue;
			//}
			$contr_server = (!$contr->attributes()->server || $contr->attributes()->server=='TRUE');
			$contr_client = (!$contr->attributes()->client || $contr->attributes()->client=='TRUE');
		
			//PHP controller		
			if ($contr_server){
				$templ_file = $proj_contr_templ_dir.DIRECTORY_SEPARATOR.self::CONTROLLER_PHP_TEMPL;
				$proj_user_contr_dir = $this->projectDir.DIRECTORY_SEPARATOR.self::CONTROLLERS_DIR; 
				$contr_name = sprintf(self::CONTROLLER_PHP_NAME_TEMPL,$id);
				if (!file_exists($contr_file = $proj_contr_templ_dir.DIRECTORY_SEPARATOR.$contr_name)){
					//no controller template
					if (!file_exists($templ_file)){
						throw new Exception('Template not found '.$templ_file);
					}
				
					$log->add('Creating new php controller template '.$contr_name,'note');
					$this->str_to_file($contr_file,
						sprintf(file_get_contents($templ_file),$id)
					);
				}
		
				//transform only when file modification time is after $last_build_dt
				if (filemtime($contr_file)>$last_build_dt
				||$md_modif
				||!file_exists($proj_user_contr_dir.DIRECTORY_SEPARATOR.php_script_name($contr_name))
				||filemtime($proj_contr_templ_dir.DIRECTORY_SEPARATOR.self::CONTROLLER_PHP_XSL)>$last_build_dt){
				
					$this->transform($md_file,
						$contr_file,
						$proj_user_contr_dir.DIRECTORY_SEPARATOR. php_script_name($contr_name),
						$log
					);
					self::check_php_file_syntax($proj_user_contr_dir.DIRECTORY_SEPARATOR. php_script_name($contr_name));	
				}
			}
					
			if ($js_exists && $contr_client){
				$proj_user_contr_dir = $this->projectDir.DIRECTORY_SEPARATOR. $this->getJsDirectory().DIRECTORY_SEPARATOR. self::CONTROLLERS_DIR; 
				//JS controller
				$templ_file = $proj_contr_templ_dir.DIRECTORY_SEPARATOR.self::CONTROLLER_JS_TEMPL;
				$contr_name = sprintf(self::CONTROLLER_JS_NAME_TEMPL, $id);
//throw new Exception('contr_name '.$contr_name);				
				if (!file_exists($contr_file = $proj_contr_templ_dir.DIRECTORY_SEPARATOR.$contr_name)){
					//no js controller template
					if (!file_exists($templ_file)){
						throw new Exception('Template not found '.$templ_file);
					}
					
					$log->add('Creating new js controller template '.$contr_name,'note');
					$this->str_to_file($contr_file,
						sprintf(file_get_contents($templ_file),$id)
					);
				}
				if (filemtime($contr_file)>$last_build_dt
				||$md_modif
				||!file_exists($proj_user_contr_dir.DIRECTORY_SEPARATOR. js_script_name($contr_name))
				||filemtime($proj_contr_templ_dir.DIRECTORY_SEPARATOR. sprintf(self::CONTROLLER_JS_XSL,$this->jsVersion))>$last_build_dt
				){
					$md_modif = TRUE;
		
					$this->transform($md_file,
						$contr_file,
						$proj_user_contr_dir.DIRECTORY_SEPARATOR. js_script_name($contr_name),
						$log
					);		
				}		
				//проверка в md _Controller.js
				self::addJsToMD($this->getJsDirectory().DIRECTORY_SEPARATOR."controllers/{$id}_Controller.js", $xml, $js_scripts_to_add);
				//throw new Exception($this->getJsDirectory().DIRECTORY_SEPARATOR."controllers/{$id}_Controller.js");
				/*
				if ($xml->xpath("/metadata/jsScripts/jsScript[@file='controllers/{$id}_Controller.js']")==FALSE){
					array_push($js_scripts_to_add,"controllers/{$id}_Controller.js");
				}
				*/		
			}		
		}
		//********************** CONTROLLERS ***************************
	
		//********************** models *************************		
		$pred_it_mod = FALSE;
		$pred_it_out = $this->projectDir.DIRECTORY_SEPARATOR. $this->getJsDirectory().DIRECTORY_SEPARATOR. self::JS_CUSTOM_DIR.DIRECTORY_SEPARATOR.js_script_name(self::PRED_IT_APP_JS_TEMPL);
		$pred_it_out_exists = file_exists($pred_it_out);
		
		$proj_models_templ_dir = $proj_templates_dir.DIRECTORY_SEPARATOR. self::MODELS_DIR;				
		//$model_list = $xml->models->model;
		$model_list = $xml->xpath("/metadata/models/model[@cmd='alt' or @cmd='add' or @cmd='del']");
		foreach($model_list as $model){
			$id = $model->attributes()->id;
			$is_client_model = ($model->attributes()->server=="FALSE");
	
			//model file PHP
			$proj_user_model_dir = $this->projectDir.DIRECTORY_SEPARATOR. self::MODELS_DIR; 
			$templ_file = $proj_models_templ_dir.DIRECTORY_SEPARATOR. self::MODEL_PHP_TEMPL;
			$model_name = sprintf(self::MODEL_PHP_NAME_TEMPL,$id);
			if (!file_exists($model_file = $proj_models_templ_dir.DIRECTORY_SEPARATOR. $model_name)){
				//no model template
				if (!file_exists($templ_file)){
					throw new Exception('Template not found '.$templ_file);
				}
				
				$log->add('Creating new php model template '.$model_name,'note');
				$this->str_to_file($model_file,
					sprintf(file_get_contents($templ_file),$id)
				);
			}
			
			if (!$is_client_model &&
			(filemtime($model_file)>$last_build_dt
			||$md_modif
			||!file_exists($proj_user_model_dir.DIRECTORY_SEPARATOR.php_script_name($model_name))
			||filemtime($proj_models_templ_dir.'/Model_php.xsl')>$last_build_dt)
			){
				$md_modif = TRUE;
				$this->transform($md_file,
					$model_file,
					$proj_user_model_dir.DIRECTORY_SEPARATOR.php_script_name($model_name),
					$log
				);
				self::check_php_file_syntax($proj_user_model_dir.DIRECTORY_SEPARATOR. php_script_name($model_name));
			}
			//model file JS
			if (file_exists($templ_file = $proj_models_templ_dir.DIRECTORY_SEPARATOR. self::MODEL_JS_TEMPL) ){
				$proj_user_model_dir = $this->projectDir.DIRECTORY_SEPARATOR. $this->getJsDirectory().DIRECTORY_SEPARATOR. self::MODELS_DIR; 
				
				$model_name = sprintf(self::MODEL_JS_NAME_TEMPL,$id);
				if (!file_exists($model_file = $proj_models_templ_dir.DIRECTORY_SEPARATOR. $model_name)){
					//no model template
					$log->add('Creating new js model template '.$model_name,'note');
					$this->str_to_file($model_file,
						sprintf(file_get_contents($templ_file),$id)
					);				
				}
				if (filemtime($model_file)>$last_build_dt
				||$md_modif
				||!file_exists($proj_user_model_dir.DIRECTORY_SEPARATOR.js_script_name($model_name))
				||filemtime($proj_models_templ_dir.'/Model_js.xsl')>$last_build_dt){
					$md_modif = TRUE;
			
					$this->transform($md_file,
						$model_file,
						$proj_user_model_dir.DIRECTORY_SEPARATOR.js_script_name($model_name),
						$log
					);
				}
				//check in md _Model.js
				$js_dir = $this->getJsDirectory();
				self::addJsToMD($js_dir.DIRECTORY_SEPARATOR."models/{$id}_Model.js", $xml, $js_scripts_to_add);
				/*
				if ($xml->xpath("/metadata/jsScripts/jsScript[@file='models/{$id}_Model.js']")==FALSE){
					array_push($js_scripts_to_add,"models/{$id}_Model.js");
				}
				*/		
			}
			
			//sql script
			if (
			($model->attributes()->cmd=="add" || $model->attributes()->cmd=="alt")
			&& $model->attributes()->virtual=="TRUE"
			&& isset($model->attributes()->dataTable)
			&& file_exists($templ_file = $proj_models_templ_dir.DIRECTORY_SEPARATOR. self::MODEL_SQL_TEMPL)
			){
				$proj_build_dir = $this->projectDir.DIRECTORY_SEPARATOR. self::BUILD_DIR;
				$sql_name = $model->attributes()->dataTable.'.sql';
				if(!file_exists($sql_fl = $proj_build_dir.DIRECTORY_SEPARATOR. self::SQL_DIR.DIRECTORY_SEPARATOR.$sql_name)){
					$log->add('Creating new sql script on vitrual table '.$sql_name,'note');
					
					//temporary template
					$tempor_tmpl = OUTPUT_PATH.uniqid();
					try{
						file_put_contents(
							$tempor_tmpl,
							str_replace('{{MODEL_ID}}',$model->attributes()->id,file_get_contents($templ_file))
						);
					
						$this->transform($md_file,
							$tempor_tmpl,
							$sql_fl,
							$log
						);
					}
					finally{
						unlink($tempor_tmpl);
					}
					
				}
				//$proj_sql_dir = $this->projectDir.DIRECTORY_SEPARATOR. $this->getJsDirectory().DIRECTORY_SEPARATOR. self::MODELS_DIR; 
			}
			
			//predefined items
			if ($pred_it_out_exists && (!$pred_it_mod && $model->predefinedItems) ){
				foreach($model->predefinedItems->predefinedItem as $item){
					if ($item->attributes()->cmd){
						$pred_it_mod = TRUE;
						break;	
					}
				}				
			}
		}
		//********************** models *************************

		
		//********************** predefined items ****************		
		//echo 'pred_it_out_exists='.($proj_templates_dir.DIRECTORY_SEPARATOR. 'js'.DIRECTORY_SEPARATOR. self::JS_CUSTOM_DIR.DIRECTORY_SEPARATOR. self::PRED_IT_APP_JS_TEMPL).'</BR>'.'</BR>'.'</BR>';
		if ( (!$pred_it_out_exists || $pred_it_mod)
		&&file_exists($templ_file = $proj_templates_dir.DIRECTORY_SEPARATOR. 'js'.DIRECTORY_SEPARATOR. self::JS_CUSTOM_DIR.DIRECTORY_SEPARATOR. self::PRED_IT_APP_JS_TEMPL)
		){
			$log->add('Creating App.predefinedItems.js','debug');
			$this->transform($md_file,
				$templ_file,
				$pred_it_out,
				$log
			);
			//проверка в md custom_controls/App.predefinedItems.js
			self::addJsToMD($this->getJsDirectory().DIRECTORY_SEPARATOR.self::JS_CUSTOM_DIR.DIRECTORY_SEPARATOR.js_script_name(self::PRED_IT_APP_JS_TEMPL), $xml,$js_scripts_to_add);
			/*
			if ($xml->xpath("/metadata/jsScripts/jsScript[@file='".$jsscript."']")==FALSE){
				array_push($js_scripts_to_add,$jsscript);
			}
			*/											
		}
		//********************** predefined items ****************


		//***************************** SERVER TEMPLATES ********************
		$proj_tmpl_templ_dir = $proj_templates_dir.DIRECTORY_SEPARATOR. self::TMPL_DIR;		
		//$templ_list = $xml->serverTemplates->serverTemplate;
		$templ_list = $xml->xpath("/metadata/serverTemplates/serverTemplate[@cmd='alt' or @cmd='add' or @cmd='del']");
		if(isset($templ_list) && is_array($templ_list) && count($templ_list)){			
			foreach($templ_list as $templ){
				$id = $templ->attributes()->id;
		
				$templ_file = $proj_tmpl_templ_dir.DIRECTORY_SEPARATOR.self::TMPL_HTML_TEMPL;
				$proj_user_tmpl_dir = $this->projectDir.DIRECTORY_SEPARATOR.self::TMPL_DIR; 
				$tmpl_name = sprintf(self::TMPL_HTML_NAME_TEMPL,$id);
				if (!file_exists($tmpl_templ_file = $proj_tmpl_templ_dir.DIRECTORY_SEPARATOR.$tmpl_name)){
					//no controller template
					if (!file_exists($templ_file)){
						throw new Exception('Template not found '.$templ_file);
					}
			
					$log->add('Creating new server template template '.$tmpl_name,'note');
					$this->str_to_file($tmpl_templ_file,
						sprintf(file_get_contents($templ_file),$id)
					);
				}
	
				//transform only when file modification time is after $last_build_dt
				if (filemtime($tmpl_templ_file)>$last_build_dt
				||$md_modif
				||!file_exists($proj_user_tmpl_dir.DIRECTORY_SEPARATOR.html_script_name($tmpl_name))
				||filemtime($proj_tmpl_templ_dir.DIRECTORY_SEPARATOR.self::TMPL_HTML_XSL)>$last_build_dt){
			
					$this->transform($md_file,
						$tmpl_templ_file,
						$proj_user_tmpl_dir.DIRECTORY_SEPARATOR. html_script_name($tmpl_name),
						$log
					);		
				}
			}
		}
		//********************** SERVER templates ***************************
		
		//*********** menu ********************************
		$proj_user_model_dir = $this->projectDir.DIRECTORY_SEPARATOR. self::MODELS_DIR; 
		$menus = $xml->mainMenu;
		foreach($menus as $menu){
			$role_id = $menu->attributes()->roleId;
		
			$templ_file = $proj_models_templ_dir.DIRECTORY_SEPARATOR. self::MENU_MODEL_PHP_TEMPL;
			$model_name = sprintf(self::MENU_MODEL_PHP_NAME_TEMPL,$role_id);
			if (!file_exists($model_file = $proj_models_templ_dir.DIRECTORY_SEPARATOR.$model_name)){
				//no controller
				if (!file_exists($templ_file)){
					throw new Exception('Template not found '.$templ_file);
				}
				
				$log->add('Creating new menu template '.$role_id,'note');
				$this->str_to_file($model_file,
					sprintf(file_get_contents($templ_file),$role_id)
				);
			}
			if (filemtime($model_file)>$last_build_dt||$md_modif
			||!file_exists($proj_user_model_dir.DIRECTORY_SEPARATOR. php_script_name($model_name))){
				$md_modif = TRUE;
		
				$this->transform($md_file,
					$model_file,
					$proj_user_model_dir.DIRECTORY_SEPARATOR. php_script_name($model_name),
					$log
				);
				self::check_php_file_syntax($proj_user_model_dir.DIRECTORY_SEPARATOR. php_script_name($model_name));				
			}
		}
		//*********** menu ********************************
	
	
		//*********** JS Enums ********************************
		if ($js_exists){
			$proj_custom_templ_dir = $proj_templates_dir.DIRECTORY_SEPARATOR. 'js'.DIRECTORY_SEPARATOR. self::JS_ENUM_DIR; 
			
			$rebuild_app_enums = FALSE;
			$proj_custom_user_dir = $this->projectDir.DIRECTORY_SEPARATOR. $this->getJsDirectory().DIRECTORY_SEPARATOR. self::JS_ENUM_DIR; 
			//$enum_list = $xml->enums->enum;
			$enum_list = $xml->xpath("/metadata/enums/enum[@cmd='alt' or @cmd='add' or @cmd='del']");
			foreach($enum_list as $enum){
				$id = $enum->attributes()->id;
				$enum_name = sprintf(self::ENUM_JS_NAME_TEMPL,$id);
				
				if (!$rebuild_app_enums && $enum->attributes()->cmd){
					$rebuild_app_enums = TRUE;
				}
				
				//enum template
				if (file_exists($templ_file = $proj_custom_templ_dir.DIRECTORY_SEPARATOR. self::ENUM_JS_TEMPL) ){
					if (!file_exists($enum_file = $proj_custom_templ_dir.DIRECTORY_SEPARATOR. $enum_name)){
						$log->add('Creating new enum template '.$id,'note');
						$this->str_to_file($enum_file,
							sprintf(file_get_contents($templ_file),$id)
						);
					}
			
					if (filemtime($enum_file)>$last_build_dt || $md_modif
					|| !file_exists($proj_custom_user_dir.DIRECTORY_SEPARATOR. js_script_name($enum_name))){
						$md_modif = TRUE;

						$this->transform($md_file,
							$enum_file,
							$proj_custom_user_dir.DIRECTORY_SEPARATOR. js_script_name($enum_name),
							$log
						);
						//проверка в md _Model.js
						self::addJsToMD($this->getJsDirectory().DIRECTORY_SEPARATOR.self::JS_ENUM_DIR.DIRECTORY_SEPARATOR.js_script_name($enum_name),$xml,$js_scripts_to_add);
						/*
						$jsscript = self::JS_ENUM_DIR.DIRECTORY_SEPARATOR. js_script_name($enum_name);
						if ($xml->xpath("/metadata/jsScripts/jsScript[@file='".$jsscript."']")==FALSE){
							array_push($js_scripts_to_add,$jsscript);
						}
						*/									
					}
				}
				
				//enum grid template
				$enum_name = sprintf(self::ENUM_GRID_COL_JS_NAME_TEMPL,$id);				
				if (file_exists($templ_file = $proj_custom_templ_dir.DIRECTORY_SEPARATOR. self::ENUM_GRID_COL_JS_TEMPL) ){
					if (!file_exists($enum_file = $proj_custom_templ_dir.DIRECTORY_SEPARATOR. $enum_name)){
						$log->add('Creating new enum gridColumn template '.$id,'note');
						$this->str_to_file($enum_file,
							sprintf(file_get_contents($templ_file),$id)
						);
					}
				
					if (filemtime($enum_file)>$last_build_dt || $md_modif
					|| !file_exists($proj_custom_user_dir.DIRECTORY_SEPARATOR. js_script_name($enum_name))){
						$md_modif = TRUE;
	
						$this->transform($md_file,
							$enum_file,
							$proj_custom_user_dir.DIRECTORY_SEPARATOR. js_script_name($enum_name),
							$log
						);
						//проверка в md _Model.js
						self::addJsToMD($this->getJsDirectory().DIRECTORY_SEPARATOR.self::JS_ENUM_DIR.DIRECTORY_SEPARATOR.js_script_name($enum_name),$xml,$js_scripts_to_add);
						/*
						$jsscript = self::JS_ENUM_DIR.DIRECTORY_SEPARATOR .js_script_name($enum_name);
						if ($xml->xpath("/metadata/jsScripts/jsScript[@file='".$jsscript."']")==FALSE){
							array_push($js_scripts_to_add,$jsscript);
						}
						*/									
					}
				}				
			}				
			
			/** @ToDo XSLT for every enum in PROJECT/views/enum */
			
			//enum_controls/Enum_.js
			/*
			if (file_exists($templ_file = $proj_custom_templ_dir.DIRECTORY_SEPARATOR. self::ENUM_JS_TEMPL) ){
				//@ToDo: javascript library directory
				$proj_custom_user_dir = $this->projectDir.DIRECTORY_SEPARATOR. $this->getJsDirectory().DIRECTORY_SEPARATOR. self::JS_ENUM_DIR; 
				$enum_list = $xml->enums->enum;
				foreach($enum_list as $enum){
					$id = $enum->attributes()->id;
					$enum_name = sprintf(self::ENUM_JS_NAME_TEMPL,$id);
					if (!file_exists($enum_file = $proj_custom_templ_dir.DIRECTORY_SEPARATOR. $enum_name)){
						$log->add('Creating new enum template '.$id,'note');
						$this->str_to_file($enum_file,
							sprintf(file_get_contents($templ_file),$id)
						);
					}
				
					if (filemtime($enum_file)>$last_build_dt || $md_modif
					|| !file_exists($proj_custom_user_dir.DIRECTORY_SEPARATOR. js_script_name($enum_name))){
						$md_modif = TRUE;
	
						$this->transform($md_file,
							$enum_file,
							$proj_custom_user_dir.DIRECTORY_SEPARATOR. js_script_name($enum_name),
							$log
						);
						//проверка в md _Model.js
						$jsscript = self::JS_ENUM_DIR.DIRECTORY_SEPARATOR. js_script_name($enum_name);
						if ($xml->xpath("/metadata/jsScripts/jsScript[@file='".$jsscript."']")==FALSE){
							array_push($js_scripts_to_add,$jsscript);
						}									
					}
				}				
			}
			//enum_controls/EnumGridColumn_.js
			if (file_exists($templ_file = $proj_custom_templ_dir.DIRECTORY_SEPARATOR. self::ENUM_GRID_COL_JS_TEMPL) ){
				//@ToDo: javascript library directory
				$proj_custom_user_dir = $this->projectDir.DIRECTORY_SEPARATOR. $this->getJsDirectory().DIRECTORY_SEPARATOR. self::JS_ENUM_DIR; 
				$enum_list = $xml->enums->enum;
				foreach($enum_list as $enum){
					$id = $enum->attributes()->id;
					$enum_name = sprintf(self::ENUM_GRID_COL_JS_NAME_TEMPL,$id);
					if (!file_exists($enum_file = $proj_custom_templ_dir.DIRECTORY_SEPARATOR. $enum_name)){
						$log->add('Creating new enum gridColumn template '.$id,'note');
						$this->str_to_file($enum_file,
							sprintf(file_get_contents($templ_file),$id)
						);
					}
				
					if (filemtime($enum_file)>$last_build_dt || $md_modif
					|| !file_exists($proj_custom_user_dir.DIRECTORY_SEPARATOR. js_script_name($enum_name))){
						$md_modif = TRUE;
	
						$this->transform($md_file,
							$enum_file,
							$proj_custom_user_dir.DIRECTORY_SEPARATOR. js_script_name($enum_name),
							$log
						);
						//проверка в md _Model.js
						$jsscript = self::JS_ENUM_DIR.DIRECTORY_SEPARATOR .js_script_name($enum_name);
						if ($xml->xpath("/metadata/jsScripts/jsScript[@file='".$jsscript."']")==FALSE){
							array_push($js_scripts_to_add,$jsscript);
						}									
					}
				}				
			}			
			*/
			
			//app enums enum grid template
			$app_enums_out = $this->projectDir.DIRECTORY_SEPARATOR. $this->getJsDirectory().DIRECTORY_SEPARATOR. self::JS_CUSTOM_DIR.DIRECTORY_SEPARATOR.js_script_name(self::ENUM_APP_JS_TEMPL);
			if (
			(!file_exists($app_enums_out) || $rebuild_app_enums)
			&&file_exists($templ_file = $proj_templates_dir.DIRECTORY_SEPARATOR. 'js'.DIRECTORY_SEPARATOR. self::JS_CUSTOM_DIR.DIRECTORY_SEPARATOR. self::ENUM_APP_JS_TEMPL)
			){
				$log->add('Creating App.enums.js','debug');
				$this->transform($md_file,
					$templ_file,
					$app_enums_out,
					$log
				);
				//проверка в md custom_controls/App.enums.js
				self::addJsToMD($this->getJsDirectory().DIRECTORY_SEPARATOR.self::JS_CUSTOM_DIR.DIRECTORY_SEPARATOR.js_script_name(self::ENUM_APP_JS_TEMPL),$xml,$js_scripts_to_add);
				/*
				$jsscript = self::JS_CUSTOM_DIR.js_script_name(self::ENUM_APP_JS_TEMPL);
				if ($xml->xpath("/metadata/jsScripts/jsScript[@file='".$jsscript."']")==FALSE){
					array_push($js_scripts_to_add,$jsscript);
				}
				*/									
				
			}
		}
		//*********** JS Enums ********************************	
	
	
		//************ JS Templates ***************************
		$js_dir = $this->projectDir.DIRECTORY_SEPARATOR. $this->getJsDirectory();
		
		$tmpl_list = $xml->jsTemplates->jsTemplate;//all templates
		$tmpl_serv_list = $xml->serverTemplates->serverTemplate;		
		$js_out_file = $js_dir.DIRECTORY_SEPARATOR. self::TMPL_DIR.DIRECTORY_SEPARATOR. self::APP_JS_TMPL;
		$recreate = (!file_exists($js_out_file));
		
		$srv_tmpl_mod_n = $xml->xpath("/metadata/serverTemplates/serverTemplate[@cmd='alt' or @cmd='add' or @cmd='del']");
		$loc_tmpl_mod_n = $xml->xpath("/metadata/jsTemplates/jsTemplate[@cmd='alt' or @cmd='add' or @cmd='del']");
		if(!$recreate
		&& isset($srv_tmpl_mod_n) && is_array($srv_tmpl_mod_n) && count($srv_tmpl_mod_n)
		&& isset($loc_tmpl_mod_n) && is_array($loc_tmpl_mod_n) && count($loc_tmpl_mod_n)
		){
			$recreate = TRUE;
		}
		
		if ($tmpl_list && !$recreate){
			foreach($tmpl_list as $tmpl){
				//added 2024-03-12
				$fl_name = $tmpl->attributes()->file;
				if(substr($fl_name, 0, 4) != "tmpl"){
					//js folder is in path
					$fl = $this->projectDir.DIRECTORY_SEPARATOR. $fl_name;
				}else{
					$fl = $js_dir.DIRECTORY_SEPARATOR. $fl_name;
				}
				if (
					file_exists($fl)
					&& filemtime($fl)>$last_build_dt
				){
					$recreate = TRUE;
					break;
				}
			}
		}
		if ( ($tmpl_list||$tmpl_serv_list) && $recreate){
			$log->add('Recreating js template file','note');
			$tmpl_file_cont = '/** Copyright (c) 2017,2019
 * Andrey Mikhalevich, Katren ltd.
 *
 * This file is created automaticaly during build process
 * DO NOT MODIFY IT!!!	
 */
 		App.prototype.m_serverTemplateIds = [';
			$i = 0;
			foreach($tmpl_serv_list as $tmpl){
				$tmpl_file_cont.= ($i==0)? '':',';
				$tmpl_file_cont.= '"'.$tmpl->attributes()->id.'"';
				$i++;
			}
 		$tmpl_file_cont.= '];';	
 		$tmpl_file_cont.= '
		App.prototype.m_templates = {';		
			$i = 0;
			foreach($tmpl_list as $tmpl){
				$fl_name = $tmpl->attributes()->file;
				if(substr($fl_name, 0, 4) != "tmpl"){
					//js folder is in path
					$fl = $this->projectDir.DIRECTORY_SEPARATOR. $fl_name;
				}else{
					$fl = $js_dir.DIRECTORY_SEPARATOR. $fl_name;
				}
				
				if (file_exists($fl)
				){
					$tmpl_file_cont.= ($i==0)? '':',';
					/*
					$tmpl_file_cont.= '"'.$tmpl->attributes()->id.'":`'.
						file_get_contents($fl).
						'`';
					*/
					$tmpl_file_cont.= '"'.$tmpl->attributes()->id.'":"'.str_replace(PHP_EOL,'\n\t', str_replace('"','\"',file_get_contents($fl)) ).'"';
				}
				$i++;
			}
			$tmpl_file_cont.= '};';		
			$this->str_to_file($js_out_file,$tmpl_file_cont);
		}
		//************ JS Templates ***************************
	
	
		//*********** base view ********************************
		$proj_user_view_dir = $this->projectDir.DIRECTORY_SEPARATOR. self::VIEWS_DIR; 
		if (file_exists($proj_user_view_dir)){
			$proj_views_templ_dir = $proj_templates_dir.DIRECTORY_SEPARATOR. self::VIEWS_DIR;		
			if (!file_exists($proj_user_view_dir.DIRECTORY_SEPARATOR. php_script_name(self::VIEW_BASE_PHP_TEMPL))
			||filemtime($proj_views_templ_dir.DIRECTORY_SEPARATOR. self::VIEW_BASE_PHP_TEMPL)>$last_build_dt
			||filemtime($md_file)>$last_build_dt){
				$md_modif = TRUE;
	
				$this->transform($md_file,
					$proj_views_templ_dir.DIRECTORY_SEPARATOR. self::VIEW_BASE_PHP_TEMPL,
					$proj_user_view_dir.DIRECTORY_SEPARATOR. php_script_name(self::VIEW_BASE_PHP_TEMPL),
					$log
					);
				self::check_php_file_syntax($proj_user_view_dir.DIRECTORY_SEPARATOR. php_script_name(self::VIEW_BASE_PHP_TEMPL));		
			}
		}
		//*********** base view ********************************
	
		//****************** permissions ******************
		$proj_user_perm_dir = $this->projectDir.DIRECTORY_SEPARATOR. self::PERM_DIR; 
		if (file_exists($proj_user_perm_dir)){
			$proj_templ_perm_dir = $proj_templates_dir.DIRECTORY_SEPARATOR. self::PERM_DIR;
			$role_list = $xml->xpath("/metadata/enums/enum[@id='role_types']/value");
			foreach($role_list as $role){
				$role_id = $role->attributes()->id;
			
				$templ_file = $proj_templ_perm_dir.DIRECTORY_SEPARATOR. self::PERM_PHP_TEMPL;
				$perm_name = sprintf(self::PERM_PHP_NAME_TEMPL,$role_id);
				if (!file_exists($perm_file = $proj_templ_perm_dir.DIRECTORY_SEPARATOR.$perm_name)){
					//no
					if (!file_exists($templ_file)){
						throw new Exception('Template not found '.$templ_file);
					}
				
					$log->add('Creating new permission for role '.$role_id,'note');
					$this->str_to_file($perm_file,
						sprintf(file_get_contents($templ_file),$role_id)
					);
				}
				if (filemtime($perm_file)>$last_build_dt||$md_modif
				||!file_exists($proj_user_perm_dir.DIRECTORY_SEPARATOR. php_script_name($perm_name))){
					$md_modif = TRUE;
		
					$this->transform($md_file,
						$perm_file,
						$proj_user_perm_dir.DIRECTORY_SEPARATOR. php_script_name($perm_name),
						$log
					);				
				}			
			}
			//guest role
			$role_id = 'guest';
		
			$templ_file = $proj_templ_perm_dir.DIRECTORY_SEPARATOR. self::PERM_PHP_TEMPL;
			$perm_name = sprintf(self::PERM_PHP_NAME_TEMPL,$role_id);
			if (!file_exists($perm_file = $proj_templ_perm_dir.DIRECTORY_SEPARATOR.$perm_name)){
				//no
				if (!file_exists($templ_file)){
					throw new Exception('Template not found '.$templ_file);
				}
			
				$log->add('Creating new permission for role '.$role_id,'note');
				$this->str_to_file($perm_file,
					sprintf(file_get_contents($templ_file),$role_id)
				);
			}
			if (filemtime($perm_file)>$last_build_dt||$md_modif
			||!file_exists($proj_user_perm_dir.DIRECTORY_SEPARATOR. php_script_name($perm_name))){
				$md_modif = TRUE;
	
				$this->transform($md_file,
					$perm_file,
					$proj_user_perm_dir.DIRECTORY_SEPARATOR. php_script_name($perm_name),
					$log
				);				
			}			
		}
		else{				
			//depricated
			$proj_user_func_dir = $this->projectDir.DIRECTORY_SEPARATOR. self::FUNC_DIR; 
			if (file_exists($proj_user_func_dir)&&$md_modif){	
		
				$this->transform($md_file,
					$proj_templates_dir.DIRECTORY_SEPARATOR. self::FUNC_DIR.DIRECTORY_SEPARATOR. self::PERMIS_TEMPL,
					$proj_user_func_dir.DIRECTORY_SEPARATOR. self::PERMIS_SCRIPT,
					$log
					);
			}
		}
		//****************** permissions ******************
	
		//**************** DB script *********************
		if ($md_modif){
			//build/sql/last_updates.sql includes last updates only
			//build/updates.sql includes all updates
			$proj_build_dir = $this->projectDir.DIRECTORY_SEPARATOR. self::BUILD_DIR;
			$f_last_update = $proj_build_dir.DIRECTORY_SEPARATOR. self::SQL_DIR.DIRECTORY_SEPARATOR. self::DB_LAST_UPDATE_SCRIPT;			
			$f_update = $proj_build_dir.DIRECTORY_SEPARATOR. self::DB_UPDATE_SCRIPT;
		
			$this->transform($md_file,
				$proj_templates_dir.DIRECTORY_SEPARATOR. self::DB_DIR.DIRECTORY_SEPARATOR. self::DB_TEMPL,
				$f_last_update,
				$log
			);
						
			//virtrtual models to sql
			$model_list = $xml->models->model;
			foreach($model_list as $model){	
				if (
					$model->attributes()->cmd
					&& ($model->attributes()->cmd=='alt' || $model->attributes()->cmd=='add')
					&& $model->attributes()->virtual=='TRUE'
					&& $model->attributes()->dataTable
					&& file_exists($f_view_sql = $proj_build_dir.DIRECTORY_SEPARATOR. self::SQL_DIR.DIRECTORY_SEPARATOR. $model->attributes()->dataTable.'.sql')
				){
					$this->str_to_file($f_last_update,
						trim(file_get_contents($f_last_update)).PHP_EOL.
						'-- ************* virtual table ****************'.PHP_EOL.PHP_EOL.
						trim(file_get_contents($f_view_sql))
					);
				}
			}
			
			//take out empty lines
			file_put_contents($f_last_update,
			    preg_replace("/(^[\r\n]*|[\r\n]+)[\s\t]*[\r\n]+/", "\n", file_get_contents($f_last_update))
			);			
			
			//$this->str_to_file($f_last_update,implode('', file($f_last_update, FILE_SKIP_EMPTY_LINES)));
			/*
			file_put_contents($f_last_update,
			    str_replace("\n\n", "\n", file_get_contents($f_last_update))
			);			
			*/
			
			//SQL scripts to sql
			$sql_list = $xml->sqlScripts->sqlScript;
			if (!is_null($sql_list)){
				foreach($sql_list as $sql){	
					if (
						$sql->attributes()->cmd
						&& ($sql->attributes()->cmd=='alt' || $sql->attributes()->cmd=='add')
						&& (file_exists($f_sql = $proj_build_dir.DIRECTORY_SEPARATOR. self::SQL_DIR.DIRECTORY_SEPARATOR. $sql->attributes()->file)
						|| file_exists($f_sql = $proj_build_dir.DIRECTORY_SEPARATOR. $sql->attributes()->file)
						)
					){
						$this->str_to_file($f_last_update,
							trim(file_get_contents($f_last_update)).PHP_EOL.PHP_EOL.PHP_EOL.
							'-- ************* SQL script ****************'.PHP_EOL.
							trim(file_get_contents($f_sql))
						);
					}
				}
			}
			
			/*
			$cont_last_update = trim(file_get_contents($f_last_update));
			if (strlen($cont_last_update)){
				$this->str_to_file($f_last_update,$cont_last_update);
				
				//all to all-updates file
				if (file_exists($f_update)){
					$all = file_get_contents($f_update).PHP_EOL.PHP_EOL.PHP_EOL;
				}
				else{
					$all = '';
				}
			
				$this->str_to_file($f_update,$all.
				'-- ******************* update '.date('d/m/Y H:i:s').' ******************'.PHP_EOL.
				$cont_last_update
				);
			}
			*/
		}
		//**************** DB script *********************
		
	
		//Open DOM for putting last buil information && for validation
		if ($md_modif){
			$dom=new DOMDocument();
			$dom->load($md_file);
			$dom->preserveWhiteSpace = false;
			$dom->formatOutput = true;				
			
			/*			
			if ($dom->validate()){
				$log->add('Document DTD validation error','error');
			}
			$log->add('Document successfully validated with DTD','note');
			*/
		}
	
		//************************ Server Documentation **************************
		$doc_templ = $this->projectDir.DIRECTORY_SEPARATOR. self::BUILD_DIR.DIRECTORY_SEPARATOR. self::TEMPL_DIR.DIRECTORY_SEPARATOR. self::DOC_DIR.DIRECTORY_SEPARATOR. self::DOC_TEMPL;
		if (filemtime($doc_templ)>$last_build_dt||$md_modif){
			if (!file_exists($this->projectDir.DIRECTORY_SEPARATOR. self::DOC_DIR)){
				mkdir($this->projectDir.DIRECTORY_SEPARATOR. self::DOC_DIR);
				$this->set_file_permission($this->projectDir.DIRECTORY_SEPARATOR. self::DOC_DIR);
			}
			$this->transform($md_file,
				$doc_templ,
				$this->projectDir.DIRECTORY_SEPARATOR. self::DOC_DIR.DIRECTORY_SEPARATOR. 'index.html',
				$log
				);		
		}		
		//************************ Server Documentation **************************
		
		
		//************* set last build && close DOM ********************
		if ($md_modif){
			//add controller scripts
			if (is_array($js_scripts_to_add) && count($js_scripts_to_add)){
				$jsScripts = $dom->getElementsByTagName("jsScripts");
				if ($jsScripts->length){
					foreach($js_scripts_to_add as $scr){
						$log->add('Adding jscript to DOM '.$scr,'note');
						$new_n = new DOMElement('jsScript');
						$jsScripts->item($jsScripts->length-1)->appendChild($new_n);
						$new_n->setAttribute("file", $scr);
					}				
				}
			}
	
		
			$last_build_l = $dom->getElementsByTagName("lastBuild");
			if ($last_build_l->length){
				$last_build_l->item(0)->nodeValue = date('Y-m-d H:i:s');
			}
			else{
				$vesr_l = $dom->getElementsByTagName("version");
				$vesr_l->item($vesr_l->length-1)->appendChild(new DOMElement('lastBuild',date('Y-m-d H:i:s')));
			}
	
			//clear attributes cmd=""
			$xpath = new DOMXPath($dom);
			$mod_nodes = $xpath->query('//*[@cmd]');
			foreach($mod_nodes as $n){
				$n->removeAttribute('cmd');
			}			
			
			self::saveDOM($dom,$md_file);
		}
		
	}
	
	public function minify(){
		$versInf = array();
		$this->getVersion($versInf);
		
		$this->minifyJs($versInf['version']);
		$this->minifyCSS($versInf['version']);
	}

	public function getVersion(&$struc){
		$md_file = $this->getMdFile();
		
		$xml = simplexml_load_file($md_file);
		//version 
		$res = $xml->xpath('/metadata/versions/version[last()]');
		if (count($res)){
			$a = $res[0]->attributes()->dateOpen;
			if ($a){
				$struc['dateOpen'] = (string)$a[0];
			}
			$a = $res[0]->attributes()->dateClose;
			if ($a){
				$struc['dateClose'] = (string)$a[0];
			}
			$struc['version'] = (string) $res[0];
		}	
		//build
		$res = $xml->xpath('/metadata/versions/lastBuild[last()]');
		if (count($res)){
			$struc['lastBuild'] = (string) $res[0];
		}	
	}
	
	public function openVersion($version){
		$md_file = $this->getMdFile();
		
		$dom=new DOMDocument();
		$dom->load($md_file);
		$parent_list = $dom->getElementsByTagName('versions');
		if ($parent_list->length==0) {
		   // no versions node
		   throw new Exception('versions node not found!');
		} 
		$parent_n = $parent_list->item($parent_list->length-1);
		
		$vers_n = $dom->createElement('version',$version);
		$vers_n->setAttribute('dateOpen', date('Y-m-d H:i:s'));
		
		$parent_n->appendChild($vers_n);
		//$dom->save($md_file);	
		self::saveDOM($dom,$md_file);
		
		//remove old sql
		if (file_exists($f = $this->projectDir.DIRECTORY_SEPARATOR. self::BUILD_DIR. DIRECTORY_SEPARATOR. self::SQL_DIR.DIRECTORY_SEPARATOR.self::DB_UPDATE_SCRIPT)){
			unlink($f);
		}
		//last update
		if (file_exists($f = $this->projectDir.DIRECTORY_SEPARATOR.self::BUILD_DIR. DIRECTORY_SEPARATOR.self::SQL_DIR.DIRECTORY_SEPARATOR.self::DB_LAST_UPDATE_SCRIPT)){
			unlink($f);
		}
	}
	
	public function closeVersion($log){
		$md_file = $this->getMdFile();
		
		$dom=new DOMDocument();
		$dom->load($md_file);
		//last version node
		$list = $dom->getElementsByTagName('version');
		if ($list->length==0) {
		   // no version node
		   throw new Exception('version node not found!');
		} 
		$n = $list->item($list->length-1);
		$n->setAttribute('dateClose', date('Y-m-d H:i:s'));
		$dom->save($md_file);
		
		$log->add("Version closed.",'warn');
	}

	/**
	 * puts all variables from $startProjParams to a file named $fileName
	 * @param {array} startProjParams
	 * @param {object} log
	 * @param {string} fileName
	 */
	/*
	private function varsToTemplateFile($startProjParams,$log,$fileName){
		$file = file_get_contents($fileName);
		
		//Field changing @ToDo make function for doing this
		$fld_pref = self::START_PROJ_FLD_PREF;
		$fld_pref_len = strlen($fld_pref);		
		$file_ch = FALSE;
		foreach($startProjParams as $fld=>$val){
			if (substr($fld,0,$fld_pref_len)==$fld_pref){
				$file = str_replace($fld, $val, $file);
				$file_ch = TRUE;
			}
		}
		if ($file_ch){
			file_put_contents($fileName,$file);
		}			
		
		return $file_ch;
	}
	*/
	
	/**
	 * @param {array} startProjParams copy of _REQUEST
	 * @param {Logger} log
	 */
	public function startProject($startProjParams, $log){
		$repo_templ_dir = $this->repoDir.DIRECTORY_SEPARATOR. self::TEMPL_DIR;
		//metadata modification
		$startProjParams['timestamp'] = date('Y-m-d H:i:s');
		
		/******************** Templates *******************************/		
		$this->copy_all_templates($repo_templ_dir, $this->projectDir,$startProjParams);		
		$log->add('Template files are created.','note');
		/******************** Templates *******************************/
		
		
		/********************** symlinks **********************************/
		$this->createSymlinks($log);
		/********************** symlinks **********************************/
		
				
		/**************** start version in metadata **********************/
		$this->openVersion(self::INIT_VERSION,$log);
		$this->createVersionFile(self::INIT_VERSION,$log);
		/**************** start version in metadata **********************/
		
		
		/*******************  execute db init scripts superuser/user *********************************/
		/**
		 * File self::INIT_DB_FILE_NAME contains all essetial init db script
		 */
		//if($startProjParams['EXEC_INIT_DB_SCRIPTS']){
			$dbSUAuth = array(
				'DB_PASSWORD'=>$startProjParams['DB_CREATE_PASSWORD'],
				'DB_SERVER_MASTER'=>$startProjParams['DB_SERVER'],
				'DB_NAME'=>'postgres',
				'DB_USER'=>$startProjParams['DB_CREATE_USER']
			);		 			
			//1)		
			if(file_exists($f_init_db = $this->projectDir.DIRECTORY_SEPARATOR. self::BUILD_DIR.DIRECTORY_SEPARATOR. self::SQL_DIR. DIRECTORY_SEPARATOR. self::INIT_DB_SU_FILE_NAME)){
				$log->add('Executing superuser database script.','note');
				$this->runSQLFromFile($dbSUAuth,$f_init_db,$log);		
				
				//to this database
				$dbSUAuth = array(
					'DB_PASSWORD'=>$startProjParams['DB_CREATE_PASSWORD'],
					'DB_SERVER_MASTER'=>$startProjParams['DB_SERVER'],
					'DB_NAME'=>$startProjParams['DB_NAME'],
					'DB_USER'=>$startProjParams['DB_CREATE_USER']
				);		 				
				$log->add('Creating extension.','note');
				$this->runSQL($dbSUAuth,'CREATE EXTENSION pgcrypto;',$log);		
			}
		//}
		/*******************  db init *********************************/

		
		/******************** ReadMe ***************************/
		if (file_exists($fl=$this->projectDir.DIRECTORY_SEPARATOR. self::README_FILE_NAME)){
			$this->str_to_file($fl,$startProjParams['proj_descr'].PHP_EOL,FILE_APPEND);
			$log->add('Description file is generated.','note');
		}
		/******************** ReadMe ***************************/
		
		
		/******************** server repository *************************/
		if (isset($startProjParams['GITHUB_USER']) && strlen($startProjParams['GITHUB_USER'])){
			/*require_once('Config.php');
			$git = new GitRepo($this->projectDir,TRUE,TRUE);
			$git->run(sprintf('config  user.email "%s"',$startProjParams['TECH_EMAIL']));
			$git->run(sprintf('config  user.name "%s"',$startProjParams['GITHUB_USER']));
			$git->run(sprintf('remote add origin git@github.com:%s/%s.git',
				$startProjParams['GITHUB_USER'],
				$startProjParams['APP_NAME'])
			);
			$log->add('Server repository is created.','note');		
			
			if(!defined('TECH_EMAIL')){
				define('TECH_EMAIL',$startProjParams['TECH_EMAIL']);
			}
			if(!defined('GITHUB_USER')){
				define('GITHUB_USER',$startProjParams['GITHUB_USER']);
			}
			//this call depends on constants!!!						
			$this->commit('Creating new repository',$log);
			
			$this->push($log);*/
			/******************** server repository *************************/		
		}
		else{
			$log->add(self::ER_NO_GIT_USER,'error');
		}		
	}
	
	public function pull($log){
		$git = new GitRepo($this->projectDir);
		$git->run(sprintf('config  user.email "%s"',TECH_EMAIL));
		$git->run(sprintf('config  user.name "%s"',GITHUB_USER));
		$git->run('pull origin main');	
		$log->add('Project files are pulled from the server.','warn');
	}
	public function push($log){
		$git = new GitRepo($this->projectDir);
		$git->run(sprintf('config  user.email "%s"',TECH_EMAIL));
		$git->run(sprintf('config  user.name "%s"',GITHUB_USER));
		$git->run('push origin');//changed master to main
		$log->add('Project files are pushed to the server.','warn');
	}

	public function commit($commitDescr,$log){
		//@ToDo
		setlocale(LC_ALL, 'ru_RU.UTF-8');
	echo 'commit projectDir='.$this->projectDir.'</br>';
		$git = new GitRepo($this->projectDir);
		//$git->run(sprintf('config  user.email "%s"',TECH_EMAIL));
		//$git->run(sprintf('config  user.name "%s"',GITHUB_USER));
		$git->add('--all .');
		$git->commit($commitDescr, TRUE);
	}
	
	public function prepareSQLForUpdate($log){
		$build_dir = $this->projectDir.DIRECTORY_SEPARATOR. self::BUILD_DIR;
		$update_sql_dir = $this->projectDir.DIRECTORY_SEPARATOR. self::UPDATES_DIR.DIRECTORY_SEPARATOR. self::SQL_DIR;
		if (!file_exists($this->projectDir.DIRECTORY_SEPARATOR. self::UPDATES_DIR)){
			mkdir($this->projectDir.DIRECTORY_SEPARATOR. self::UPDATES_DIR);
			$this->set_file_permission($this->projectDir.DIRECTORY_SEPARATOR. self::UPDATES_DIR);
		}
		
		if (file_exists($update_sql_dir)){
			self::deleteDir($update_sql_dir);
		}
		mkdir($update_sql_dir);
		$this->set_file_permission($update_sql_dir);
		
		if (file_exists($build_dir.DIRECTORY_SEPARATOR. self::UPDATE_SQL)){
			$sql_upd_cont = trim(file_get_contents($build_dir.DIRECTORY_SEPARATOR. self::UPDATE_SQL));
			if (strlen($sql_upd_cont)){
				$log->add('Building SQL update script.','note');
				$this->str_to_file(
					$update_sql_dir.DIRECTORY_SEPARATOR. self::UPDATE_SQL,
					$sql_upd_cont
				);
			}
		}
		/*
		//перенести все измененные скрипты из build/sql
		if (file_exists($build_dir.DIRECTORY_SEPARATOR. self::SQL_DIR)){
			$struc = array();
			$this->getVersion($struc);
			$from_d = strtotime($struc['dateOpen']);
			$dh  = opendir($build_dir.DIRECTORY_SEPARATOR. self::SQL_DIR);
			while (false !== ($filename = readdir($dh))) {
				if ($filename!='.'&&$filename!='..'){
					if (filemtime($build_dir.DIRECTORY_SEPARATOR. self::SQL_DIR.DIRECTORY_SEPARATOR. $filename)>$from_d){
						//копируем
						$this->str_to_file(
							$update_sql_dir.DIRECTORY_SEPARATOR. $filename,
							file_get_contents($build_dir.DIRECTORY_SEPARATOR. self::SQL_DIR.DIRECTORY_SEPARATOR .$filename)
						);
						touch($update_sql_dir.DIRECTORY_SEPARATOR. $filename,
							filemtime($build_dir.DIRECTORY_SEPARATOR. self::SQL_DIR.DIRECTORY_SEPARATOR. $filename)
						);
					}
				}
			}
			$log->add('Copying all modified SQL scripts to update directory.','note');
		}			
		*/
	}
	public function zipProject($log){
		$log->add('Archiving files.','warn');

		$struc = array();
		$this->getVersion($struc);

		$dir = $this->projectDir;
		$dir_ar = explode(DIRECTORY_SEPARATOR,$dir);
		$proj_id = $dir_ar[count($dir_ar)-1];
		$par_dir = implode(DIRECTORY_SEPARATOR,array_slice($dir_ar,0,count($dir_ar)-1));
		
		if (!file_exists($dir.DIRECTORY_SEPARATOR.self::UPDATES_DIR)){
			mkdir($dir.DIRECTORY_SEPARATOR.self::UPDATES_DIR);
			chgrp($dir.DIRECTORY_SEPARATOR.self::UPDATES_DIR, $this->buildGroup);
			exec(sprintf('chmod %s %s', $this->buildDirPermission, $dir.DIRECTORY_SEPARATOR.self::UPDATES_DIR));				
		}

		$out_scripts = $dir.DIRECTORY_SEPARATOR.self::UPDATES_DIR.DIRECTORY_SEPARATOR.sprintf(self::PROJ_TAR_TEMPL,$struc['version']);
		if (file_exists($out_scripts)){
			unlink($out_scripts);
		}
	
		$cmd = sprintf('tar -zcf %s -C %s %s --exclude %s',
			$out_scripts,
			$par_dir,
			$proj_id,
			$dir.DIRECTORY_SEPARATOR.self::UPDATES_DIR
		);
		exec($cmd);
		chgrp($out_scripts, $this->buildGroup);
		
		//$this->run_shell_cmd
		exec(sprintf('chmod %s %s', $this->buildDirPermission,$out_scripts));
	}
	
	public function zipDb($log){
		$log->add('Archiving database.','warn');
		
		$struc = array();
		$this->getVersion($struc);
		
		$dir = $this->projectDir;
		$out_dbdump = $dir.DIRECTORY_SEPARATOR.self::UPDATES_DIR.DIRECTORY_SEPARATOR. sprintf(self::DUMP_DB_TEMPL,$struc['version']);
		$cmd = sprintf(
		'pg_dump -h %s -U %s -Fc -b postgresql://%s:%s@%s:%d/%s | gzip > %s',
			DB_SERVER,
			DB_USER,
			DB_USER,
			DB_PASSWORD,
			DB_SERVER,
			5432,
			DB_NAME,
			$out_dbdump
		);
		//$this->run_shell_cmd($cmd);
		exec($cmd);
	}
	/*
	public function tarZips($versNum,$log){
		$log->add('Making tar of all zips.');
		$dir = $this->projectDir;
	
		$out_all = $dir.DIRECTORY_SEPARATOR.self::UPDATES_DIR.DIRECTORY_SEPARATOR.str_replace('.','_',$versNum).'.tar';
		$cmd = sprintf('tar -cf %s -C %s %s -C %s %s',
			$out_all,
			$dir.DIRECTORY_SEPARATOR. self::UPDATES_DIR,
			self::PROJ_TAR_FILE,
			$dir.DIRECTORY_SEPARATOR. self::UPDATES_DIR,
			self::DUMP_DB_FILE		
		);
		$this->run_shell_cmd($cmd);

		chgrp($out_all, $this->buildGroup);
		exec('chmod %s %s',$this->buildDirPermission,$out_all);
	}
	*/
	public function clone_repo($gitUser,$projId,$log){
		/*
		$tmp_repo = $this->getTmpRepoDir();
		if (file_exists($tmp_repo)){
			mkdir($tmp_repo);
			set_file_permission($tmp_repo);		
		}
		$repo = new GitRepo($tmp_repo);
		$repo->clone_remote(
			sprintf('git://github.com/%s/%s.git',$gitUser,$projId),
			''
		);
		*/
	}
	
	//upload updates to server
	public function upload_update($params, $log){
		//iterate production hosts
		foreach($params['HOSTS'] as $h){
			//stop remote app
			$host = trim($h);
			
			$cmd = sprintf('ssh %s %s', $host, $params['APP_STOP']);
			$log->add('Shell: '.$cmd, 'note');
			$out = '';
			try{
				$out = $this->run_shell_cmd($cmd);					
			}catch (Exception $e){				
			}
			$log->add('stop result: '.$out, 'note');
			
			//copy all modified files
			if(isset($params['FILES'])){
				foreach($params['FILES'] as $f){
					$fl = trim($f);
					$cmd = sprintf('rsync -az -e "ssh" %s %s:%s/', $this->projectDir.DIRECTORY_SEPARATOR.$fl, $host, $params['APP_DIR'].DIRECTORY_SEPARATOR.dirname($fl));
					$log->add('Shell: '.$cmd, 'note');
					$out = $this->run_shell_cmd($cmd);
					$log->add('rsync result: '.$out, 'note');
				}	
			}
			
			//sql
			if($params['DB_SERVER'] && $params['DB_SERVER']!=$params['DB_SERVER_MASTER']){
				$this->applySQL(array(
						'DB_SERVER_MASTER' => $params['DB_SERVER'],
						'DB_SERVER' => $params['DB_SERVER'],
						'DB_NAME' => $params['DB_NAME'],
						'DB_USER' => $params['DB_USER'],
						'DB_PASSWORD' => $params['DB_PASSWORD']
					),
					$log
				);
			}
			
			//start remote app
			$cmd = sprintf('ssh %s %s', $host, $params['APP_START']);
			$log->add('Shell: '.$cmd, 'note');
			$out = '';
			try{
				$out = $this->run_shell_cmd($cmd);					
			}catch (Exception $e){				
			}
			$log->add('start result: '.$out, 'note');
			
		}
		
	}
	
	/*
	 */
	private function runSQLFromFile($dbAuth,$scriptFile,$log){
		$cmd = sprintf('export PGPASSWORD=%s ; psql -h %s -d %s -U %s -f '.$scriptFile,
				$dbAuth['DB_PASSWORD'],
				$dbAuth['DB_SERVER_MASTER'],
				$dbAuth['DB_NAME'],
				$dbAuth['DB_USER']
		);
		$log->add('Executing sql file: '.$scriptFile,'note');
		$this->run_shell_cmd($cmd);					
	}
	/*
	 */
	private function runSQL($dbAuth,$script,$log){
		$cmd = sprintf("export PGPASSWORD=%s ; psql -h %s -d %s -U %s -c \"%s\"",
				$dbAuth['DB_PASSWORD'],
				$dbAuth['DB_SERVER_MASTER'],
				$dbAuth['DB_NAME'],
				$dbAuth['DB_USER'],
				$script
		);
		$log->add('Executing SQL: '.$script,'note');
		$this->run_shell_cmd($cmd);					
	}
	
	
	/*
	 * Run all sql scripts from updates directory.
	 * self::DB_UPDATE_SCRIP is run first,then all the others, sorted on their modification time.
	 * @param{array} dbAuth - array of 
	 *			DB_PASSWORD
	 *			DB_SERVER_MASTER
	 *			DB_NAME
	 *			DB_USER
	 */
	public function applySQL($dbAuth,$log){
		$rel_dir = self::UPDATES_DIR.DIRECTORY_SEPARATOR .self::SQL_DIR;
		
		$log->add('Applying all sql scripts from '. $rel_dir,'note');
		
		$sql_ext = '.sql';
		$scripts = array();
		$script_times = array();
		$sourceDir = $this->projectDir.DIRECTORY_SEPARATOR. $rel_dir;
		
		$dh  = opendir($sourceDir);
		while (false !== ($filename = readdir($dh))) {
			if ($filename!='.' && $filename!='..'
			&&substr($filename,strlen($filename)-strlen($sql_ext))==$sql_ext){				
				if ($filename == self::DB_UPDATE_SCRIPT){
					$tm = 0;
				}
				else{
					$tm = filemtime($sourceDir.DIRECTORY_SEPARATOR. $filename);
					while(array_key_exists($tm,$scripts)){
						$tm+=1;
					}				
				}
				array_push($script_times, $tm);
				$scripts[$tm] = $filename;
			}
		}		
		if (count($scripts)){
			sort($script_times);
			foreach($script_times as $mod_time){
				$script = $scripts[$mod_time];
				$this->runSQLFromFile($dbAuth,$sourceDir.DIRECTORY_SEPARATOR.$script,$log);				
			}
		}
	}
}	
	
?>
