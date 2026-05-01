<?xml version="1.0" encoding="UTF-8"?>

<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:import href="Controller_php.xsl"/>

<!-- -->
<xsl:variable name="CONTROLLER_ID" select="'ProjectManager'"/>
<!-- -->

<xsl:output method="text" indent="yes"
			doctype-public="-//W3C//DTD XHTML 1.0 Strict//EN" 
			doctype-system="http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"/>
			
<xsl:template match="/">
	<xsl:apply-templates select="metadata/controllers/controller[@id=$CONTROLLER_ID]"/>
</xsl:template>

<xsl:template match="controller"><![CDATA[<?php]]>

<xsl:call-template name="add_requirements"/>

require_once('common/Logger.php');
require_once(FRAME_WORK_PATH.'basic_classes/ModelVars.php');
require_once(FRAME_WORK_PATH.'build/ProjectManager.php');

class <xsl:value-of select="@id"/>_Controller extends Controller{

	const INVALID_UPDATE = 'Нет обновлений для данного проекта!';
	const BUILD_LOG = 'build.log';
	
	private $projManager;
	private $log;

	private function getProjectDir(){
		return substr(ABSOLUTE_PATH,0,strlen(ABSOLUTE_PATH)-1);
	}

	private function getJsDir(){
		return substr(USER_JS_PATH,0,strlen(USER_JS_PATH)-1);
	}

	private function getRepoDir(){
		$pathArray = explode(PATH_SEPARATOR, get_include_path());
		if (count($pathArray)>=2){
			return $pathArray[1].'/'. substr(FRAME_WORK_PATH,0,strlen(FRAME_WORK_PATH)-1).'/'. 'build';
		}
	}
	
	private function printLog(){	
		$lines = array();
		$it = $this->log->getLineIterator();
		$i = 0;
		while($it->valid()){		
			array_push($lines,new Field('line'.$i,DT_STRING,array('value'=>$it->current())));
			$i++;
			
			$it->next();
		}	
		$this->addModel(new ModelVars(
			array('name'=>'Vars',
				'id'=>'Log_Model',
				'values'=>$lines
			)
		));		
	
		$this->log->dump();
	}
	
	public function __construct(){
		<xsl:apply-templates/>
		
		$this->projManager = new ProjectManager(
			$this->getProjectDir(),
			$this->getRepoDir(),
			$this->getJsDir(),
			array(
				'buildGroup' => BUILD_GROUP,
				'buildFilePermission' => BUILD_FILE_PERMISSION,
				'buildDirPermission' => BUILD_DIR_PERMISSION
			)
		);					
		
		$this->log = new Logger(dirname($this->projManager->getMdFile()).'/'. self::BUILD_LOG,array(
			'buildGroup' => BUILD_GROUP,
			'buildFilePermission' => BUILD_FILE_PERMISSION,
			'buildDirPermission' => BUILD_DIR_PERMISSION
			)
		);
		
	}
	
	
	/* *****************************  */
	public function get_version($pm){
		$this->projManager->getVersion($struc);
		
		$this->addModel(new ModelVars(
			array('name'=>'Vars',
				'id'=>'Version_Model',
				'values'=>array(
					new Field('version',DT_STRING,
						array('value'=>$struc['version'])),
					new Field('dateOpen',DT_STRING,
						array('value'=>$struc['dateOpen'])),
					new Field('dateClose',DT_INT,
						array('value'=>$struc['dateClose'])),
					new Field('lastBuild',DT_STRING,
						array('value'=>$struc['lastBuild']))						
				)
			)
		));					
	}
	
	public function open_version($pm){
		$this->projManager->openVersion($_REQUEST['version'],$this->log);
		$this->printLog();
	}
	
	public function close_version($pm){
		$struc = array();
		$this->projManager->getVersion($struc);
							
		$this->projManager->createVersionFile($struc['version'],$this->log);						
		$this->projManager->build($this->log);						
		$this->projManager->minifyJs($struc['version'],$this->log);
		$this->projManager->minifyCSS($struc['version'],$this->log);
		$this->projManager->closeVersion($this->log);			
		$this->projManager->prepareSQLForUpdate($this->log);
		$this->projManager->push($_REQUEST['commit_description'],$this->log);
		
		$this->printLog();
	}
	
	public function minify_js($pm){
		$struc = array();
		$this->projManager->getVersion($struc);
	
		$this->projManager->minifyJs($struc['version'],$this->log);
		$this->projManager->minifyCSS($struc['version'],$this->log);
		
		$this->printLog();
	}
	
	public function build_all($pm){
		$this->projManager->build($this->log);
		
		$this->printLog();
	}
	
	public function create_symlinks($pm){
		$this->projManager->createSymlinks($this->log);
	}
	
	public function pull($pm){
		$this->projManager->pull($this->log);
		$this->projManager->createSymlinks($this->log);	
		$this->printLog();
	}
	
	public function push($pm){
		$this->projManager->push($_REQUEST['commit_description'],$this->log);
		$this->printLog();
	}
	
	public function zip_project($pm){
		$this->projManager->zipProject($this->log);
		$this->printLog();
	}
	
	public function zip_db($pm){
		$this->projManager->zipDb($this->log);
		$this->printLog();
	}
	
	public function apply_patch($pm){	
		if(DEBUG){
			throw new Exception('Can not be done in debug mode!');
		}
	
		$this->projManager->pull($this->log);
		$this->printLog();
						
		//remove build directory
		exec('rm -f -r '. $this->getProjectDir().'/'. ProjectManager::BUILD_DIR);
		
		//remove updates/sql directory
		exec('rm -f -r '. $this->getProjectDir().'/'. ProjectManager::UPDATES_DIR.'/'. ProjectManager::SQL_DIR);
		
	}
	
	public function apply_sql($pm){
		$this->projManager->applySQL(
			array(
				'DB_PASSWORD' => DB_PASSWORD,
				'DB_SERVER_MASTER' => DB_SERVER_MASTER,
				'DB_NAME' => DB_NAME,
				'DB_USER' => DB_USER
			),
			$this->log
		);
		$this->printLog();
	}
	
}
<![CDATA[?>]]>
</xsl:template>

</xsl:stylesheet>
