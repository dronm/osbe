<?php
	class MethodCasher {
		
		const HEADER_POSTF = '_h';
		
		public static function getCashID(){
			return md5(implode('&',$_REQUEST));
		}
	
		public static function echoFromCash(){
			if(defined('OUTPUT_PATH')){
				$id = self::getCashID();
				if(
				file_exists($cash_fl = OUTPUT_PATH.$id)
				&& file_exists($cash_hd_fl = OUTPUT_PATH.$id.self::HEADER_POSTF)
				){
					ob_clean();
					$hd = unserialize(file_get_contents($cash_hd_fl));
					foreach($hd as $h){
						header($h);
					}
					echo file_get_contents($cash_fl);
					return TRUE;
				}
			}
		}
		
		public static function putToCash($hd, $resStr){
			if(defined('OUTPUT_PATH')){
				$id = self::getCashID();
				file_put_contents($id.self::HEADER_POSTF, serialize($hd));
				
				file_put_contents($id, $resStr);
			}
		}
	}
?>
