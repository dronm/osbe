<?php
require_once(FRAME_WORK_PATH.'basic_classes/ViewXML.php');

/**
 * 
 */
class ViewXMLXSLT extends ViewXML{	
	const ER_TEMPL_NOT_FOUND='Template not found.';
	const TEMPL_EXT = ".xml.xsl";
	
	/**
	 * @class
	 * @classdesc Order of template resolving:
	 		- USER_VIEWS_PATH/templ.role.xml.xsl
	 		- USER_VIEWS_PATH/templ.xml.xsl
	 		- error ER_TEMPL_NOT_FOUND
	 */
	public function write(ArrayObject &$models,$errorCode=NULL){
		$this->addHeader();
		$roleName = NULL;
		if (isset($_REQUEST['templ'])
			&& isset($_REQUEST['role_id'])
			&& file_exists(
				$xslt_file=USER_VIEWS_PATH.
				$_REQUEST['templ'].
				'.'.$_REQUEST['role_id'].
				self::TEMPL_EXT)){
		}		
		else if (isset($_REQUEST['templ'])
			&& file_exists(
				$xslt_file=USER_VIEWS_PATH.
				$_REQUEST['templ'].
				self::TEMPL_EXT)){
		}		
		else{
			throw new Exception(self::ER_TEMPL_NOT_FOUND.' '.$xslt_file);
		}		
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
		
	}
}

?>
