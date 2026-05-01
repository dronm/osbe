<?php
class SessionManager{
	private $dbLink;
	
	function __construct() {
		// set our custom session functions.
		session_set_save_handler(array($this, 'open'), array($this, 'close'), array($this, 'read'), array($this, 'write'), array($this, 'destroy'), array($this, 'gc'));
	 
		// This line prevents unexpected effects when using objects as save handlers.
		register_shutdown_function('session_write_close');
	}
	function start_session($session_name, $dbLinkMaster, $dbLink,$secure=FALSE) {
		$this->dbLinkMaster = $dbLinkMaster;
		$this->dbLink = $dbLink;
		// Make sure the session cookie is not accessable via javascript.
		$httponly = true;
	 
		// Hash algorithm to use for the sessionid. (use hash_algos() to get a list of available hashes.)
		$session_hash = 'sha512';
	 
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
	 
		// Get session cookie parameters 
		$cookieParams = session_get_cookie_params(); 
		// Set the parameters
		session_set_cookie_params($cookieParams["lifetime"], $cookieParams["path"], $cookieParams["domain"], $secure, $httponly); 
		// Change the session name 
		session_name($session_name);
		// Now we cat start the session
		session_start();
		// This line regenerates the session and delete the old one. 
		// It also generates a new encryption key in the database. 
		//session_regenerate_id(true);    
	}
	function open() {
		/*
		$this->conn = pg_pconnect(
			sprintf('host=%s dbname=%s user=%s password=%s',
			SESS_DB_SERVER, SESS_DB_NAME, SESS_DB_USER, SESS_DB_PASSWORD)
		);
		*/
	   return true;
	}	
	function close() {
		//pg_close($this->conn);
		return true;
	}
	function read($id) {
		$ar = $this->dbLink->query_first(
			sprintf("SELECT data,session_key FROM sessions WHERE id = '%s' LIMIT 1",$id)
		);
		//file_put_contents(OUTPUT_PATH.'sess.txt','read= '.$id.PHP_EOL,FILE_APPEND);
		if ($ar && count($ar)>0){
			return $this->decrypt($ar['data'],$ar['session_key']);
		}
		
		return '';
	}
	function write($id, $data) {
	//file_put_contents(OUTPUT_PATH.'sess.txt','write= '.$id.PHP_EOL.$data.PHP_EOL,FILE_APPEND);
		//try{
			$ar = $this->dbLinkMaster->query_first(
				sprintf("SELECT session_key FROM sessions WHERE id = '%s' LIMIT 1",$id)
				);		
			$key_exists = ($ar && count($ar)>0);
			if ($key_exists){
				$key = $ar['session_key'];
			}
			else{
				//new key
				$key = hash('sha512', uniqid(mt_rand(1, mt_getrandmax()), true));
			}
			$data = $this->encrypt($data, $key);
			if (!$key_exists){
				$this->dbLinkMaster->query(
					sprintf("INSERT INTO sessions VALUES('%s','%s','%s','%s','%s')",
					$id, time(), $data,$key,uniqid())
				);		
				$this->dbLinkMaster->query(
					sprintf("INSERT INTO logins
					(date_time_in,ip,session_id)
					VALUES('%s','%s','%s')",
					date('Y-m-d H:i:s'), isset($_SERVER["REMOTE_ADDR"]) ? $_SERVER["REMOTE_ADDR"] : '127.0.0.1', $id)
				);
			}
			else{
				$this->dbLinkMaster->query(
					sprintf("UPDATE sessions SET 
						set_time = '%s',
						data = '%s',
						session_key = '%s'
					WHERE id='%s'",
					time(), $data, $key,$id)
				);
			}
		//}
		//catch (Exception $e){
		//}
		
		return true;
	}
	function destroy($id) {
		$this->dbLinkMaster->query(
			sprintf("DELETE FROM sessions WHERE id='%s'",
			$id));
		$this->dbLinkMaster->query(
			sprintf("UPDATE logins
			SET date_time_out = '%s'
			WHERE session_id='%s'",
			date('Y-m-d H:i:s'),$id)
		);
			
		return true;
	}	
	function gc($max) {
		$this->dbLinkMaster->query(
			sprintf("DELETE FROM sessions WHERE set_time < '%s'",
			time() - $max));
		$this->dbLinkMaster->query(
			sprintf("UPDATE logins
			SET date_time_out = '%s'
			WHERE session_id IN (SELECT id FROM sessions WHERE set_time<'%s')",
			date('Y-m-d H:i:s'),time() - $max));
			
		return true;
	}
	private function encrypt($data, $key) {	
		return base64_encode($data);
		//DOES NOT WORK IN PHP7!!!  no mcrypt!!!
		/*$salt = 'cH!swe!retReGu7W6bEDRup7usuDUh9THeD2CHeGE*ewr4n39=E@rAsp7c-Ph@pH';
		$key = substr(hash('sha256', $salt.$key.$salt), 0, 32);
		$iv_size = mcrypt_get_iv_size(MCRYPT_RIJNDAEL_256, MCRYPT_MODE_ECB);
		$iv = mcrypt_create_iv($iv_size, MCRYPT_RAND);
		$encrypted = base64_encode(mcrypt_encrypt(MCRYPT_RIJNDAEL_256, $key, $data, MCRYPT_MODE_ECB, $iv));
		return $encrypted;
		*/
	}
	private function decrypt($data, $key) {
		return base64_decode($data);
		/*
		$salt = 'cH!swe!retReGu7W6bEDRup7usuDUh9THeD2CHeGE*ewr4n39=E@rAsp7c-Ph@pH';
		$key = substr(hash('sha256', $salt.$key.$salt), 0, 32);
		$iv_size = mcrypt_get_iv_size(MCRYPT_RIJNDAEL_256, MCRYPT_MODE_ECB);
		$iv = mcrypt_create_iv($iv_size, MCRYPT_RAND);
		$decrypted = mcrypt_decrypt(MCRYPT_RIJNDAEL_256, $key, base64_decode($data), MCRYPT_MODE_ECB, $iv);
		return $decrypted;
		*/
	}	
}
?>
