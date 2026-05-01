<?php
require_once(FRAME_WORK_PATH.'basic_classes/View.php');
//require_once(FRAME_WORK_PATH.'basic_classes/MethodCasher.php');

class ViewXML extends View{	

	public static function addHTTPHeaders(){
		ob_clean();		
		header('Content-Type: text/xml; charset="utf-8"');
		header("Expires: Mon, 26 Jul 1997 05:00:00 GMT");  // disable caching
		header("Last-Modified: " . gmdate( "D, d M Y H:i:s") . " GMT");
		header("Pragma: no-cache");	
		header("Cache-Control: no-store, no-cache, must-revalidate, post-check=0, pre-check=0");//Dont cache
	}

	public static function getXMLHeader(){
		return '<?xml version="1.0" encoding="UTF-8"?>';
	}

	public function addHeader(){
		self::addHTTPHeaders();
	}

	public function write(ArrayObject &$models,$errorCode=NULL){
		self::addHTTPHeaders();
		//header
		$res = self::getXMLHeader();
		
		//root node
		$res.= '<document>';
		
		$modelsIt = $models->getIterator();
		while($modelsIt->valid()) {			
			$res.= $modelsIt->current()->dataToXML(TRUE);
			$modelsIt->next();			
		}		
		
		//end root node
		$res.= '</document>';
		
		echo $res;
		
		/*MethodCasher::putToCash(
			['Content-Type: text/xml; charset="utf-8"',
			"Expires: Mon, 26 Jul 1997 05:00:00 GMT",
			"Last-Modified: " . gmdate( "D, d M Y H:i:s") . " GMT",
			"Cache-Control: no-cache, must-revalidate",
			"Pragma: no-cache"
			]
			,$res
		);*/
	}
}

?>
