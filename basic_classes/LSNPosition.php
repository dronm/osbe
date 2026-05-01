<?php
/**
 * This module contains lsn related functions.
 *
 */

define('LSN_HEADER', 'X-LSN-Position');
define('LSN_HEADER_VAR', 'HTTP_X_LSN_POSITION');
define('LSN_SESSION_KEY', 'last_lsn_position');
define('LSN_QUERY', 'SELECT pg_current_wal_lsn() AS lsn');

class LSNPosition {

	public static function addHeader($pos) {
		$current = self::getStored();

		if ($current !== null && self::compare($current, $pos) >= 0) {
			$pos = $current;
		}

		if (session_status() === PHP_SESSION_ACTIVE) {
			$_SESSION[LSN_SESSION_KEY] = $pos;
		}

		header(LSN_HEADER . ': ' . $pos);
	}

	public static function getRequestHeader() {
		$headerPos = isset($_SERVER[LSN_HEADER_VAR]) ? $_SERVER[LSN_HEADER_VAR] : null;
		$sessionPos = self::getStored();

		if ($headerPos === null) {
			return $sessionPos;
		}

		if ($sessionPos === null) {
			return $headerPos;
		}

		if (self::compare($headerPos, $sessionPos) >= 0) {
			return $headerPos;
		}

		return $sessionPos;
	}

	public static function add($dbMasterLink) {
		$lsnAr = $dbMasterLink->query_first(LSN_QUERY);

		if ($lsnAr && isset($lsnAr['lsn']) && is_string($lsnAr['lsn'])) {
			self::addHeader($lsnAr['lsn']);
//file_put_contents('/home/andrey/www/htdocs/beton_new/output/lsn.txt', date('Y-m-dTH:i:s').' LSNPosition::add LSN:'.$lsnAr['lsn'].PHP_EOL, FILE_APPEND);			
			return $lsnAr['lsn'];
		}

		return null;
	}

	private static function getStored() {
		if (session_status() === PHP_SESSION_ACTIVE) {
			return isset($_SESSION[LSN_SESSION_KEY]) ? $_SESSION[LSN_SESSION_KEY] : null;
		}

		return null;
	}

	private static function compare($a, $b) {
		$aParts = explode('/', $a, 2);
		$bParts = explode('/', $b, 2);

		if (count($aParts) !== 2 || count($bParts) !== 2) {
			return strcmp($a, $b);
		}

		$aLog = hexdec($aParts[0]);
		$aOff = hexdec($aParts[1]);
		$bLog = hexdec($bParts[0]);
		$bOff = hexdec($bParts[1]);

		if ($aLog < $bLog) {
			return -1;
		}
		if ($aLog > $bLog) {
			return 1;
		}
		if ($aOff < $bOff) {
			return -1;
		}
		if ($aOff > $bOff) {
			return 1;
		}

		return 0;
	}
}
?>
