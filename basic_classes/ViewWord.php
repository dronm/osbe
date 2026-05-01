<?php
require_once('ViewExport.php');

class ViewWord extends ViewExport{	

	const TEMPL_EXT = ".doc.xsl";
	const OUTPUT_EXT = ".doc";
	
	public function write(ArrayObject &$models,$errorCode=NULL){
		if($this->hasError($models)){
			return FALSE;
		}
		
		$templ_name = NULL;
		if (isset($_REQUEST['templ'])
			&& file_exists(
				$xslt_file=USER_VIEWS_PATH.
				$_REQUEST['templ'].
				self::TEMPL_EXT)){
			$templ_name = $_REQUEST['templ'];
		}
		else if (file_exists(
			$xslt_file=USER_VIEWS_PATH.
			$this->getId().self::TEMPL_EXT)){
			$templ_name = $this->getId();
		}
		if(is_null($templ_name)){
			throw new Exception(self::ER_TEMPL_NOT_FOUND);
		}
		return $this->downloadFile($models,$xslt_file,self::OUTPUT_EXT);
	}
	
}

?>
