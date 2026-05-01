<?PHP
///////////////////////////////////////////////////////
class DB_Sql {

	const DEF_PORT = 5432;
	const DEF_HOST = 'localhost';
	const DEF_CON_TRIES = 3;

	public $database = "";
	public $host = "";
	public $port = "";

	var $link_id  = 0;
	var $query_id = 0;
	var $record   = array();

	var $errdesc = "";
	var $errno   = 0;
	
	public $appname;
	public $appshortname;
	public $usepconnect;      
	public $technicalemail;
	
	/**
	 * defines on error behavour:
	 * 	TRUE throws full error message 
	 *	FALSE hides error details and throws just error fact with productionConnectError/productionSQLError
	 */ 
	public $detailedError;
	
	public $conName;

	//if TRUE logs every query
	public $logQueries;
	
	//if defined writes to this file when logging, otherwise - writes to php error log
	//otherwise php echo is used
	public $logFile;
	
	//if TRUE rewrites SELECT query with explain and writes to log or echos if logFile is not defined
	public $explain;
	
	//How many times try to execute query before throwing error
	public $queryTryCount = 5;
	
	public $productionConnectError = 'Connection to database failed!';
	public $productionSQLError = 'Database query failed!';
  
	function connect($server, $user, $password, $port=NULL,$conTries=NULL) {
		$this->host = !is_null($server)? $server : self::DEF_HOST;
		$this->port = !is_null($port)? $port : self::DEF_PORT;		
		$conTries = (!is_null($conTries)&&$conTries)? $conTries:self::DEF_CON_TRIES;
		
		$this->link_id = FALSE;		
		while($conTries && $this->link_id===FALSE){
			if(PHP_VERSION_ID >= 80112){
				$this->link_id = @pg_connect(
					sprintf('host=%s port=%d dbname=%s user=%s password=%s',
					$this->host, $this->port, $this->database, $user, $password)
				);
			}else{
				$this->link_id = @pg_connect(
					sprintf('host=%s port=%d dbname=%s user=%s password=%s',
					$this->host, $this->port, $this->database, $user, $password)
				);
			}
			$conTries--;
		}
		if ($this->link_id===FALSE){
			$this->raiseError(
				$this->productionConnectError,
				'Connection failed '.sprintf('host=%s, dbname=%s, port=%s, user=%s', $this->host, $this->database, $this->port, $user).'@105'				
			);
		}
		return ($this->link_id!==FALSE);
	}

	function close() {
		pg_close($this->link_id);
	}

	function set_error_verbosity($level) {
		pg_set_error_verbosity($this->link_id,$level);
	}

	function getErrorDescr() {
		$this->error=pg_last_error();
		return $this->error;
	}

	function getErrorNo() {
		$this->errno=0;
		return $this->errno;
	}

	function select_db($database="") {
	}

	static function microtime_float(){
	    list($usec, $sec) = explode(" ", microtime());
	    return ((float)$usec + (float)$sec);
	}
	
	function prepare($query_name, $query_string) {
		return pg_prepare($this->link_id, $query_name, $query_string);
	}
	
	function query($query_string, $query_params=NULL) {
		$time_start = NULL;
		if ($this->logQueries) {
			$this->log($query_string);
			$time_start = self::microtime_float();
		}

		$res = NULL;
		if (is_null($query_params)){
			$res = pg_send_query($this->link_id,$query_string);				
		}
		else{
			$res = pg_send_query_params($this->link_id,$query_string,$query_params);
		}
		if($res!==TRUE){
			$cmd = (is_null($query_params))? "pg_send_query": "pg_send_query_params";
			if($this->reportError){
				
				$msg = 'query '.$cmd.' failed for host '.$this->host.':'.$this->port.' Query:'.$query_string.': '.pg_last_error($this->link_id);
			}else{
				$msg = 'query '.$cmd.' failed for host '.$this->host.':'.$this->port.': '.pg_last_error($this->link_id);
			}
			$this->raiseError($this->productionSQLError, $msg);			
		}
		
		return $this->query_result($res, $time_start);
	}

	function execute_prepared($query_name, $query_params) {
		$time_start = NULL;
		if ($this->logQueries) {
			$this->log($query_name);
			$time_start = self::microtime_float();
		}
		$res = pg_execute($this->link_id, $query_name, $query_params);
		if($res!==TRUE){
			if($this->reportError){
				$msg = 'query pg_execute failed for host '.$this->host.':'.$this->port.' QueryName:'.$query_name.': '.pg_last_error($this->link_id);
			}else{
				$msg = 'query pg_execute failed'.': '.pg_last_error($this->link_id);
			}
			$this->raiseError($this->productionSQLError, $msg);			
		}
		
		return $this->query_result($res, $time_start);
	}
		
	//result for query/execute_prepared
	function query_result($res, $time_start) {	
		
		$this->query_id = pg_get_result($this->link_id);
		
		$state = pg_result_error_field($this->query_id, PGSQL_DIAG_SQLSTATE);
		
		if ($this->logQueries) {
			$time_end = self::microtime_float();
			$time = $time_end - $time_start;		

			$this->log("Time:".$time);

			if ($this->explain and substr(trim(strtoupper($query_string)),0,6)=="SELECT") {
				$explain_id = pg_query($this->link_id,"EXPLAIN $query_string",$this->link_id);
				$this->log('EXPLAIN');
				while($array=pg_fetch_array($explain_id)) {
					$this->log(sprintf(
						'table=%s\n
						type=%s\n
						possible_keys=%s\n
						key=%s\n
						key_len=%s\n
						ref=%s\n
						rows=%s\n
						Extra=%s\n
						',
						$array['table'],
						$array['type'],
						$array['possible_keys'],
						$array['key'],
						$array['key_len'],
						$array['ref'],
						$array['rows'],
						$array['Extra']
						
					));
				}
			}
		}
		if ($state && strlen($state) && $state!="00000"){
			if($state=="P0001"){
				//user raise_exception
				$mes = pg_result_error_field($this->query_id, PGSQL_DIAG_MESSAGE_PRIMARY);
			}
			else{
				$mes = $this->productionSQLError;	
			}
			$sql_state = pg_result_error_field($this->query_id,  PGSQL_DIAG_SQLSTATE);
			$det_mes = pg_result_error_field($this->query_id, PGSQL_DIAG_MESSAGE_DETAIL);
			$hint = pg_result_error_field($this->query_id, PGSQL_DIAG_MESSAGE_HINT);
			$cont = pg_result_error_field($this->query_id, PGSQL_DIAG_CONTEXT);
			$this->raiseError(
				$mes,
				'ОШИБКА: '.pg_result_error_field($this->query_id, PGSQL_DIAG_MESSAGE_PRIMARY).PHP_EOL.
				(($det_mes && strlen($det_mes))? ('Подробности: '.$det_mes.PHP_EOL):"").
				(($hint && strlen($hint))? ('Подсказка: '.$hint.PHP_EOL):"").
				(($cont && strlen($cont))? ('Контекст: '.$cont.PHP_EOL):"").
				'Код ошибки SQL: '.$sql_state,
				$sql_state
			);
		}
		
		return $this->query_id;
	}
	
	function affected_rows($query_id=NULL) {
		if (is_null($query_id)) {
			$query_id = $this->query_id;
		}		
		return pg_affected_rows($query_id);
	}
  
	function fetch_array($query_id=-1,$query_string="") {
		// retrieve row
		if ($query_id!=-1) {
			$this->query_id=$query_id;
		}
		if ( isset($this->query_id) && $this->query_id!==FALSE ) {
			$this->record = pg_fetch_assoc($this->query_id);
		}
		else{
			if ( !empty($query_string) ) {
				$this->raiseError($this->productionSQLError,"fetch_array Invalid query id (".$this->query_id.") on this query: $query_string");
			}
			else {
				$this->raiseError($this->productionSQLError,"fetch_array Invalid query id ".$this->query_id." specified");
			}
		}

		return $this->record;
	}
  
	function fetch_object($query_id=-1,$query_string="") {
		// retrieve row
		if ($query_id!=-1) {
			$this->query_id=$query_id;
		}
		if ( isset($this->query_id) && $this->query_id!==FALSE ) {
			$this->record = pg_fetch_object($this->query_id);
		}
		else{
			if ( !empty($query_string) ) {
				$this->raiseError($this->productionSQLError,"fetch_object Invalid query id (".$this->query_id.") on this query: $query_string");
			}
			else{
				$this->raiseError($this->productionSQLError,"fetch_object Invalid query id ".$this->query_id." specified");
			}
		}

		return $this->record;
	}

	function free_result($query_id=-1) {
		// retrieve row
		if ($query_id!=-1) {
			$this->query_id=$query_id;
		}
		if ( isset($this->query_id) && $this->query_id!==FALSE ) {
			pg_free_result($this->query_id);
		}
	}

	function query_first($query_string,$query_params=NULL) {
		// does a query and returns first row
		$query_id = $this->query($query_string,$query_params);
		$returnarray = $this->fetch_array($query_id, $query_string);
		$this->free_result($query_id);
		return $returnarray;
	}
	function query_first_col($query_string,$query_params=NULL) {
		// does a query and returns first column of the first row
		$query_id = $this->query($query_string,$query_params);
		if ($query_id!=-1) {
			$this->query_id = $query_id;
		}
		$this->record = NULL;
		if ( isset($this->query_id) ) {
			$this->record = pg_fetch_row($this->query_id,0);
		}
		else{
			if ( !empty($query_string) ) {
				$this->raiseError($this->productionSQLError,"query_first_col Invalid query id (".$this->query_id.") on this query: $query_string");
			}
			else {
				$this->raiseError($this->productionSQLError,"query_first_col Invalid query id ".$this->query_id." specified");
			}
		}
		return (!is_null($this->record) && count($this->record))? $this->record[0] : NULL;
	}

	function data_seek($pos,$query_id=-1) {
		// goes to row $pos
		if ($query_id!=-1) {
			$this->query_id=$query_id;
		}
		return pg_result_seek($this->query_id, $pos);
	}

	function fetch_result($query_id=-1,$row=0,$field=0) {
		// retrieve row
		if ($query_id!=-1) {
			$this->query_id=$query_id;
		}
		if ( isset($this->query_id) ) {
			$this->record = pg_fetch_result($this->query_id,$row,$field);
		}
		else {
			$this->raiseError($this->productionSQLError,"fetch_result Invalid query id ".$this->query_id." specified");
		}
		return $this->record;
	}
  
	function num_rows($query_id=-1) {
		// returns number of rows in query
		if ($query_id!=-1) {
			$this->query_id=$query_id;
		}
		return pg_num_rows($this->query_id);
	}

	function num_fields($query_id=-1) {
		// returns number of fields in query
		if ($query_id!=-1) {
			$this->query_id=$query_id;
		}
		return pg_num_fields($this->query_id);
	}

	function start_transaction() {
		$this->query('START TRANSACTION');//=BEGIN
	}
	function rollback_transaction() {
		$this->query('ROLLBACK');
	}
	function commit_transaction() {
		$this->query('COMMIT');
	}
	
	function escape_string($str) {
		return pg_escape_string($this->link_id, $str);
	}

	function escape_bytea($str) {
		return pg_escape_bytea($this->link_id, $str);
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
	function raiseError($message,$fullMessage=NULL,$errCode=0){
		$this->log($fullMessage);
		throw new Exception($this->detailedError? $fullMessage:$message);
	}
	
	function get_notify($resType=PGSQL_ASSOC){
		return pg_get_notify($this->link_id,$resType);
		
	}
}
?>
