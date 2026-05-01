<?php
/**
 * Newer class than SessionManager.
 * To notify: all sql errors should be cought or there will be an Uncaught Exception
 */
class SessManager{
	private $dbLink;
	private $dbLinkMaster;
	private $encrPassword;
	
	//same as in db_pgsql.php
	public $logFile;
	public $detailedError;
	public $productionError = 'Session failed!';
	
	public $wsCompatible;
	
	//@ToDO
	//$wsCompatible=FALSE
	function __construct() {
		
		//$this->wsCompatible = $wsCompatible;
		
		// set our custom session functions.
		session_set_save_handler(
			array($this, 'open'),
			array($this, 'close'),
			array($this, 'read'),
			array($this, 'write'),
			array($this, 'destroy'),
			array($this, 'gc')
		);
	 
		// This line prevents unexpected effects when using objects as save handlers.
		register_shutdown_function('session_write_close');
	}
	function start($session_name, $dbLinkMaster, $dbLink,$secure=FALSE,$durationSec=0,$encrPassword='') {
		$this->dbLinkMaster = $dbLinkMaster;
		$this->dbLink = $dbLink;
		$this->encrPassword = $encrPassword;
		
		// Make sure the session cookie is not accessable via javascript.
		$httponly = true;
	 
		// Hash algorithm to use for the sessionid. (use hash_algos() to get a list of available hashes.)
		$session_hash = 'sha512';

	 	$samesite = 'Strict';//Lax
	 	
		// Check if hash is available
		if (in_array($session_hash, hash_algos())) {
		  // Set the has function.
			ini_set('session.hash_function', $session_hash);
		}
		// How many bits per character of the hash.
		// The possible values are '4' (0-9, a-f), '5' (0-9, a-v), and '6' (0-9, a-z, A-Z, "-", ",").
		ini_set('session.hash_bits_per_character', 5);
	 
		// Force the session to only use cookies, not URL variables.
		ini_set('session.use_only_cookies', 1);
	 
	 	if($durationSec){
		 	ini_set('session.gc_maxlifetime', $durationSec);
		 }
	 
		// Get session cookie parameters 
		$cookieParams = session_get_cookie_params(); 
		// Set the parameters
		if (PHP_VERSION_ID >= 70300) {
			//new signature
			session_set_cookie_params(array(
				'lifetime' => $cookieParams["lifetime"]
				,'path' => $cookieParams["path"]
				,'domain' => $cookieParams["domain"]
				,'secure' => $secure
				,'samesite' => $samesite
				,'httponly' => $httponly
			)); 
		}else{
			session_set_cookie_params($cookieParams["lifetime"], $cookieParams["path"], $cookieParams["domain"], $secure, $httponly); 
		}
		// Change the session name 
		session_name($session_name);
		// Now we can start the session
		session_start();
		
		if(!strlen(session_id())){
			throw new Exception('Could not generate session id.');
		}
		
		// This line regenerates the session and delete the old one. 
		// It also generates a new encryption key in the database. 
		//session_regenerate_id(true);    		
	}
	function open() {
		return TRUE;
	}	
	function close() {
		return TRUE;
	}
	function read($id) {
	
		/*if ($this->wsCompatible){
			$q = sprintf("
			SELECT
				accessed_time,
				create_time,
				PGP_SYM_DECRYPT(val,$1) AS data
			FROM session_vals
			WHERE id=$2
			",$this->encrPassword,$id);
		}
		else
		*/
		if(isset($this->encrPassword)&&strlen($this->encrPassword)){
			$q = sprintf("SELECT sess_enc_read('%s','%s') AS data",$id,$this->encrPassword);
		}
		else{
			$q = sprintf("SELECT data FROM sessions WHERE id='%s'",$id);
		}
		
		$res = NULL;
		try{
			$ar = $this->dbLink->query_first($q);
			if ($ar && count($ar)>0){
				$res = (isset($ar['data'])&&strlen($ar['data']))? base64_decode($ar['data']) : "";
			}
			//if no session empty string MUST be returned! otherwise php7.1 and higher throws error!
		}
		catch(Exception $e){
			$this->onError($e);
		}
		
		return isset($res)? $res:'';
	}
	function write($id, $data) {		
		$ip = isset($_SERVER["REMOTE_ADDR"])? $_SERVER["REMOTE_ADDR"] : '127.0.0.1';
		if(strlen($this->encrPassword)){
			//different session server
			$dif_sess_srv = (defined('SESS_SERVER_MASTER')&&defined('DB_SERVER_MASTER')&&SESS_SERVER_MASTER!=DB_SERVER_MASTER);
			$app_id = isset($_SESSION['ms_app_id'])? $_SESSION['ms_app_id'] : ( defined('MS_APP_ID')? MS_APP_ID : 0);
			if($app_id && $dif_sess_srv){
				//microservice auth
				$q = sprintf("SELECT sess_enc_write('%s','%s','%s','%s',%d)",$id,base64_encode($data),$this->encrPassword,$ip,$app_id);
			}
			else{
				$q = sprintf("SELECT sess_enc_write('%s','%s','%s','%s')",$id,base64_encode($data),$this->encrPassword,$ip);
			}
		}
		else{
			$q = sprintf("SELECT sess_write('%s','%s','%s')",$id,base64_encode($data),$ip);
		}
		
		try{
			$this->dbLinkMaster->query($q);
		}
		catch(Exception $e){
			$this->onError($e);
		}
		
		return TRUE;
	}
	
	function destroy($id) {
		try{
			$this->dbLinkMaster->query(sprintf("DELETE FROM sessions WHERE id='%s'",$id));
			$this->dbLinkMaster->query(
				sprintf(
					"UPDATE logins SET date_time_out = '%s' WHERE session_id='%s'",
					date('Y-m-d H:i:s'),
					$id
				)
			);
		}
		catch(Exception $e){
			$this->onError($e);
		}
			
		return true;
	}	
	function gc($lifetime) {
		try{
			$this->dbLinkMaster->query(
				sprintf(
					"SELECT sess_gc('%d seconds'::interval)",
					$lifetime
				)
			);
		}
		catch(Exception $e){
			$this->onError($e);
		}
				
		return TRUE;
	}
	
	function restart() {
		session_unset();
		session_destroy();
		session_start();	
	}

	public static function findSession($token,&$dbLink,&$sessInf) {	
		$res = FALSE;
		$access_p = strpos($token,':');
		if ($access_p!==FALSE){
			$access_salt = substr($token,0,$access_p);
			$access_hash = substr($token,$access_p+1);
		
			$access_salt_db = NULL;
			$f = new FieldExtString('salt');
			FieldSQLString::formatForDb($dbLink,$f->validate($access_salt),$access_salt_db);
		
			$sess_exp_col = (defined('SESSION_EXP_SEC')? intval(SESSION_EXP_SEC):0)? sprintf('(EXTRACT(EPOCH FROM now()::timestamp-l.set_date_time)>=%d)',SESSION_EXP_SEC):'FALSE';
			$sess_live_col = (defined('SESSION_LIVE_SEC')? intval(SESSION_LIVE_SEC):0)? sprintf('(EXTRACT(EPOCH FROM now()::timestamp-l.date_time_in)>=%d)',SESSION_LIVE_SEC):'FALSE';
			
			//extra condition on app_id???
			//defined('MS_APP_ID')? ' AND l.app_id'
			$session_ar = $dbLink->query_first(
				sprintf(
					"SELECT
						trim(l.session_id) AS session_id,
						%s AS expired,
						%s AS died
					FROM logins l
					WHERE l.date_time_out IS NULL AND l.pub_key=%s",
					$sess_exp_col,
					$sess_live_col,
					$access_salt_db					
				)
			);		
			//throw new Exception('access_hash='.$access_hash.' md5='.md5($access_salt.$session_ar['session_id']).' salt='.$access_salt);						
			if (is_array($session_ar) && isset($session_ar['session_id']) && $access_hash==md5($access_salt.$session_ar['session_id'])){
				$res = TRUE;
				$sessInf = array(
					'session_id' => $session_ar['session_id'],
					'expired' => $session_ar['expired'],
					'died' => $session_ar['died'],
					'pub_key' => $access_salt
				);
				if(!strlen(session_id())){
					session_id($session_ar['session_id']);
				}
			}	
		}
		return $res;
	}
	
	/**
	 * Logs message
	 * if logFile specified then logs there otherwise to php standart error log
	 */
	function log($s){
		$s = PHP_EOL.date('Y-m-d H:i:s ').$s;
		if ($this->logFile){
			try{
				file_put_contents($this->logFile,$s,FILE_APPEND);
			}
			catch(Exception $e){
				error_log('Error writing to log file '.$e->getMessage().' Message='.$s);
			}
		}
		else{
			error_log($s);
		}	
	}

	/**
	 * Any error calls raiseError with fullMessage set if possible
	 * @param {$msg text}
	 */
	function onError($e){
		$this->log($e->getMessage());
		throw new Exception($this->detailedError? $e->getMessage():$this->productionError);
	}
	
	/*
	depricated
	private function encrypt($data, $key) {
		//return $data;
		$salt = 'cH!swe!retReGu7W6bEDRup7usuDUh9THeD2CHeGE*ewr4n39=E@rAsp7c-Ph@pH';
		$key = substr(hash('sha256', $salt.$key.$salt), 0, 32);
		$iv_size = mcrypt_get_iv_size(MCRYPT_RIJNDAEL_256, MCRYPT_MODE_ECB);
		$iv = mcrypt_create_iv($iv_size, MCRYPT_RAND);
		$encrypted = base64_encode(mcrypt_encrypt(MCRYPT_RIJNDAEL_256, $key, $data, MCRYPT_MODE_ECB, $iv));
		return $encrypted;
	}
	private function decrypt($data, $key) {
		//return $data;
		$salt = 'cH!swe!retReGu7W6bEDRup7usuDUh9THeD2CHeGE*ewr4n39=E@rAsp7c-Ph@pH';
		$key = substr(hash('sha256', $salt.$key.$salt), 0, 32);
		$iv_size = mcrypt_get_iv_size(MCRYPT_RIJNDAEL_256, MCRYPT_MODE_ECB);
		$iv = mcrypt_create_iv($iv_size, MCRYPT_RAND);
		$decrypted = mcrypt_decrypt(MCRYPT_RIJNDAEL_256, $key, base64_decode($data), MCRYPT_MODE_ECB, $iv);
		return $decrypted;
	}	
	*/		
}
?>
