<?php
class Logger {
	const DEF_DATE_FORMAT = 'd/m/Y H:i';
	const DEF_BUILD_FILE_MODE='0664';
	const DEF_LOG_MODE='error';
	
	private $file;
	private $content;
	private $dateFormat;
	
	/*	error
	 *	warn
	 *	note
	 */
	private $logLevel;
	
	/*
	 * @param {string} file
	 * @param {array} opts Array of dateFormat,buildGroup,buildFilePermission,logLevel
	 */
	public function __construct($file,$opts=NULL){
	
		$this->file = $file;
		
		if (file_exists($this->file)){
			$this->setPerm = FALSE;
		}
		else{
			$this->content = '';
			$this->setPerm = TRUE;	
		}
		
		$this->dateFormat = (is_array($opts) && array_key_exists('dateFormat',$opts))? $opts['dateFormat']:Logger::DEF_DATE_FORMAT;
		$this->buildGroup = (is_array($opts) && array_key_exists('buildGroup',$opts))? $opts['buildGroup']:NULL;
		$this->buildFileMode = (is_array($opts) && array_key_exists('buildFilePermission',$opts))? $opts['buildFilePermission']:Logger::DEF_BUILD_FILE_MODE;
		
		$this->logLevel = (is_array($opts) && array_key_exists('logLevel',$opts))? $opts['logLevel']:self::DEF_LOG_MODE;
	}
	
	/*
	 * Adds message to log with specified level
	 * @param {string} str
	 * @param {string} logLevel
	 */
	public function add($str,$logLevel=NULL){
		if (!isset($logLevel)){
			$logLevel = self::DEF_LOG_MODE;
		}
		
		if (
			($this->logLevel=='error' && $logLevel=='error')
			|| ($this->logLevel=='warn' && ($logLevel=='error' || $logLevel=='error'))
			|| ($this->logLevel=='note')
		){
			$this->content.=date($this->dateFormat).' '.$str.PHP_EOL;
		}
	}

	/* Writes log data to file
	 */
	public function dump(){
		file_put_contents($this->file, $this->content, FILE_APPEND);
		if ($this->setPerm){
			if ($this->buildGroup){
				chgrp($this->file,$this->buildGroup);
			}			
			exec(sprintf('chmod %s %s',$this->buildFileMode,$this->file));
			$this->setPerm = FALSE;
		}
		$this->content = '';
	}
	
	/* Used for log data iteration
	 */
	public function getLineIterator(){
		$arrayobject = new ArrayObject(explode(PHP_EOL, (isset($this->content) && strlen($this->content))? $this->content:''));
		return $arrayobject->getIterator();		
	}
}
?>
