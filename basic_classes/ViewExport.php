<?php
require_once(FRAME_WORK_PATH.'basic_classes/View.php');
require_once('common/downloader.php');

class ViewExport extends View{	
	const DEF_TEMPL_PATH = 'basic_classes/xslt/';
	const ER_TEMPL_NOT_FOUND = "Template not found.";
	
	
	protected function modelDataToXML(&$model){	
		$model->setRowBOF();
		$result = sprintf('<%s id="%s" sysModel="%d" rowsPerPage="%d" listFrom="%d" totalCount="%d">',
		$model::DATA_NODE_NAME,$model->getId(), ($model->getSysModel())? "1":"0",
		$model->getRowsPerPage(),$model->getListFrom(),$model->getTotalCount()
		);
		if (method_exists($model,'getXMLSelection') && $model->getXMLSelection()){
			//already got XML data
			//if there is a JSON field - parse XML and set Object->descr value
			$json_exists = FALSE;
			$fields = $model->getFieldIterator();
			while($fields->valid()) {					
				$field = $fields->current();
				if($field->getDataType()==DT_JSON || $field->getDataType()==DT_JSONB){
					$json_exists = TRUE;
					break;
				}
				$fields->next();
			}
			$model_xml_s = $model->getDbLink()->fetch_result($model->getQueryId(),0,0);
			if($json_exists){
				$model_xml = simplexml_load_string('<model>'.$model_xml_s.'</model>');
				$xml_rows = $model_xml->children();
				$model_xml_s = '';
				foreach($xml_rows as $row ){
					$row_s = '';
					$fields = $model->getFieldIterator();
					while($fields->valid()) {					
						$field = $fields->current();
						$col_id = $field->getId();
						if($field->getDataType()==DT_JSON || $field->getDataType()==DT_JSONB){
							$j_val = json_decode($row->$col_id);
							$val = (!is_null($j_val)&&is_object($j_val)&&property_exists($j_val,'descr'))? $j_val->descr:trim($row->$col_id);
						}
						else{
							$val = trim($row->$col_id);
						}
						$fields->next();
						
						$row_s.= sprintf('<%s>%s</%s>',$col_id,$val,$col_id);
					}
					$model_xml_s.= sprintf('<row>%s</row>',$row_s);
				}
			}
			$result.= $model_xml_s;
		}
		else{	
			
			$model->setRowBOF();		
			while ($model->getNextRow()){							
				$data='';
				$fields = $model->getFieldIterator();
				while($fields->valid()) {					
					$field = $fields->current();
					//ADDED
					$data.= $field->dataToXML();
					$fields->next();				
				}				
				$result.= sprintf('<%s>%s</%s>',
					$model::ROW_NODE_NAME,
					$data,
					$model::ROW_NODE_NAME);
			}			
		}
		
		$result.='</'.$model::DATA_NODE_NAME.'>';
		return $result;
	}
	
	
	public function downloadFile(ArrayObject &$models,$xsltFile,$outExt){
	
		//header
		$xml = '<?xml version="1.0" encoding="UTF-8"?>';
		
		//root node
		$xml.= '<document>';
		
		$modelsIt = $models->getIterator();
		while($modelsIt->valid()) {
			$m = $modelsIt->current();
			$xml.= $m->metadataToXML();			
			$xml.= $this->modelDataToXML($m);
			$modelsIt->next();			
		}	
		//end root node
		$xml.= '</document>';
		
		if (strpos($xml, 'xsi:') !== false && strpos($xml, 'xmlns:xsi=') === false) {
		    $xml = preg_replace(
			'/<(\w+)/',
			'<$1 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"',
			$xml,
			1
		    );
		}
				
		$doc = new DOMDocument();     
		$xsl = new XSLTProcessor();
		$doc->load($xsltFile);
		$xsl->importStyleSheet($doc);
		$xmlDoc = new DOMDocument();
		if($xmlDoc->loadXML($xml) !== TRUE){
			error_log("ViewExport::downloadFile() xmlDoc->loadXML() for xml=".$xml);
			throw new Exception("ViewExport::downloadFile() failed: error in xmlDoc->loadXML()");
		}
		if (DEBUG){
			$xmlDoc->formatOutput=TRUE;
			$xmlDoc->save('page.xml');
		}
		
		if (!file_exists(OUTPUT_PATH)){
			mkdir(OUTPUT_PATH);
		}
		$file = OUTPUT_PATH.uniqid().$outExt;
		try{
			file_put_contents($file,$xsl->transformToXML($xmlDoc));
		
			$mime = getMimeTypeOnExt($outExt);
			ob_clean();
			downloadFile($file, $mime,'attachment;','export'.$outExt);
		}
		finally{
			if(file_exists($file)){
				unlink($file);
			}
		}
		return TRUE;	
	}
	
	public function hasError(ArrayObject &$models){
		$res = FALSE;
		if($models['ModelServResponse'] && $models['ModelServResponse']->result){
			$this->writeError($models);
			$res = TRUE;		
		}
		return $res;				
	}
	
	public function writeError(ArrayObject &$models){
		ob_clean();		
		
		$html_res = (isset($_REQUEST['inline']) && $_REQUEST['inline']=='1');
		
		header('Content-Type: text/'.($html_res? 'html':'xml').'; charset="utf-8"');
		header("Expires: Mon, 26 Jul 1997 05:00:00 GMT");  // disable IE caching
		header("Last-Modified: " . gmdate( "D, d M Y H:i:s") . " GMT");
		
		if ($html_res&&$models['ModelServResponse']){
			//html
			$docum = '<html>
				<head>
					<meta http-equiv="content-type" content="text/html; charset=UTF-8">
				</head>
				<body>	
					</div>'.$models['ModelServResponse']->descr.'</div>
				</body>
			</html>
			';
		}
		else{
		
			$docum = '<?xml version="1.0" encoding="UTF-8"?>';		
			//root node
			$docum.= '<document>';				
			//MetaData && Data
			$modelsIt = $models->getIterator();
			while($modelsIt->valid()) {
				$docum.= $modelsIt->current()->metadataToXML();
				$docum.= $modelsIt->current()->dataToXML(TRUE);
				$modelsIt->next();
			}		
			//end root node
			$docum.= '</document>';
		}		
		echo $docum;
	}
	
}

?>
