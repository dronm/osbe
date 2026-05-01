<?php
require_once(dirname(__FILE__)."/../Config.php");
require_once(FRAME_WORK_PATH.'db/db_pgsql.php');
require_once("EmailSender.php");

class CustomEmailSender extends EmailSender{

	public static function getMailAuth(&$dbLink){
		return $dbLink->query_first(
			"WITH mail_data AS (SELECT const_outmail_data_val() AS v)
			SELECT
				(SELECT v->>'smtp_host' FROM mail_data) AS smtp_host,
				(SELECT v->>'smtp_port' FROM mail_data) AS smtp_port,
				(SELECT v->>'smtp_user' FROM mail_data) AS smtp_user,
				(SELECT v->>'smtp_pwd' FROM mail_data) AS smtp_pwd,
				(SELECT v->>'from_name' FROM mail_data) AS from_name,
				(SELECT v->>'from_addr' FROM mail_data) AS from_addr"
		);	
	}

	public static function regMail(
			$dbLink,
			$funcText,
			$attArray=NULL,
			$smsType=NULL
		){
		$ar = $dbLink->query_first(sprintf(
		//throw new Exception(sprintf(
		"SELECT * FROM %s AS (
			body text,
			email text,
			mes_subject text,
			firm text,
			client text)",
		$funcText
		));
		
		$mail_id = NULL;
		if (is_array($ar) && count($ar)){
		
			$auth = self::getMailAuth($dbLink);
			
			$mail_id = EmailSender::addEMail(
				$dbLink,
				$auth['from_addr'],$auth['from_name'],
				$ar['email'],$ar['client'],
				$auth['from_addr'],$auth['from_name'],
				$auth['from_addr'],
				$ar['mes_subject'],
				$ar['body']	,
				$smsType			
			);
			if (is_array($attArray)){
				foreach ($attArray as $f){
					self::addAttachment($dbLink,$mail_id,$f);
				}
			}
		}
		return $mail_id;
	}
	
	public static function sendAllMail($delFiles=TRUE,&$db,$smtpHost=NULL,$smtpPort=NULL,$smtpUser=NULL,$smtpPwd=NULL){
		
		//$smtpHost = is_null($smtpHost)? SMTP_HOST:$smtpHost;
		//$smtpPort = is_null($smtpPort)? SMTP_PORT:$smtpPort;
		//$smtpUser = is_null($smtpUser)? SMTP_USER:$smtpUser;
		//$smtpPwd = is_null($smtpPwd)? SMTP_PWD:$smtpPwd;
		$ar = self::getMailAuth($db);
		
		parent::sendAllMail($delFiles,$db,
				$ar['smtp_host'],$ar['smtp_port'],$ar['smtp_user'],$ar['smtp_pwd']
		);
	}
	
}
?>
