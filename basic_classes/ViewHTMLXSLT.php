<?php
require_once(FRAME_WORK_PATH.'basic_classes/ViewHTML.php');
require_once(FRAME_WORK_PATH.'basic_classes/XSLTStyler.php');

class ViewHTMLXSLT extends ViewHTML{	
	const ER_TEMPL_NOT_FOUND = 'Template not found.';
	const TEMPL_EXT = '.html.xsl';
	const DEF_TEMPL_PATH = 'basic_classes/xslt/';
	const DEF_TEMPL_NAME = 'ModelsToHTML';

	protected function convToUtf8($str){
		if (mb_detect_encoding($str,"UTF-8,iso-8859-1",TRUE)!="UTF-8" ){
			return  iconv("iso-8859-1","UTF-8",$str);
		}
		else{
			return $str;
		}
	}

	public function __construct($id=NULL){
		parent::__construct($id);
	}
	
	/**
	 * @class
	 * @classdesc Order of template resolving:
	 		- USER_VIEWS_PATH/templ.Ex[ErrorCode].role.html.xsl
	 		- USER_VIEWS_PATH/templ.Ex[ErrorCode[.html.xsl
	 		- USER_VIEWS_PATH/templ.role.html.xsl
	 		- USER_VIEWS_PATH/templ.html.xsl
	 		- USER_VIEWS_PATH/ID.Ex[ErrorCode].role.html.xsl
	 		- USER_VIEWS_PATH/ID.Ex[ErrorCode].html.xsl
	 		- USER_VIEWS_PATH/ID.role.html.xsl
	 		- USER_VIEWS_PATH/ID.html.xsl
	 		- basic_classes/xslt/ModelsToHTML.html.xsl
	 		- error ER_TEMPL_NOT_FOUND
	 */
	public function write(ArrayObject &$models,$errorCode=NULL){
		//throw new Exception("***errorCode=".$errorCode);
		parent::write($models,$errorCode);
		
		$roleName = NULL;
		if (isset($errorCode)
			&& isset($_REQUEST['templ'])
			&& isset($_REQUEST['role_id'])
			&& file_exists(
				$xslt_file=USER_VIEWS_PATH.
				$_REQUEST['templ'].
				'.Ex'.$errorCode.
				'.'.$_REQUEST['role_id'].
				ViewHTMLXSLT::TEMPL_EXT)){
		}				
		else if (isset($errorCode)
			&& isset($_REQUEST['templ'])
			&& file_exists(
				$xslt_file=USER_VIEWS_PATH.
				$_REQUEST['templ'].
				'.Ex'.$errorCode.
				ViewHTMLXSLT::TEMPL_EXT)){
		}						
		else if (isset($_REQUEST['templ'])
			&& isset($_REQUEST['role_id'])
			&& file_exists(
				$xslt_file=USER_VIEWS_PATH.
				$_REQUEST['templ'].
				'.'.$_REQUEST['role_id'].
				ViewHTMLXSLT::TEMPL_EXT)){
		}		
		else if (isset($_REQUEST['templ'])
			&& file_exists(
				$xslt_file=USER_VIEWS_PATH.
				$_REQUEST['templ'].
				ViewHTMLXSLT::TEMPL_EXT)){
		}		
		else if (isset($errorCode)
			&& isset($_REQUEST['role_id'])
			&& file_exists(
				$xslt_file=USER_VIEWS_PATH.
				$this->getId().
				'.Ex'.$errorCode.
				'.'.$_REQUEST['role_id'].
				ViewHTMLXSLT::TEMPL_EXT)
			){
		}				
		else if (isset($errorCode)
			&& file_exists(
				$xslt_file=USER_VIEWS_PATH.
				$this->getId().
				'.Ex'.$errorCode.
				ViewHTMLXSLT::TEMPL_EXT)
			){
		}						
		else if (isset($_REQUEST['role_id'])
			&& file_exists(
				$xslt_file=USER_VIEWS_PATH.
				$this->getId().
				'.'.$_REQUEST['role_id'].
				ViewHTMLXSLT::TEMPL_EXT)
			){
		}		
		else if (file_exists(
			$xslt_file=USER_VIEWS_PATH.
			$this->getId().ViewHTMLXSLT::TEMPL_EXT)){
		}
		else{
			$pathArray = explode(PATH_SEPARATOR, get_include_path());
			if (!count($pathArray)
			|| !file_exists(
				$xslt_file=$pathArray[1].DIRECTORY_SEPARATOR.
				FRAME_WORK_PATH.ViewHTMLXSLT::DEF_TEMPL_PATH.
				ViewHTMLXSLT::DEF_TEMPL_NAME.ViewHTMLXSLT::TEMPL_EXT)){
				throw new Exception(ViewHTMLXSLT::ER_TEMPL_NOT_FOUND);
			}
		}
		
		/*		
		//throw new Exception('XSLT='.$xslt_file);
		//header
		$xml = '<?xml version="1.0" encoding="UTF-8"?>';
		
		//root node
		$xml.= '<document>';
				
		//MetaData && Data
		$modelsIt = $models->getIterator();
		while($modelsIt->valid()) {
			$xml.= $modelsIt->current()->metadataToXML();
			$xml.= $modelsIt->current()->dataToXML(TRUE);
			$modelsIt->next();
		}
		
		//end root node
		$xml.= '</document>';
				
		//XSLTStyler::write($xml,$formName,$roleName);		
		//echo $xml;
		//exit;
		$doc = new DOMDocument();     
		$xsl = new XSLTProcessor();
		$doc->load($xslt_file);
		$xsl->importStyleSheet($doc);
		//file_put_contents("xml",$xml);
		$xmlDoc = new DOMDocument();
		$xmlDoc->loadXML($xml);
		if (DEBUG){
			$xmlDoc->formatOutput=TRUE;
			$xmlDoc->save('page.xml');
		}
		echo $xsl->transformToXML($xmlDoc);
		*/
		self::printModels($models,$xslt_file);
	}
	
	public static function printModels(ArrayObject &$models,$xsltFile){
	
		//header
		$xml = '<?xml version="1.0" encoding="UTF-8"?>';
		
		//root node
		$xml.= '<document>';
				
		//MetaData && Data
		$modelsIt = $models->getIterator();
		while($modelsIt->valid()) {
			$xml.= $modelsIt->current()->metadataToXML();
			// symbols */ will ruin everything!
			//$xml.= str_replace('*/','esc*esc/',$modelsIt->current()->dataToXML(TRUE));
			$xml.= $modelsIt->current()->dataToXML(TRUE);
			$modelsIt->next();
		}
		
		//end root node
		$xml.= '</document>';
		
		//file_put_contents(OUTPUT_PATH.'doc.xml',$xml);		
		//XSLTStyler::write($xml,$formName,$roleName);		
		//echo $xml;
		//exit;
		$doc = new DOMDocument();     
		$xsl = new XSLTProcessor();
		$doc->load($xsltFile);
		$xsl->importStyleSheet($doc);
		//file_put_contents("xml",$xml);
		$xmlDoc = new DOMDocument();
		$xmlDoc->loadXML($xml);
		if (DEBUG){
			$xmlDoc->formatOutput=TRUE;
			$xmlDoc->save(OUTPUT_PATH.'page.xml');
		}		
		echo $xsl->transformToXML($xmlDoc);
	}
	
}

?>
