<?php
require_once(dirname(__FILE__).'/basic_classes/EventSrv.php');

if (count($argv)<2){
	die("Arguments: param_file");
}
if(!file_exists($argv[1])){
	die("File not found:".$argv[1]);
}
$params = file_get_contents($argv[1]);
$param_ar = explode(PHP_EOL,$params);

/**
 * 6 Lines!
 * 0 - eventId
 * 1 - appId
 * 2 - serverHost
 * 3 - serverPort
 * 4 - use ssl
 * 5 - eventParams
 */
if(count($param_ar)<6){
	die("Param file must have 6 lines!");
}

$ev_params = unserialize($param_ar[5]);
try{
	EventSrv::publish($param_ar[0],$ev_params,$param_ar[1],$param_ar[2],$param_ar[3],$param_ar[4]);
}finally{
	unlink($argv[1]);
}

?>
