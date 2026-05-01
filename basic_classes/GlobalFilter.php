<?php
class GlobalFilter {
	const MILD_SUF = "_mild";
	
	private static function hash($modelId){
		//return md5('globalFilter_'.$modelId);
		return 'gf_'.$modelId;
	}
	
	//@mild {bool} if set to TRUE then existant query condition is not
	//		overwritten, set only if not exist
	public static function set($modelId, $filter, $mild=NULL){		
		$hash = GlobalFilter::hash($modelId);
		$_SESSION[$hash] = serialize($filter);
		if(isset($mild) && !is_null($mild) || is_bool($mild)){
			$_SESSION[$hash.self::MILD_SUF] = $mild;
		}		
	}
	
	public static function delete($modelId){
		$hash = GlobalFilter::hash($modelId);
		if (isset($_SESSION[$hash])){
			unset($_SESSION[$hash]);
		}		
		if (isset($_SESSION[$hash.self::MILD_SUF])){
			unset($_SESSION[$hash.self::MILD_SUF]);
		}		
	}
	
	public static function get($modelName){
		$hash = GlobalFilter::hash($modelName);
		if (isset($_SESSION[$hash])){
			return unserialize($_SESSION[$hash]);
		}
		return NULL; 
	}
	
	public static function getMild($modelName){
		$hash = GlobalFilter::hash($modelName).self::MILD_SUF;
		if (isset($_SESSION[$hash])){
			return $_SESSION[$hash];
		}
		return FALSE; 
	}
	
}
?>
