<html>
	<head>
		<meta http-equiv="content-type" content="text/html; charset=UTF-8"/>
	</head>
	<body>
	<h1>Project manager 2.0</h1>

<?php
	require_once("ProjectManager.php");
		
	define('REPO_DIR',realpath(dirname(__FILE__)));
	define('BUILD_LOG','build.log');	
	
	require_once('Logger.php');
	
	//commands
	define('SBMT_OPEN_VERS','open_version');
	define('SBMT_CLOSE_VERS','close_version');	
	define('SBMT_MIN_JS','minify_js');
	define('SBMT_LOG_LEVEL','log_level');
	define('SBMT_BUILD_ALL','build_all');
	define('SBMT_BUILD_JSDOC','build_jsdoc');
	define('SBMT_ACT_LOG','act_log');
	define('SBMT_DTD_VALID','dtd_valid');
	define('SBMT_CREATE_SYMLINKS','create_symlinks');
	define('SBMT_PULL','pull');
	define('SBMT_PUSH','push');
	define('SBMT_COMMIT','commit');
	define('SBMT_ZIP_PROJ','zip_project');
	define('SBMT_ZIP_DB','zip_db');
	define('SBMT_TAR_ZIPS','tar_zips');
	define('SBMT_CLONE','clone');
	define('SBMT_UPLOAD','upload');
	
	$js_vers = substr(USER_JS_PATH,0,strlen(USER_JS_PATH)-1);
	echo 'JSVersion='.$js_vers.'</br>';
	$proj_man = new ProjectManager(
		substr(ABSOLUTE_PATH,0,strlen(ABSOLUTE_PATH)-1),
		REPO_DIR,
		$js_vers,
		array(
			'buildGroup' => BUILD_GROUP,
			'buildFilePermission' => BUILD_FILE_PERMISSION,
			'buildDirPermission' => BUILD_DIR_PERMISSION
		)
	);	
	
	$log = new Logger(dirname($proj_man->getMdFile()).'/'. BUILD_LOG,array(
		'buildGroup' => BUILD_GROUP,
		'buildFilePermission' => BUILD_FILE_PERMISSION,
		'buildDirPermission' => BUILD_DIR_PERMISSION,
		'logLevel' => (isset($_REQUEST[SBMT_LOG_LEVEL]))? $_REQUEST[SBMT_LOG_LEVEL]:'error'
		)
	);
	
	function print_log($log){
		$it = $log->getLineIterator();
		while($it->valid()){
			echo '<div>'.$it->current().'</div>';
			$it->next();
		}	
	}
	
	//command
	if (isset($_REQUEST[SBMT_OPEN_VERS])){
		//$proj_man->pull($log);
		//$proj_man->createSymlinks($log);
		$proj_man->openVersion($_REQUEST['version'],$log);
		print_log($log);
		$log->dump();
	}
	
	else if (isset($_REQUEST[SBMT_CLOSE_VERS])){
		/*Version closing
		- create new version file
		- Build everything (project,minifyJS,minifyCSS)
		- set version attribute 'dateClose' in metadata
		- prepare update sql scripts:
			- check for directory build/updates_sql
			- clear directory build/updates_sql, if it exists
			- copy sql scripts to build/update.sql,
			- copy all scripts from build/sql with date modification after version opening
		- Push all to repository
		*/
		$struc = array();
		$proj_man->getVersion($struc);
							
		$proj_man->createVersionFile(trim($struc['version']),$log);						
		$proj_man->build($log);						
		$proj_man->minifyJs($struc['version'],$log);
		$proj_man->minifyCSS($struc['version'],$log);
		//$proj_man->buildJSDoc($log);
		$proj_man->closeVersion($log);			
		$proj_man->prepareSQLForUpdate($log);
		$proj_man->commit($_REQUEST['version_commit_descr'],$log);			
		$proj_man->push($log);			
		print_log($log);
		$log->dump();
		
		echo '<a href="index.php">Main</a>';		
		echo '<a href="cat.php">Catalogue manager</a>';
		echo '<a href="reg.php">Register manager</a>';
		echo '<a href="package.php">Package manager</a>';
	}
	else if (isset($_REQUEST[SBMT_MIN_JS])){
		$struc = array();
		$proj_man->getVersion($struc);
	
		$proj_man->minifyJs($struc['version'],$log);
		$proj_man->minifyCSS($struc['version'],$log);
		print_log($log);
		$log->dump();			
	}
	else if (isset($_REQUEST[SBMT_BUILD_ALL])){
		try{
			$proj_man->build($log);
		}
		catch (Exception $e){
			$log->add('Error! '.$e->getMessage());
		}
		print_log($log);
		$log->dump();			
		echo '<a href="index.php">Main</a>';
		echo '<a href="cat.php">Catalogue manager</a>';
		echo '<a href="reg.php">Register manager</a>';
		echo '<a href="package.php">Package manager</a>';
	}
	else if (isset($_REQUEST[SBMT_BUILD_JSDOC])){
		try{
			$proj_man->buildJSDoc($log);
		}
		catch (Exception $e){
			$log->add('Error! '.$e->getMessage());
		}
		print_log($log);
		$log->dump();			
		echo '<a href="index.php">Main</a>';
		echo '<a href="cat.php">Catalogue manager</a>';
		echo '<a href="reg.php">Register manager</a>';
		echo '<a href="package.php">Package manager</a>';
	}
	else if (isset($_REQUEST[SBMT_DTD_VALID])){
		try{
			$proj_man->DTDValid($log);
		}
		catch (Exception $e){
			$log->add('Error! '.$e->getMessage());
		}
		print_log($log);
		$log->dump();			
		echo '<a href="index.php">Main</a>';
		echo '<a href="cat.php">Catalogue manager</a>';
		echo '<a href="reg.php">Register manager</a>';
		echo '<a href="package.php">Package manager</a>';
	}	
	else if (isset($_REQUEST[SBMT_ACT_LOG])){
		try{
			$proj_man->activityLog($log);
		}
		catch (Exception $e){
			$log->add('Error! '.$e->getMessage());
		}
		print_log($log);
		$log->dump();			
		echo '<a href="index.php">Main</a>';
		echo '<a href="cat.php">Catalogue manager</a>';
		echo '<a href="reg.php">Register manager</a>';
		echo '<a href="package.php">Package manager</a>';
	}	
	
	else if (isset($_REQUEST[SBMT_CREATE_SYMLINKS])){
		$proj_man->createSymlinks($log);
		print_log($log);
		$log->dump();			
	}
	else if (isset($_REQUEST[SBMT_PULL])){
		$proj_man->pull($log);
		$proj_man->createSymlinks($log);
		print_log($log);
		$log->dump();			
	}
	else if (isset($_REQUEST[SBMT_PUSH])){
		$proj_man->push($log);
		print_log($log);
		$log->dump();			
	}	
	else if (isset($_REQUEST[SBMT_COMMIT])){
		$proj_man->commit($_REQUEST['version_commit_descr'],$log);
		print_log($log);
		$log->dump();			
	}	
	
	else if (isset($_REQUEST[SBMT_ZIP_PROJ])){
		$proj_man->zipProject($log);
		print_log($log);
		$log->dump();			
	}
	else if (isset($_REQUEST[SBMT_ZIP_DB])){
		$proj_man->zipDb($log);
		print_log($log);
		$log->dump();			
	}
	else if (isset($_REQUEST[SBMT_TAR_ZIPS])){
		$proj_man->tarZips($log);
		print_log($log);
		$log->dump();			
	}
	else if (isset($_REQUEST[SBMT_CLONE])){
		$proj_man->clone_repo('',APP_NAME,$log);
		print_log($log);
		$log->dump();			
		
	}else if (isset($_REQUEST[SBMT_UPLOAD])){
		try{
			
			if(!defined('PROD_HOSTS')){
				throw new Exception('PROD_HOSTS variable not defined');
			}
			if(!defined('PROD_APP_START')){
				throw new Exception('PROD_APP_START variable not defined');
			}
			if(!defined('PROD_APP_STOP')){
				throw new Exception('PROD_APP_STOP variable not defined');
			}
			if(!defined('PROD_APP_DIR')){
				throw new Exception('PROD_APP_DIR variable not defined');
			}
			if(!defined('DB_SERVER_MASTER')){
				throw new Exception('DB_SERVER_MASTER variable not defined');
			}

			$hosts = explode(",", PROD_HOSTS);
			$proj_man->upload_update(
				array(
					'HOSTS' => $hosts,
					'DB_SERVER' => defined('PROD_DB_SERVER')? PROD_DB_SERVER : NULL,
					'DB_USER' => defined('PROD_DB_USER')? PROD_DB_USER : DB_USER,
					'DB_PASSWORD' => defined('PROD_DB_PASSWORD')? PROD_DB_PASSWORD : DB_PASSWORD,
					'DB_NAME' => defined('PROD_DB_NAME')? PROD_DB_NAME : DB_NAME,
					'APP_START' => PROD_APP_START,
					'APP_STOP' => PROD_APP_STOP,
					'DB_SERVER_MASTER' => DB_SERVER_MASTER,
					'FILES' => defined('PROD_FILES')? explode(",", PROD_FILES) : NULL,
					'APP_DIR' => defined('PROD_APP_DIR')? PROD_APP_DIR : NULL
				),
				$log
			);			
		}catch (Exception $e){
			$log->add('Error! '.$e->getMessage());
		}
		print_log($log);
		$log->dump();			
	}
		
	if (!file_exists($proj_man->getMdFile())){
		//new project
		echo "<h4>Metadata file is not found.</h4>";
	}
	else{
		echo '<a href="cat.php">Catalogue manager</a>';
		echo '<a href="reg.php">Register manager</a>';
		echo '<a href="package.php">Package manager</a>';
		
		$struc = array();
		$proj_man->getVersion($struc);

		$opened = (array_key_exists('dateOpen',$struc));
		$closed = ($opened&&array_key_exists('dateClose',$struc));
		
		echo '<form action="index.php" method="POST" name=""
		enctype="multipart/form-data">
			<h4>Update managing</h4>
			<input type="submit" value="Zip project" name="'.SBMT_ZIP_PROJ.'"/>
			<input type="submit" value="Zip database" name="'.SBMT_ZIP_DB.'"/>
		</form>';	
		
		$vesr_open_cmd = '';
		$cur_vers = '';
		if ($opened && !$closed){
			$vesr_open_cmd = 
			'<div class="form-group">
				<label for="version_commit_descr" class="col-sm-4 control-label">Version commit description:</label>
				<div class="col-sm-4">
					<textarea name="version_commit_descr" rows="4" style="width:100%;"></textarea>
				</div>
			</div>
			<input type="submit" value="'.SBMT_CLOSE_VERS.'" name="close_version"/>
			<input type="submit" value="Add && commit" name="'.SBMT_COMMIT.'"/>
			';

			$cur_vers = $struc['version'];
		}
		else if (!$opened||($opened&&$closed)){
			$vesr_open_cmd = '<input type="submit" value="Open version" name="'.SBMT_OPEN_VERS.'"/>';
			$cur_vers = (count($struc))? ($struc['version'].'?'):'1.0.001';
		}
		
		echo '<form action="index.php" method="POST" name=""
		enctype="multipart/form-data">
			<h4>Version managing</h4>
			<div class="form-group">							
				<label for="version" class="col-sm-4 control-label">Current version:</label>
				<input type="text" name="version" size="10" maxlength="10" value="'.$cur_vers.'"/>
			</div>
			'.$vesr_open_cmd.'
			<input type="submit" value="Create unified js,css" name="'.SBMT_MIN_JS.'"/>
			<input type="submit" value="Activity log script" name="'.SBMT_ACT_LOG.'"/>
			<input type="submit" value="JS documentation" name="'.SBMT_BUILD_JSDOC.'"/>
			<input type="submit" value="DTD validation" name="'.SBMT_DTD_VALID.'"/>
		</form>';	
		
		//if ($opened&&!$closed){
			echo '<form action="index.php" method="POST" name=""
			enctype="multipart/form-data">
				<h4>Project managing</h4>
				<input type="radio" name="'.SBMT_LOG_LEVEL.'" value="error" checked/>Error</br>
				<input type="radio" name="'.SBMT_LOG_LEVEL.'" value="warn"/>Warn</br>
				<input type="radio" name="'.SBMT_LOG_LEVEL.'" value="note"/>Note</br>
				<input type="submit" value="Build project (php,js)" name="'.SBMT_BUILD_ALL.'"/>				
				<input type="submit" value="Upload update" name="'.SBMT_UPLOAD.'"/>
				<input type="submit" value="Create all symlinks" name="'.SBMT_CREATE_SYMLINKS.'"/>
				<input type="submit" value="Pull from repo" name="'.SBMT_PULL.'"/>
				<input type="submit" value="Push to repo" name="'.SBMT_PUSH.'"/>
				<input type="submit" value="Clone repo" name="'.SBMT_CLONE.'"/>								
			</form>';			
	}
?>
	</body>
</html>
