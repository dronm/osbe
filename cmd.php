<?php
require_once('Config.php');
require_once(FRAME_WORK_PATH.'Constants.php');
require_once(FRAME_WORK_PATH.'db/SessManager.php');
require_once(FRAME_WORK_PATH.'db/db_pgsql.php');

require_once(FRAME_WORK_PATH.'basic_classes/Controller.php');
require_once(FRAME_WORK_PATH.'basic_classes/ModelServResponse.php');
require_once(FRAME_WORK_PATH.'basic_classes/FieldSQLString.php');
require_once(FRAME_WORK_PATH.'basic_classes/FieldExtString.php');

//require_once(FRAME_WORK_PATH.'basic_classes/MethodCasher.php');

function get_framework_absolute_path(){
	$path_ar = explode(PATH_SEPARATOR, get_include_path());	
	return (count($path_ar)>=1)? $path_ar[1].'/'.FRAME_WORK_PATH.'basic_classes/':NULL;
}

try{
	//master connection for writing
	$dbLinkMaster = new DB_Sql();
	$dbLinkMaster->persistent = TRUE;
	$dbLinkMaster->appname = APP_NAME;
	$dbLinkMaster->technicalemail = TECH_EMAIL;
	$dbLinkMaster->detailedError = defined('DETAILED_ERROR')? DETAILED_ERROR:DEBUG;
	$dbLinkMaster->database	= DB_NAME;
	$dbLinkMaster->productionConnectError = ERR_SQL_SERVER_CON;
	$dbLinkMaster->productionSQLError = ERR_SQL_QUERY;	
	if (defined('QUERY_LOG'))$dbLinkMaster->logQueries = QUERY_LOG;
	if (defined('QUERY_LOG_FILE'))$dbLinkMaster->logFile = QUERY_LOG_FILE;
	if (defined('QUERY_EXPLAIN'))$dbLinkMaster->explain = QUERY_EXPLAIN;
	$port = (defined('DB_PORT_MASTER'))? DB_PORT:NULL;
	$dbLinkMaster->connect(DB_SERVER_MASTER,DB_USER,DB_PASSWORD,$port);
	//$dbLinkMaster->set_error_verbosity((DEBUG)? PGSQL_ERRORS_VERBOSE:PGSQL_ERRORS_TERSE);
	if (DB_SERVER_MASTER==DB_SERVER){
		$dbLink = $dbLinkMaster;
	}
	else{
		// connection for reading
		$dbLink = new DB_Sql();
		$dbLink->persistent=true;
		$dbLink->appname = APP_NAME;
		$dbLink->technicalemail = TECH_EMAIL;
		$dbLink->database= DB_NAME;			
		$dbLink->productionConnectError = ERR_SQL_SERVER_CON;
		$dbLink->productionSQLError = ERR_SQL_QUERY;		
		$dbLink->detailedError = defined('DETAILED_ERROR')? DETAILED_ERROR:DEBUG;
		if (defined('QUERY_LOG'))$dbLink->logQueries = QUERY_LOG;
		if (defined('QUERY_LOG_FILE'))$dbLink->logFile = QUERY_LOG_FILE;
		if (defined('QUERY_EXPLAIN'))$dbLink->explain = QUERY_EXPLAIN;
		$port = (defined('DB_PORT'))? DB_PORT:NULL;
		try{
			$dbLink->connect(DB_SERVER,DB_USER,DB_PASSWORD,$port);		
		}
		catch (Exception $e){
			$dbLink = $dbLinkMaster;
		}
	}
	
	if(defined('SESS_SERVER_MASTER')&&defined('SESS_DB_NAME')&&defined('SESS_USER')&&defined('SESS_PASSWORD')){	
		if (DB_SERVER_MASTER==SESS_SERVER_MASTER){
			$dbLinkSessMaster = $dbLinkMaster;
		}
		else{
			// new connection
			$dbLinkSessMaster = new DB_Sql();
			$dbLinkSessMaster->persistent=true;
			$dbLinkSessMaster->appname = APP_NAME;
			$dbLinkSessMaster->technicalemail = TECH_EMAIL;
			$dbLinkSessMaster->database= SESS_DB_NAME;			
			$dbLinkSessMaster->productionConnectError = ERR_SQL_SERVER_CON;
			$dbLinkSessMaster->productionSQLError = ERR_SQL_QUERY;		
			$dbLinkSessMaster->detailedError = defined('DETAILED_ERROR')? DETAILED_ERROR:DEBUG;
			if (defined('QUERY_LOG'))$dbLinkSessMaster->logQueries = QUERY_LOG;
			if (defined('QUERY_LOG_FILE'))$dbLinkSessMaster->logFile = QUERY_LOG_FILE;
			if (defined('QUERY_EXPLAIN'))$dbLinkSessMaster->explain = QUERY_EXPLAIN;
			$port = (defined('DB_PORT'))? DB_PORT:NULL;
			$dbLinkSessMaster->connect(SESS_SERVER_MASTER,SESS_USER,SESS_PASSWORD,$port);		
		}
		
		if (!defined('SESS_SERVER')||SESS_SERVER_MASTER==SESS_SERVER){
			$dbLinkSess = $dbLinkSessMaster;
		}
		else{
			// connection for reading
			$dbLinkSess = new DB_Sql();
			$dbLinkSess->persistent=true;
			$dbLinkSess->appname = APP_NAME;
			$dbLinkSess->technicalemail = TECH_EMAIL;
			$dbLinkSess->database= SESS_DB_NAME;			
			$dbLinkSess->productionConnectError = ERR_SQL_SERVER_CON;
			$dbLinkSess->productionSQLError = ERR_SQL_QUERY;		
			$dbLinkSess->detailedError = defined('DETAILED_ERROR')? DETAILED_ERROR:DEBUG;
			if (defined('QUERY_LOG'))$dbLinkSess->logQueries = QUERY_LOG;
			if (defined('QUERY_LOG_FILE'))$dbLinkSess->logFile = QUERY_LOG_FILE;
			if (defined('QUERY_EXPLAIN'))$dbLinkSess->explain = QUERY_EXPLAIN;
			$port = (defined('DB_PORT'))? DB_PORT:NULL;
			$dbLinkSess->connect(SESS_SERVER,SESS_USER,SESS_PASSWORD,$port);		
		}
		
	}
	else{
		$dbLinkSessMaster = $dbLinkMaster;
		$dbLinkSess = $dbLink;
	}

	/* ******************** Token Authorization ************************* */
	$token = NULL;
	$token_from_cookie = FALSE;
	if (defined('PARAM_TOKEN') && isset($_REQUEST[PARAM_TOKEN])){
		$token = $_REQUEST[PARAM_TOKEN]; 
	}
	else if (defined('PARAM_TOKEN') && isset($_COOKIE[PARAM_TOKEN])){
		$token = $_COOKIE[PARAM_TOKEN]; 
		$token_from_cookie = TRUE;
	}

	//defined('SESSION_WS_COMPATIBLE')? SESSION_WS_COMPATIBLE:FALSE
	//@ToDO
	$session = new SessManager();
	if (defined('QUERY_LOG_FILE'))$session->logFile = QUERY_LOG_FILE;
	$session->detailedError = defined('DETAILED_ERROR')? DETAILED_ERROR:DEBUG;
	$session->productionError = ERR_SESSION;

	$sess_inf = NULL;
	$sess_found = FALSE;	
	if(strlen(session_id())){
		//previously set
		$sess_found = TRUE;
		$sessInf = array(
			'session_id' => session_id(),
			'expired' => FALSE,
			'died' => FALSE,
			'pub_key' => ''
		);		
	}
	else if (isset($token)){	//  ???? 15/04/21	&& $token_from_cookie
		//token in parameter
		$sess_found = SessManager::findSession($token, $dbLinkSess, $sess_inf);		
		if(!$sess_found){
			//token comes from cookie but it is dead!
			setcookie(PARAM_TOKEN,$token,time()-3600);
			$token = NULL;
		}
	}

	$session->start(
		'_s',
		$dbLinkSessMaster,
		$dbLinkSess,
		FALSE,
		(defined('SESSION_LIVE_SEC')? intval(SESSION_LIVE_SEC):0),
		(defined('SESSION_KEY')? SESSION_KEY:'')		
	);
//throw new Exception('session_id()='.session_id());			

	if(is_null($token) && defined('PARAM_TOKEN') && isset($_SESSION[PARAM_TOKEN])){
		$sess_found = SessManager::findSession($_SESSION[PARAM_TOKEN],$dbLinkSess,$sess_inf);
	}
	//*************************
	if (
	(!$sess_found || $sess_inf['died']=='t')
	//&& (!defined('SESSION_AFTER_DIED_METHODS') || (isset($_REQUEST[PARAM_METHOD]) && !in_array($_REQUEST[PARAM_METHOD],explode(',',SESSION_AFTER_DIED_METHODS))) )
	){	
		if($sess_found && !is_null($sess_inf['pub_key'])){
			$dbLinkSessMaster->query(sprintf("UPDATE logins SET date_time_out = now() WHERE pub_key='%s'",$sess_inf['pub_key']));
		}
		//Public methods (guest role) are blocked if not set in SESSION_AFTER_DIED_METHODS!
		//throw new Exception(ERR_AUTH_NOT_LOGGED);//
	}		

	if ($sess_found
	&& $sess_inf['died']!='t'
	&& $sess_inf['expired']=='t'
	&& (!defined('SESSION_AFTER_EXPIR_METHODS') || (isset($_REQUEST[PARAM_METHOD]) && !in_array($_REQUEST[PARAM_METHOD],explode(',',SESSION_AFTER_EXPIR_METHODS))) )
	){		
		throw new Exception(ERR_AUTH_EXP);
	}		

	if(
	$sess_found && ($sess_inf['died']=='t' || $sess_inf['expired']=='t')
	&& !isset($_REQUEST[PARAM_METHOD])
	){
		$session->restart();
	}

	//setting locale
	if (isset($_SESSION['user_time_locale'])){			
		$q = sprintf("SET TIME ZONE '%s'",
			$_SESSION['user_time_locale']
		);
		$dbLink->query($q);
		if (DB_SERVER_MASTER!=DB_SERVER){
			$dbLinkMaster->query($q);
		}
		if (defined('SESS_SERVER_MASTER') && SESS_SERVER_MASTER!=DB_SERVER_MASTER){
			$dbLinkSessMaster->query($q);
		}
		if (defined('SESS_SERVER') && SESS_SERVER!=SESS_SERVER_MASTER){
			$dbLinkSess->query($q);
		}
		
		//php locale		
		date_default_timezone_set($_SESSION['user_time_locale']);
	}
	
	if (!isset($_SESSION['scriptId'])){
		$_SESSION['scriptId'] = md5(session_id());
	}
			
	//*****************************
	//default page params
	if (!isset($_SESSION['LOGGED'])){			
		if (!isset($_REQUEST[PARAM_CONTROLLER])){
			$_REQUEST[PARAM_CONTROLLER] = UNLOGGED_DEF_CONTROLLER;
		}
		if (!isset($_REQUEST[PARAM_VIEW])){
			$_REQUEST[PARAM_VIEW] = UNLOGGED_DEF_VIEW;
			unset($_REQUEST[PARAM_METHOD]);
		}
	}
	
	$contr = (isset($_REQUEST[PARAM_CONTROLLER]) && strlen($_REQUEST[PARAM_CONTROLLER]))? $_REQUEST[PARAM_CONTROLLER]:null;
	$meth = (isset($_REQUEST[PARAM_METHOD]) && strlen($_REQUEST[PARAM_METHOD]))? $_REQUEST[PARAM_METHOD]:null;	
	$view = (isset($_REQUEST[PARAM_VIEW]) && strlen($_REQUEST[PARAM_VIEW]))? $_REQUEST[PARAM_VIEW]:DEF_VIEW;
	//throw new Exception("contr=".$contr.' meth='.$meth.' view='.$view);
	
	$framework_absolute_path = NULL;

	/* controller checking*/	
	if (!is_null($contr) && !file_exists($script=USER_CONTROLLERS_PATH.$contr.'.php')){	
		if (!isset($_SESSION['LOGGED'])){
			throw new Exception(ERR_AUTH_NOT_LOGGED);
		}
		else{		
			throw new Exception(ERR_COM_NO_CONTROLLER);
		}
	}
	else if (
		(is_null($contr) && defined('CUSTOM_CONTROLLER') && file_exists($script=USER_CONTROLLERS_PATH.CUSTOM_CONTROLLER.'.php'))
		||
		(is_null($contr) && defined('CUSTOM_CONTROLLER') && file_exists($script=($framework_absolute_path = get_framework_absolute_path()).CUSTOM_CONTROLLER.'.php'))
	){	
		$contr = CUSTOM_CONTROLLER;
	}
	else if (is_null($contr)){
		$contr = 'Controller';
		$script=FRAME_WORK_PATH.'basic_classes/Controller.php'; 
	}
//throw new Exception("LOGGED=". (isset($_SESSION['LOGGED'])? $_SESSION['LOGGED']:'NULL'). ' RoleID='.( (isset($_SESSION['role_id']))? $_SESSION['role_id'] : 'guest') );
	//checking if method is allowed
	if (!is_null($meth)){
		$role_id = (isset($_SESSION['LOGGED']) && isset($_SESSION['role_id']))? $_SESSION['role_id'] : 'guest';
		$role_perm_f = PERM_PATH.'permission_'.$role_id.'.php';
		if(!file_exists($role_perm_f)){
			throw new Exception(ERR_COM_METH_PROHIB);
		}
		require($role_perm_f);
		
		if (!method_allowed($contr,$meth,$role_id)){
			if (!isset($_SESSION['LOGGED'])){
				throw new Exception(ERR_AUTH_NOT_LOGGED);
			}
			else{		
				throw new Exception(ERR_COM_METH_PROHIB);
			}
		}
		
	}
//throw new Exception("Methos ALLOWED!");
	//cash handling	
	/*if(MethodCasher::echoFromCash()){
		return;
	}*/
	
	/* including controller */	
	require_once($script);
	$contrObj = new $contr($dbLinkMaster,$dbLink);

	/* view checking*/
	if (is_null($view)){
		$def_view = $contrObj->getDefaultView();
		$view = (isset($def_view))? $def_view:DEF_VIEW;
		if (!isset($view)){
			throw new Exception(ERR_COM_NO_VIEW);
		}	
	}
	$view_class = $view;
	if (!file_exists($v_script=USER_VIEWS_PATH.$view.'.php')){	
		if(is_null($framework_absolute_path)){
			$framework_absolute_path = get_framework_absolute_path();
		}
		/*
		$pathArray = explode(PATH_SEPARATOR, get_include_path());	
		$v_script = (count($pathArray)>=1)?
			$pathArray[1].'/'.FRAME_WORK_PATH.'basic_classes/'.$view.'.php' :
			USER_VIEWS_PATH.$view.'.php';
		*/
		$v_script = !is_null($framework_absolute_path)? $framework_absolute_path.$view.'.php' : USER_VIEWS_PATH.$view.'.php';
		if (!file_exists($v_script)){	
			if (file_exists($v_script=USER_VIEWS_PATH.DEF_VIEW.'.php')){
				$view_class = DEF_VIEW;
			}
			else{
				throw new Exception(ERR_COM_NO_VIEW);
			}
		}
	}
	
	require_once($v_script);

	if (!$contrObj->runPublicMethod($meth,$_REQUEST)){
		/*if nothing has been sent yet - default output*/
		$contrObj->write($view_class,$view);
	}
}
catch (Exception $e){
	if (defined('PARAM_TEMPLATE')){
		unset($_REQUEST[PARAM_TEMPLATE]);
	}
	$contrObj = new Controller($dbLinkMaster,$dbLinkMaster);	
	$resp = new ModelServResponse();				
	$contrObj->addModel($resp);	
	$ar = explode('@',$e->getMessage());
	$resp->result = (count($ar)>1)? intval($ar[1]) : 1;
	if ($resp->result==0){
		$resp->result = 1;
	}
	if (count($ar)){		
		//$resp->descr = htmlspecialchars(str_replace("exception 'Exception' with message",'','111='.$ar[0]));		
		$er_s = str_replace('ОШИБКА: ','',$ar[0]);//ошибки postgre
		$er_s = str_replace("exception 'Exception' with message '",'',$er_s);
		$resp->descr = $er_s;//htmlspecialchars($er_s,ENT_XML1,'UTF-8',FALSE);//
	}
	else{
		$resp->descr = $e->getMessage();//htmlspecialchars($e->getMessage(),ENT_XML1,'UTF-8',FALSE);
	}
	
	$view = (isset($_REQUEST[PARAM_VIEW]))? $_REQUEST[PARAM_VIEW]:DEF_VIEW;
	
	//throw new Exception("v=".USER_VIEWS_PATH.$view.'.php');
	if (!isset($v_script)){
		//not included yet
		if (!file_exists($v_script=USER_VIEWS_PATH.$view.'.php')){	
			$pathArray = explode(PATH_SEPARATOR, get_include_path());	
			$v_script = (count($pathArray)>=1)?
				$pathArray[1].'/'.FRAME_WORK_PATH.'basic_classes/'.$view.'.php' :
				USER_VIEWS_PATH.$view.'.php';
		}
		if (file_exists($v_script)){
			require_once($v_script);		
		}
	}
	
	$contrObj->write($view,$view,$resp->result);
	
}
?>
