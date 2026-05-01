<?php
require_once(FRAME_WORK_PATH.'basic_classes/ViewExport.php');
require_once('common/downloader.php');
//require_once('common/PDFReport.php');

/**
 * DEBUG_PDF constant will make to leave intact generated temp xml files and log to PHP error log
 */
class ViewPDF extends ViewExport{	
	const ER_TEMPL_NOT_FOUND='Template not found.';
	const DEF_TEMPL_NAME = 'toPDF';
	const DEF_TEMPL_PATH = "basic_classes/xslt/";
	const TEMPL_EXT = ".pdf.xsl";
	const ER_FILE_NOT_FOUND = 'Ошибка формирования PDF.';
	
	public function write(ArrayObject &$models,$errorCode=NULL){
		if($this->hasError($models)){
			return FALSE;
		}		
		
		ob_clean();		

		if (isset($_REQUEST['templ'])
			&& file_exists(
				USER_VIEWS_PATH.
				$_REQUEST['templ'].
				self::TEMPL_EXT)){
			$templ_name = $_REQUEST['templ'];
			$templ_path = USER_VIEWS_PATH;
		}
		else if (file_exists(
			USER_VIEWS_PATH.
			$this->getId().self::TEMPL_EXT)){
			$templ_name = $this->getId();
			$templ_path = USER_VIEWS_PATH;
		}
		else{
			$pathArray = explode(PATH_SEPARATOR, get_include_path());
			if (!count($pathArray)
			|| !file_exists(
				$pathArray[1].'/'.
				FRAME_WORK_PATH.
				self::DEF_TEMPL_PATH.
				self::DEF_TEMPL_NAME.self::TEMPL_EXT)
			){
				header($_SERVER['SERVER_PROTOCOL'] . ' Internal Server Error', true, '500');
				throw new Exception(self::ER_TEMPL_NOT_FOUND);
			}
			$templ_name = ViewPDF::DEF_TEMPL_NAME;
			$templ_path = $pathArray[1].'/'.FRAME_WORK_PATH.self::DEF_TEMPL_PATH;
		}		
		$xslt_file = $templ_path.$templ_name.ViewPDF::TEMPL_EXT;
//throw new Exception($xslt_file);

		//header
		$xml = '<?xml version="1.0" encoding="UTF-8"?>';
		
		//root node
		$xml.= '<document>';
		
		$modelsIt = $models->getIterator();
		while($modelsIt->valid()) {	
			$xml.= $modelsIt->current()->dataToXML(TRUE);
			$modelsIt->next();			
		}				
		//end root node
		$xml.= '</document>';
		//echo $xml;
		//save to file
		$xml_file = OUTPUT_PATH.uniqid().".xml";
		file_put_contents($xml_file,$xml);
		
		//FOP
		try{
			$out_file = OUTPUT_PATH.uniqid().".pdf";//$templ_name
			$cmd = sprintf(PDF_CMD_TEMPLATE,$xml_file, $xslt_file, $out_file);
			if(defined('DEBUG_PDF')&&DEBUG_PDF){
				error_log('FOP command:'.$cmd);
			}
			exec($cmd);
					
			if (!file_exists($out_file)){
				header($_SERVER['SERVER_PROTOCOL'] . ' Internal Server Error', true, '500');
				throw new Exception(ViewPDF::ER_FILE_NOT_FOUND);
			}
			try{
				ob_clean();
				downloadFile(
					$out_file,
					'application/pdf',
					(isset($_REQUEST['inline']) && $_REQUEST['inline']=='1')? 'inline;':'attachment;',
					$templ_name.".pdf"
				);
			}
			finally{
				if(!defined('DEBUG_PDF')||!DEBUG_PDF){
					unlink($out_file);
				}
			}
			
			return TRUE;
		}
		finally{
			unlink($xml_file);
		}		
	}
}

?>
