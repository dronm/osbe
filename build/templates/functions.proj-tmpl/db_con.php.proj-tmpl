<?php
require_once(dirname(__FILE__).'/../Config.php');
require_once(FRAME_WORK_PATH.'db/db_pgsql.php');

$dbLink = new DB_Sql();
$dbLink->appname = APP_NAME;
$dbLink->technicalemail = TECH_EMAIL;
$dbLink->detailedError = defined('DETAILED_ERROR')? DETAILED_ERROR:DEBUG;

/*conneсtion*/
$dbLink->server		= DB_SERVER_MASTER;
$dbLink->user		= DB_USER;
$dbLink->password	= DB_PASSWORD;
$dbLink->database	= DB_NAME;
$dbLink->connect(DB_SERVER_MASTER, DB_USER, DB_PASSWORD);

?>
