<?php

require_once(FRAME_WORK_PATH.'Constants.php');
require_once(FRAME_WORK_PATH.'db/SessManager.php');
require_once(FRAME_WORK_PATH.'db/db_pgsql.php');
require_once('Logger.php');

class AppSrv {

	const COMMANDS = array(
		"registerListener" => array(
			"handler" => "cmd_registerListener"
			,"params" => array(
				array(
					"id"		=> "appId"
					,"required"	=> TRUE
					,"dataType"	=> "string"
				)
				,array(
					"id"		=> "token"
					,"required"	=> TRUE
					,"dataType"	=> "string"
				)			
				,array(
					"id"		=> "tokenExpires"
					,"required"	=> TRUE
					,"dataType"	=> "string"
				)			
			)
		)
		,"listenerCheck" => array(
			"handler" => "cmd_listenerCheck"
		)
		,"subscribe" => array(
			"handler" => "cmd_subscribe"
			,"params" => array(
				 array(
					"id"		=> "groupId"
					,"required"	=> TRUE
					,"dataType"	=> "string"
				)
				,array(
					"id"		=> "events"
					,"required"	=> TRUE
					,"dataType"	=> "array"
				)
			)
		)
		,"unsubscribe" => array(
			"handler" => "cmd_unsubscribe"
			,"params" => array(
				array(
					"id"		=> "groupId"
					,"required"	=> TRUE
					,"dataType"	=> "string"
				)
			)
		)
		,"publish" => array(
			"handler" => "cmd_publish"
			,"params" => array(
				array(
					"id"		=> "appId"
					,"required"	=> true
					,"dataType"	=> "string"
				)
				,array(
					"id"		=> "eventId"
					,"required"	=> TRUE
					,"dataType"	=> "string"
				)
				,array(
					"id"		=> "params"
					,"required"	=> FALSE
					,"dataType"	=> "object"
					,"isArray"	=> TRUE
				)
			)
		)		
	);

	const MES_TYPES = array(
		"eventNotify"	=> 0
		,"error"	=> 1
		,"registered"	=> 2
	);

	public $dbLinkMaster;
	public $dbLink;
	public $dbLinkSessMaster;
	public $dbLinkSess;

	public static function connectionFabric(){
		$conn				= new DB_Sql();
		$conn->persistent		= TRUE;
		$conn->appname			= APP_NAME;
		$conn->technicalemail		= TECH_EMAIL;
		$conn->detailedError		= defined('DETAILED_ERROR')? DETAILED_ERROR:DEBUG;
		$conn->database			= DB_NAME;
		$conn->productionConnectError	= ERR_SQL_SERVER_CON;
		$conn->productionSQLError	= ERR_SQL_QUERY;	
		
		if (defined('QUERY_LOG'))$conn->logQueries	= QUERY_LOG;
		if (defined('QUERY_LOG_FILE'))$conn->logFile	= QUERY_LOG_FILE;
		if (defined('QUERY_EXPLAIN'))$conn->explain	= QUERY_EXPLAIN;
	
		return $conn;
	}

	public function init(){
		$this->initDB();
	}
	
	public function __construct($opts){
		$this->log = new Logger($opts['logFile'],array('logLevel' => $opts['logLevel']));
	}
	
	private function initDB(){
		//master connection for writing
		$this->dbLinkMaster = self::connectionFabric();
		$this->dbLinkMaster->connect(
			DB_SERVER_MASTER
			,DB_USER
			,DB_PASSWORD
			,(defined('DB_PORT_MASTER'))? DB_PORT:NULL
		);
		
		if (DB_SERVER_MASTER==DB_SERVER){
			$this->dbLink = $this->dbLinkMaster;
		}
		else{
			// connection for reading
			$this->dbLink = self::connectionFabric();
			try{
				$this->dbLink->connect(
					DB_SERVER
					,DB_USER
					,DB_PASSWORD
					,(defined('DB_PORT'))? DB_PORT:NULL
				);		
			}
			catch (Exception $e){
				$this->dbLink = $this->dbLinkMaster;
			}
		}
	
		//session db
		if(defined('SESS_SERVER_MASTER')&&defined('SESS_DB_NAME')&&defined('SESS_USER')&&defined('SESS_PASSWORD')){	
			if (DB_SERVER_MASTER == SESS_SERVER_MASTER){
				$this->dbLinkSessMaster = $this->dbLinkMaster;
			}
			else{
				// new connection
				$this->dbLinkSessMaster = self::connectionFabric();
				$this->dbLinkSessMaster->connect(
					SESS_SERVER_MASTER
					,SESS_USER
					,SESS_PASSWORD
					,(defined('DB_PORT'))? DB_PORT:NULL
				);		
			}
			
			if (!defined('SESS_SERVER')||SESS_SERVER_MASTER==SESS_SERVER){
				$this->dbLinkSess = $this->dbLinkSessMaster;
			}
			else{
				// connection for reading
				$this->dbLinkSess = self::connectionFabric();
				$this->dbLinkSess->connect(
					SESS_SERVER
					,SESS_USER
					,SESS_PASSWORD
					,(defined('DB_PORT'))? DB_PORT:NULL
				);		
			}
			
		}
		else{
			$this->dbLinkSessMaster = $this->dbLinkMaster;
			$this->dbLinkSess = $this->dbLink;
		}	
	}
	
	//**************** Events *****************************
	public function onClientConnect($connection){
		$this->log->add("onClientConnect",'debug',TRUE);
	}

	public function onClientDisconnect($connection){
		$this->log->add("onClientDisconnect",'debug',TRUE);
	}
	
	public function onClientMessage($connection, $data){
		$this->log->add("onClientMessage: ".var_export($data,TRUE)."\n",'debug',TRUE);
	}

	public function checkDbNotifcation(){
		try{
			$data = $this->dbLink->get_notify();
			if($data !== FALSE){
				/** message,pid,payload
				 */
				$this->log->add("onDbNotification: ".var_export($data,TRUE)."\n",'debug',TRUE);
				
			    	
		    		if(!$data['payload']){
		    			throw new Exception('onDbNotification: payload is missing');
		    		}
		    		
		    		$struc = json_decode(json_encode($data['payload']));
				$struc->appId = APP_NAME;
				$struc->cmd = "publish";
				$struc->eventId = $data['message'];
				
				$this->run_cmd(NULL,$struc);
			}
		}
		catch (Exception $e){
			$this->log->add('checkDbNotifcation: '.$e->getMessage(),'error',TRUE);
		}				
			
	}
	//**************** Events *****************************
	
	/**
	 * Command executor
	 */
	private function run_cmd($client,$struc){
		if($struc->cmd && self::COMMANDS[$struc->cmd]){
			if(self::COMMANDS[$struc->cmd]['params']){
				for($i=0;$i<count(self::COMMANDS[$struc->cmd]['params']);$i++){
					if(
					self::COMMANDS[$struc->cmd]['params'][$i]['required']===TRUE
					&& !$struc[self::COMMANDS[$struc->cmd]['params'][$i]['id']]
					){
						throw new Exception('Obligatory param '.self::COMMANDS[$struc->cmd]['params'][$i]['id'].' not found!');
					}
					
					if(
					$struc[self::COMMANDS[$struc->cmd]['params']]
					&& gettype($struc[self::COMMANDS[$struc->cmd]['params'][$i]['id']])!=self::COMMANDS[$struc->cmd]['params'][$i]['dataType']
					/*||
					(
						$struc[self::COMMANDS[$struc->cmd]['params'][$i]['dataType']==='array'
						&&
						(
							(Array.isArray && !Array.isArray(struc[self::COMMANDS[$struc->cmd].params[i].id]))
							||
							(Object.prototype.toString.call(struc[self::COMMANDS[$struc->cmd].params[i].id]) !== '[object Array]' )
						)
					)*/
					){
						throw new Error('Param '.self::COMMANDS[$struc->cmd]['params'][$i]['id'].' data type error!');
					}
				}
			}
			//to_log("Calling handler "+self::COMMANDS[$struc->cmd].handler,LOG_MSG.debug);
			$meth = self::COMMANDS[$struc->cmd]['handler'];
			if (method_exists($this,$meth)) {				
				$this->$meth($client,$struc);
			}					
			
		}
		else{
			throw new Exception("Unknown command!");
		}				
	}
	
	/**
	 * @param {object} params
	 */
	private function cmd_registerListener($client,$params){
		$client->appId = $params->appId;
		$client->token = $params->token;
		$client->tokenExpires = $params->tokenExpires;    
		$client->lastCheck = date();
		
		$this->log->add('cmd_registerListener: '.$client->id,'debug',TRUE);
		
		$client->connection->send(
			json_encode(
				array(
					"mesType" => self::MES_TYPES['registered']
					,"id" => $client->id
				)
			)
		);	
	}
	
	/**
	 * Command subscribe
	 * Event{ id, onEvent, params}
	 */
	private function cmd_subscribe($client,$params){
	
		for($i=0;$i<count($params->events);i++){
			$this->clientEvents[]
		
			if(!db_clients[client.appId].events[params.events[i].id]){
				db_clients[client.appId].events[params.events[i].id] = 1;
				to_log('LISTEN "'+params.events[i].id+'"',LOG_MSG.error);
				db_clients[client.appId].con.query('LISTEN "'+params.events[i].id+'"');
			}
			else{
				db_clients[client.appId].events[params.events[i].id]++;
			}
		}
	
	
		client.eventGroups[params.groupId] = $params->events;
		
		//db
		if(db_clients[$client.appId]){
			for($i=0;$i<count($params->events);i++){
				if(!db_clients[client.appId].events[params.events[i].id]){
					db_clients[client.appId].events[params.events[i].id] = 1;
					to_log('LISTEN "'+params.events[i].id+'"',LOG_MSG.error);
					db_clients[client.appId].con.query('LISTEN "'+params.events[i].id+'"');
				}
				else{
					db_clients[client.appId].events[params.events[i].id]++;
				}
			}
		}
	}
		
}

?>
