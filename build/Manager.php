<?php
/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>
 
 * @class
 * @classdesc Manager base class
 
 * @requires Config.php
  
 */

require_once('Config.php');

/* Mustache */
require_once('mustache.php/src/Mustache/Autoloader.php');
Mustache_Autoloader::register();


class Manager {

	const BUILD_DIR = 'build';
	const MD_FILE_NAME = 'metadata.xml';	

	const SQL_DIR = 'sql';
	const TEMPL_DIR = 'templates';

	const TIDY_INI = 'tidy.md.ini';

	//home project directory
	protected $projectDir;
	protected $jsVersion;
	
	//framework build directory
	protected $repoDir;
	
	protected $buildGroup;
	protected $buildFilePermission;
	protected $buildDirPermission;

	/**
	 * ProjectManager object is constructed in page.php
	 * @constructor
	 * @param {string} projectDir Project directory
	 * @param {string} repoDir Directory with repository
	 * @param {string} jsVersion
	 * @param {array} permAr Hash array
	 */
	public function __construct($projectDir,$repoDir,$jsVersion,$permAr){
		$this->projectDir = $projectDir;
		$this->repoDir = $repoDir;
		$this->jsVersion = $jsVersion;
		$this->buildGroup = $permAr['buildGroup'];
		$this->buildFilePermission = $permAr['buildFilePermission'];
		$this->buildDirPermission = $permAr['buildDirPermission'];
	
	}

	public static function deleteDir($dir) {
		if (is_dir($dir)) { 
			$objects = scandir($dir); 
			foreach ($objects as $object) { 
				if ($object != "." && $object != "..") { 
					if (is_dir($dir."/".$object))
						rrmdir($dir."/".$object);
					else
						unlink($dir."/".$object); 
				} 
			}
			rmdir($dir); 
		} 
	}

	public function getMdFile(){
		return $this->projectDir.DIRECTORY_SEPARATOR. self::BUILD_DIR.DIRECTORY_SEPARATOR. self::MD_FILE_NAME;
	}
	
	public function getJsDirectory(){
		return $this->jsVersion;
	}
	
	protected function convToUtf8($str){
		if (mb_detect_encoding($str,"UTF-8,iso-8859-1",TRUE)!="UTF-8" ){
			return  iconv("iso-8859-1","UTF-8",$str);
		}
		else{
			return $str;
		}
	}

	protected function run_shell_cmd($command){		
		$descriptorspec = array(
			1 => array('pipe', 'w'),
			2 => array('pipe', 'w'),
		);
		$pipes = array();
		if(count($_ENV) === 0) {
			$env = NULL;
			/*
			foreach($envopts as $k => $v) {
				putenv(sprintf("%s=%s",$k,$v));
			}
			*/
		} else {
			$env = array_merge($_ENV, $envopts);
		}
		$cwd = $this->projectDir;
		$resource = proc_open($command, $descriptorspec, $pipes, $cwd, $env);

		$stdout = stream_get_contents($pipes[1]);
		$stderr = stream_get_contents($pipes[2]);
		foreach ($pipes as $pipe) {
			fclose($pipe);
		}

		$status = trim(proc_close($resource));
		if ($status) throw new Exception($stderr);

		return $stdout;	
	}

	protected function set_file_permission($fileName){
		if (!file_exists($fileName)){
			throw new Exception('Permission setting, file not found: '.$fileName);
		}
		$perm = (is_dir($fileName))? $this->buildDirPermission:$this->buildFilePermission;
		try{
			@chgrp($fileName,$this->buildGroup);
			$this->run_shell_cmd(sprintf('chmod %s %s',$perm,$fileName));				
		}
		catch (Exception $e){
			echo "Can not change file permission: ".$fileName;
		}
	}

	protected function str_to_file($fileName,$str){
		file_put_contents($fileName,$str);
		$this->set_file_permission($fileName);
	}

	/** recursive function to copy
	 *  all subdirectories and contents:
	 */
	static public function copyr($source, $dest){
		if(is_dir($source)) {
			$dir_handle = opendir($source);
			$sourcefolder = basename($source);
			if (!file_exists($dest.DIRECTORY_SEPARATOR.$sourcefolder)){
				mkdir($dest.DIRECTORY_SEPARATOR.$sourcefolder);
			}
			while($file=readdir($dir_handle)){
				if($file!="." && $file!=".."){
					if(is_dir($source.DIRECTORY_SEPARATOR.$file)){
						//echo 'Copying DIR '.$source.DIRECTORY_SEPARATOR.$file.' ==>> '.$dest.DIRECTORY_SEPARATOR.$sourcefolder.'</br>';
						self::copyr($source.DIRECTORY_SEPARATOR.$file, $dest.DIRECTORY_SEPARATOR.$sourcefolder);
					}
					else{
						//echo 'Copying file '.$source.DIRECTORY_SEPARATOR.$file.' ==>> '.$dest.DIRECTORY_SEPARATOR.$sourcefolder.DIRECTORY_SEPARATOR.$file.'</br>';
						copy($source.DIRECTORY_SEPARATOR.$file, $dest.DIRECTORY_SEPARATOR.$sourcefolder.DIRECTORY_SEPARATOR.$file);
					}
				}
			}
			closedir($dir_handle);
		}
		else{
			copy($source, $dest);
		}
	}
	
	/**
	 * @param {string} version
	 * @returns {int} Number representation of the given version for comparing
	 */
	public function versionAsNumber($version){
		$vers_parts = explode('.',$version);
		$res = 0;
		$m = 100;
		for($i=0;$i<count($vers_parts);$i++){
			$r = intval($vers_parts[$i])*$m;
			$res+= $r;
			$m = $m/10;
		}
		return $res;
	}
	
	/**
	 * @param {DOMDocument} dom
	 * @param {string} fileName
	 */
	public static function saveDOM(&$dom,$fileName){
		//tidy installation
		//sudo apt install libtidy-dev libtidy5 php-tidy
		if (class_exists('tidy')){
			$tidy = new tidy();
			/*
			array(
				'input-xml' => true,
				'indent' => true,
				'wrap' => 0,
				'indent-spaces' => 8,
				'char-encoding' => 'utf8',
				'output-encoding' => 'utf8'
			))			
			*/
			$str = $tidy->repairString($dom->saveXML(),realpath(dirname(__FILE__)).DIRECTORY_SEPARATOR.self::TIDY_INI);
			$str = str_replace("        ","\t",$str); 
			file_put_contents(
				$fileName,
				$str
			);
		}
		else{
			$dom->preserveWhiteSpace = false;
			$dom->formatOutput = true;						
			$dom->save($fileName);
			//Satic??? $this->set_file_permission($fileName);
		}
									
	}
	
	public static function insertStrToMD(&$dom,&$beforeNode,$XMLStr){
		$fragment = $dom->createDocumentFragment();
		$fragment->appendXml($XMLStr);
       		$beforeNode->parentNode->insertBefore($fragment,$beforeNode);
       		//$beforeNode->appendChild($fragment);
	}
	public static function appendStrToMD(&$dom,&$parentNode,$XMLStr){
		$fragment = $dom->createDocumentFragment();
		$fragment->appendXml($XMLStr);
       		$parentNode->appendChild($fragment);
	}
	
}

