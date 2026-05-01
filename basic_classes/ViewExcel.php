<?php
require_once('ViewExport.php');

class ViewExcel extends ViewExport{	

	const DEF_TEMPL_NAME = 'ModelsToExcel';
	const TEMPL_EXT = ".xls.xsl";
	const OUTPUT_EXT = ".xls";
	
	public function write(ArrayObject &$models,$errorCode=NULL){
	
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
		else{
			$pathArray = explode(PATH_SEPARATOR, get_include_path());
			if (!count($pathArray)
			|| !file_exists(
				$xslt_file=$pathArray[1].'/'.
				FRAME_WORK_PATH.self::DEF_TEMPL_PATH.
				self::DEF_TEMPL_NAME.self::TEMPL_EXT)){
				throw new Exception(self::ER_TEMPL_NOT_FOUND);
			}
			$templ_name = self::DEF_TEMPL_NAME;
		}
		
		return $this->downloadFile($models,$xslt_file,self::OUTPUT_EXT);
	}
	
}

?>
