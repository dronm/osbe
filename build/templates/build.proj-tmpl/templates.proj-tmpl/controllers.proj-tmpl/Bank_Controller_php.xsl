<?xml version="1.0" encoding="UTF-8"?>

<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:import href="Controller_php.xsl"/>

<!-- -->
<xsl:variable name="CONTROLLER_ID" select="'Bank'"/>
<!-- -->

<xsl:output method="text" indent="yes"
			doctype-public="-//W3C//DTD XHTML 1.0 Strict//EN" 
			doctype-system="http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"/>
			
<xsl:template match="/">
	<xsl:apply-templates select="metadata/controllers/controller[@id=$CONTROLLER_ID]"/>
</xsl:template>

<xsl:template match="controller"><![CDATA[<?php]]>
<xsl:call-template name="add_requirements"/>
class <xsl:value-of select="@id"/>_Controller extends <xsl:value-of select="@parentId"/>{

	//const REFRESH_URL = 'http://cbrates.rbc.ru/bnk/bnk.zip';
	const REFRESH_URL = 'http://www.katren.org/crm/output/bnk.zip';

	public function __construct($dbLinkMaster=NULL,$dbLink=NULL){
		parent::__construct($dbLinkMaster,$dbLink);<xsl:apply-templates/>
	}	
	<xsl:call-template name="extra_methods"/>
}
<![CDATA[?>]]>
</xsl:template>

<xsl:template name="extra_methods">

	private static function bank_type($str){
		if ($str=="00"){
			$res = "ГРКЦ ";    
		}
		else if ($str=="10"){
			$res = "РКЦ ";    
		}
		else if ($str=="20"){
			$res = "Б ";    
		}
		else if ($str=="21"){
			$res = "КБ ";    
		}
		else if ($str=="22"){
			$res = "СБ ";    
		}
		else if ($str=="23"){
			$res = "АКБ ";    
		}
		else if ($str=="24"){
			$res = "ЧКБ ";    
		}
		else if ($str=="25"){
			$res = "КОПБ ";    
		}
		else if ($str=="26"){
			$res = "АПБ ";    
		}
		else if ($str=="30"){
			$res = "ФБ ";    
		}
		else if ($str=="31"){
			$res = "ФКБ ";    
		}
		else if ($str=="32"){
			$res = "Отд. ";    
		}
		else if ($str=="33"){
			$res = "ФАКБ ";    
		}
		else if ($str=="34"){
			$res = "ФЧКБ ";    
		}
		else if ($str=="35"){
			$res = "ФКОБ ";    
		}
		else if ($str=="36"){
			$res = "Отд. ";    
		}
		else if ($str=="40"){
			$res = "ПУ ";    
		}
		else if ($str=="50"){
			$res = "ЦХ ";    
		}
		else if ($str=="70"){
			$res = "КУ ";    
		}
		else if ($str=="71"){
			$res = "КЛ ";    
		}
		else if ($str=="72"){
			$res = "ОРЦБ ";    
		}
		else if ($str=="98"){
			$res = "ИСКЛ ";    
		}
		else if ($str=="99"){
			$res = "ОТЗВ ";    
		}
		else if ($str=="90"){
			$res = "ЛИКВ ";    
		}
		else{
			$res = '';
		}
		
		return $res;
	}  // ТипБанка(Стр)

	private static function get_type($str){
		if ($str=="1"){
			$res = "Г.";       // ГОРОД
		}
		else if ($str=="2"){
			$res = "П.";       // ПОСЕЛОК
		}
		else if ($str=="3"){
			$res = "С.";       // СЕЛО
		}
		else if ($str=="4"){
			$res = "ПГТ.";     // ПОСЕЛОК ГОРОДСКОГО ТИПА
		}
		else if ($str=="5"){
			$res = "СТ-ЦА.";   // СТАНИЦА
		}
		else if ($str=="6"){
			$res = "АУЛ.";     // АУЛ
		}
		else if ($str=="7"){
			$res = "РП.";      //  РАБОЧИЙ ПОСЕЛОК 
		}
		else{
			$res = '';
		}
		return $res;
	} // ТипГорода(Стр)

	public static function delTree($dir) {
		$files = array_diff(scandir($dir), array('.','..'));
		foreach ($files as $file) {
		(is_dir("$dir/$file")) ? self::delTree("$dir/$file") : unlink("$dir/$file");
		}
		return rmdir($dir);
	} 
	
	public static function refresh($link){
	
		function cyr_str_decode($str){
			return iconv('WINDOWS-1251','UTF-8',$str);
		}
		
		$resHandle = fopen(self::REFRESH_URL, 'r');
		if (!$resHandle) {
			throw new Exception('Ошибка чтения ресурса '.self::REFRESH_URL);
		}
		$contents = '';
		while (!feof($resHandle)) {
		  $contents .= fread($resHandle, 8192);
		}
		$fname = OUTPUT_PATH.uniqid();
		file_put_contents($fname,$contents);

//$fname = OUTPUT_PATH.'597f23b9749dd';
		try{
			$zip = new ZipArchive();
			if ($zip->open($fname) === TRUE) {
				$dir = OUTPUT_PATH.uniqid();
				mkdir($dir);
						
				$zip->extractTo($dir.DIRECTORY_SEPARATOR);
				$zip->close();

				//groups			    
				$handle = fopen($dir.DIRECTORY_SEPARATOR."reg.txt", "r");
				if ($handle) {
				    while (($line = fgets($handle)) !== false) {
					if (substr($line,0,2) == "//" || $line==''){
						continue;
					}
					$ar = preg_split("/[\t]/", $line);
					if (count($ar)>=3){
						$gr_code = $ar[0];
						$gr_descr = cyr_str_decode($ar[1]);
						$gor = cyr_str_decode($ar[2]);
						//echo(sprintf(
						$link->query(sprintf(						
						"SELECT banks.banks_upsert('%s'::text,NULL,'%s'::text,NULL,NULL,NULL,TRUE)",
						$gr_code,$gr_descr,$gor));//.PHP_EOL
					}
				    }

				    fclose($handle);
				} else {
				    throw new Exception("ERROR opening reg file!");
				} 				
				
				//BIKS
				$handle = fopen($dir.DIRECTORY_SEPARATOR."bnkseek.txt", "r");
				if ($handle) {
				    while (($line = fgets($handle)) !== false) {
					if (substr($line,0,2) == "//" || $line==''){
						continue;
					}
					$ar = preg_split("/[\t]/", $line);
					if (count($ar)>=6){
						$PZN = self::bank_type($ar[0]);
						$gor = self::get_type($ar[2]).cyr_str_decode($ar[1]);
						
						$name = str_replace("  "," ",cyr_str_decode($ar[3]));
						$name = str_replace(". ",".",$name);
						
						/*
						$name = ($ar[4]=='+')?
							$name:
							trim((strpos($name,",".$PZN.",")>=0)? $PZN:'').' '.$name;
						*/
						$bik = trim($ar[5]);
						$korshet = trim($ar[6]);
						
						//echo(sprintf(
						$link->query(sprintf(						
						"SELECT banks.banks_upsert('%s'::text,'%s'::text,'%s'::text,'%s'::text,NULL,'%s'::text,FALSE)",
						$bik,substr($bik,2,2),$name,$korshet,$gor));//.PHP_EOL
					}
				    }

				    fclose($handle);
				} else {
				    throw new Exception("ERROR opening bik file!");
				} 				
				
			    
			} else {
			    throw new Exception("ERROR opening archive!");
			}		
		}
		finally{
			if (isset($fname) &amp;&amp; file_exists($fname)){
				unlink($fname);
			}
			if (isset($dir) &amp;&amp; file_exists($dir)){
				self::delTree($dir);
			}
		}		
	}
	
</xsl:template>

</xsl:stylesheet>
