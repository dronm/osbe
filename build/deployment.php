<?php
/**
 * Для старта нового проекта
 * необходимо запустить скрипт в папке с проектом
 */
 define('FW_REL_DIR','osbe');
 
 define('FW_DIR',stream_resolve_include_path(FW_REL_DIR)); 
 define('REPO_DIR',FW_DIR.DIRECTORY_SEPARATOR.'build');
 
echo '
<html>
	<head>
		<meta http-equiv="content-type" content="text/html; charset=UTF-8"/>
		<title>New project</title>
	</head>
	<body>
	<h2>New project deployment</h2>

';
	define('CMD_START','start');
	
	define('PROJECT_DIR', dirname(__FILE__));	
	
	define('LOG_NAME','build.log');	
	
	require_once(REPO_DIR.DIRECTORY_SEPARATOR."deployment.ini.php");
	
	/*
	define('DEF_OPT_CONSTANTS','checked');
	define('DEF_OPT_GLOB_FILTER','checked');
	define('DEF_OPT_ALL_FORMS','checked');
	define('DEF_OPT_MAIN_MENU','checked');
	define('DEF_OPT_USERS','checked');
	define('DEF_OPT_USER_STORAGE','checked');
	define('DEF_OPT_ABOUT','checked');
	define('DEF_OPT_BANKS','checked');
	define('DEF_OPT_KLADR','checked');
	<fieldset>
		<legend>Тонкая настройка</legend>
		
		<input type="checkbox" value="Использовать констант" name="OPT_CONSTANTS" checked="'.DEF_OPT_CONSTANTS.'"/>
		<input type="checkbox" value="Глобальный фильтр (разделитель учета)" name="OPT_GLOB_FILTER" checked="'.DEF_OPT_GLOB_FILTER.'"/>
		<input type="checkbox" value="Все формы" name="OPT_ALL_FORMS" checked="'.DEF_OPT_ALL_FORMS.'"/>
		<input type="checkbox" value="Основное меню" name="OPT_MAIN_MENU" checked="'.DEF_OPT_MAIN_MENU.'"/>
		<input type="checkbox" value="Пользователи (аккаунты)" name="OPT_USERS" checked="'.DEF_OPT_USERS.'"/>
		<input type="checkbox" value="Пользователи (аккаунты)" name="OPT_USER_STORAGE" checked="'.DEF_OPT_USER_STORAGE.'"/>
		<input type="checkbox" value="О программе" name="OPT_ABOUT" checked="'.DEF_OPT_ABOUT.'"/>
		<input type="checkbox" value="Банки" name="OPT_BANKS" checked="'.DEF_OPT_BANKS.'"/>
		<input type="checkbox" value="Классификатор адресов КЛАДР" name="OPT_KLADR" checked="'.DEF_OPT_KLADR.'"/>
		
	</fieldset>
	*/	
		
	$proj_dir_name_ar = explode(DIRECTORY_SEPARATOR,PROJECT_DIR);
	$proj_dir_name = $proj_dir_name_ar[count($proj_dir_name_ar)-1];
	
	if ($_REQUEST && isset($_REQUEST['cmd']) && $_REQUEST['cmd']==CMD_START){
	
		require_once(REPO_DIR.DIRECTORY_SEPARATOR."Logger.php");
		require_once(REPO_DIR.DIRECTORY_SEPARATOR."ProjectManager.php");
		
		$perm_ar = array(
			'buildGroup' => $_REQUEST['BUILD_GROUP'],
			'buildFilePermission' => $_REQUEST['BUILD_FILE_PERMISSION'],
			'buildDirPermission' => $_REQUEST['BUILD_DIR_PERMISSION']
		);
		
		$proj_man = new ProjectManager(PROJECT_DIR, REPO_DIR, $_REQUEST['JS_DIR'], $perm_ar);
		
		//logger
		$perm_ar['logLevel'] = 'note';
		$log = new Logger(PROJECT_DIR.DIRECTORY_SEPARATOR.'build'.DIRECTORY_SEPARATOR. LOG_NAME, $perm_ar);

		$e = NULL;
		try{
			$proj_man->startProject($_REQUEST, $log);
			$str_res = "New project successfully created!";
		}
		catch (Exception $e){
			$str_res = "Error occured while deploying the project: ".$e->getMessage();
			//it might be that build dir does not exist yet
			if (!file_exists(PROJECT_DIR.DIRECTORY_SEPARATOR.'build')){
				mkdir(PROJECT_DIR.DIRECTORY_SEPARATOR.'build');
			}
		}
		
		$it = $log->getLineIterator();
		while($it->valid()){
			echo '<div>'.$it->current().'</div>';
			$it->next();
		}
		
		$log->add($str_res,'note');
			
		$log->dump();
		
		echo '<p>'.$str_res.'</p>';
		if (is_null($e)){
			echo '<BR></BR>';		
			echo '<p>Go to Build page and build first version!</p>';
			echo '<BR></BR>';		
			echo '<a href="build/">==>> Build</a>';
		}
	}
	
	echo '<form action="'.basename(__FILE__).'" method="POST" name=""
	enctype="multipart/form-data">
		<input type="hidden" value="'.CMD_START.'" name="cmd"/>
		<input type="hidden" value="'.FW_REL_DIR.'" name="FW_DIR"/>
		
		<p>Fields marked with * must be filled!</p>
		<fieldset>
			<legend>Project information</legend>
			<table>
				<tr>
					<td>* Project id:</td>
					<td><input type="text" value="'.$proj_dir_name.'" name="APP_NAME" required="required"/></td>
				</tr>
				<tr>
					<td>Author name:</td>
					<td><input type="text" value="'.DEF_AUTHOR.'" name="AUTHOR"/></td>
				</tr>				
				<tr>
					<td>Author email:</td>
					<td><input type="text" value="'.DEF_TECH_EMAIL.'" name="TECH_EMAIL"/></td>
				</tr>				
				<tr>
					<td>* Javascript directory:</td>
					<td><input type="text" value="'.DEF_JS_DIR.'" name="JS_DIR" required="required"/></td>
				</tr>				
				
			</table>
		</fieldset>
		
		<br></br>
		
		<fieldset>
			<legend>GIT information</legend>
			<p>Empty project MUST exist on github!!!</p>
			<p>If left empty github will not be used.</p>
			<table>
				<tr>
					<td>GIT user name:</td>
					<td><input type="text" value="'.DEF_GITHUB_USER.'" name="GITHUB_USER"/></td>
				</tr>
				<tr>
					<td>Project description:</td>
					<td><textarea name="proj_descr" rows="4"></textarea></td>
				</tr>
				
			</table>	
		</fieldset>
		
		<br></br>
		
		<fieldset>
			<legend>Project locale</legend>
			<table>
				<tr>
					<td>* Project locale:</td>
					<td>
						<input type="text" value="'.DEP_DEF_LOCALE.'" name="LOCALE" required="required"/>
					</td>
				</tr>			
				<tr>
					<td>* Project locale description:</td>
					<td>
						<input type="text" value="'.DEP_DEF_LOCALE_DESCR.'" name="LOCALE_DESCR" required="required"/>
					</td>
				</tr>	
			</table>					
		</fieldset>

		<br></br>
		<fieldset>
			<legend>Project administrator role</legend>
			<table>
				<tr>
					<td>* Role:</td>
					<td>
						<input type="text" value="'.DEF_ADM_ROLE.'" name="ADM_ROLE" required="required"/>
					</td>
				</tr>			
				<tr>
					<td>* Role description:</td>
					<td>
						<input type="text" value="'.DEF_ADM_ROLE_DESCR.'" name="ADM_ROLE_DESCR" required="required"/>
					</td>
				</tr>	
			</table>					
		</fieldset>

		<br></br>		
		<fieldset>
			<legend>File permissions</legend>
			<table>
				<tr>
					<td>* User group:</td>
					<td>
						<input type="text" value="'.DEF_BUILD_GROUP.'" name="BUILD_GROUP" required="required"/>
					</td>
				</tr>
				<tr>
					<td>* File mode:</td>
					<td>
						<input type="text" value="'.DEF_BUILF_FILE_PERM.'" name="BUILD_FILE_PERMISSION" id="file_perm_mode" required="required"/>
					</td>
				</tr>
				<tr>
					<td>* Directory mode:</td>
					<td>
						<input type="text" value="'.DEF_BUILF_DIR_PERM.'" name="BUILD_DIR_PERMISSION" required="required"/>
					</td>
				</tr>
			</table>
		</fieldset>
		
		<br></br>
				
		<fieldset>
			<legend>Database</legend>
			<table>
				<tr>
					<td>* Database server:</td>
					<td>
						<input type="text" value="'.DEF_DB_SERVER.'" name="DB_SERVER" required="required"/>
					</td>
				</tr>
				<tr>
					<td>* Database PORT:</td>
					<td>
						<input type="text" value="'.DEF_DB_PORT.'" name="DB_PORT" required="required"/>
					</td>
				</tr>
			
				<tr>
					<td>Database schema:</td>
					<td>
						<input type="text" value="'.DEF_DB_SCHEMA.'" name="DB_SCHEMA" required="required"/>
					</td>
				</tr>
			
				<tr>
					<td>* Database name:</td>
					<td>
						<input type="text" value="'.$proj_dir_name.'" name="DB_NAME" required="required"/>
					</td>
				</tr>

				<tr><td colspan="2">This user will be used for database creation.</td></tr>
				<tr>					
					<td>* SuperUser name:</td>					
					<td>
						<input type="text" value="'.DEF_DB_CREATE_USER.'" name="DB_CREATE_USER" required="required"/>
					</td>
				</tr>

				<tr>
					<td>SuperUser password:</td>
					<td>
						<input type="text" value="" name="DB_CREATE_PASSWORD"/>
					</td>
				</tr>
			
				<tr><td colspan="2">This user will be used for running sql scripts.</td></tr>
				<tr>
					<td>* Database user name:</td>
					<td>
						<input type="text" value="'.$proj_dir_name.'" name="DB_USER" required="required"/>
					</td>
				</tr>

				<tr>
					<td>* Database user password:</td>
					<td>
						<input type="text" value="" name="DB_PASSWORD" required="required"/>
					</td>
				</tr>
			</table>			
		</fieldset>
		
		<br></br>
		<fieldset>
			<legend>Application administrator user</legend>
			<table>
				<tr>
					<td>* Name:</td>
					<td>
						<input type="text" value="'.DEF_APP_USER.'" name="APP_USER" required="required"/>
					</td>
				</tr>			
				<tr>
					<td>* Password:</td>
					<td>
						<input type="text" value="'.DEF_APP_PWD.'" name="APP_PWD" required="required"/>
					</td>
				</tr>	
				<tr>
					<td>* Time zone locale name:</td>
					<td>
						<input type="text" value="'.DEF_APP_TIMEZONE_NAME.'" name="APP_TIMEZONE_NAME" required="required"/>
					</td>
				</tr>	
				<tr>
					<td>* Time zone locale description:</td>
					<td>
						<input type="text" value="'.DEF_APP_TIMEZONE_DESCR.'" name="APP_TIMEZONE_DESCR" required="required"/>
					</td>
				</tr>	
				<tr>
					<td>* Time zone locale hour difference from UTC:</td>
					<td>
						<input type="text" value="'.DEF_APP_TIMEZONE_HOUR_DIF.'" name="APP_TIMEZONE_HOUR_DIF" required="required"/>
					</td>
				</tr>	
				
			</table>					
		</fieldset>
	
		<fieldset>
			<legend>Initial database scripts</legend>
			<input type="checkbox" value="Execute initial database scripts:" name="EXEC_INIT_DB_SCRIPTS" '.(DEF_EXEC_INIT_DB_SCRIPTS? 'checked="checked"':'').'/>
		</fieldset>
		
		<input type="submit" value="New project" name="submit"/>
	</form>';
	
?>

	</body>
</html>
