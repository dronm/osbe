<?php

if(defined('SRV_EVENT_CLASS') && defined('FUNC_PATH')){
	require_once(FUNC_PATH.SRV_EVENT_CLASS.'.php');
}

/**
 * @descr session defined variable manager class. Handles add/set/get/unset per session variables
 */
class SessionVarManager{

	public static function getEmitterId(){
		//from cokie
		if(isset($_COOKIE['eventServerEmitterId'])){
			return $_COOKIE['eventServerEmitterId'];
		}
	}
	
	/**
	 * @descr set notifyClient to TRUE, if modified on Server and need to notify client app
	 * @param {string} id
	 * @param {mixed} val
	 * @param {bool} notifyClient
	 */	 
	public static function setValue($id,$val,$notifyClient){
		if (isset($_SESSION)){
			if(!isset($_SESSION['sessionVars'])){
				$_SESSION['sessionVars'] = array();
			}
		
			$_SESSION['sessionVars'][$id]['val'] = $val;
			
			if(isset($_SESSION['sessionVars'][$id]) && ($notifyClient===TRUE || $_SESSION['sessionVars'][$id]['allowToClient']===TRUE) ){
				//event
				if(
				$notifyClient===TRUE
				&& defined('SRV_EVENT_CLASS')
				&& isset($_SESSION['sessionVars']['eventServerToken'])
				&& isset($_SESSION['sessionVars']['eventServerToken']['val'])
				){
					if(is_object($val)){
						$val_str = json_encode($val);
					}
					else{
						$val_str = $val;
					}
					$params = array(
						'id' => $id
						,'val' => $val_str
					);
					//EventSrv::publishAsync('SessionVar.update.'.$_SESSION['sessionVars']['eventServerClientId'],$params,APP_NAME,EVENT_SERVER_HOST,EVENT_SERVER_PORT);	
					$cl = SRV_EVENT_CLASS;
					$cl::publishAsync(md5('SessionVar.update.'.$_SESSION['sessionVars']['eventServerToken']['val']), $params);
				}
			}
		}
	}	
	
	public static function unsetValue($id,$notifyClient){
		self::setValue($id,NULL,$notifyClient);
	}
	
	public static function getValue($id,$toClient=FALSE){
		return (
			isset($_SESSION)
			&& isset($_SESSION['sessionVars'])
			&& isset($_SESSION['sessionVars'][$id])
			&& ($toClient===FALSE || $_SESSION['sessionVars'][$id]['allowToClient']===TRUE)
			)? $_SESSION['sessionVars'][$id]['val']:null;
	}	
	
	public static function addVar($id,$val,$allowToClient=TRUE){
		if (isset($_SESSION)){
			if(!isset($_SESSION['sessionVars'])){
				$_SESSION['sessionVars'] = array();
			}
		
			$_SESSION['sessionVars'][$id] = array(
				'val' => $val
				,'allowToClient' => $allowToClient
			);
		}
	}
	
}

?>
