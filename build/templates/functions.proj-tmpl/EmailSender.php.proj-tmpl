<?php
require("common/PHPMailer_5.2.4/class.phpmailer.php");

class EmailSender {

	public static function addEMail(
				$dbLink,
				$from,$fromName,
				$to,$toName,
				$reply,$replyName,
				$sender,
				$subject,
				$body,
				$smsType=NULL){
		if (strlen($to)){
			$ar = $dbLink->query_first(sprintf(
			"INSERT INTO mail_for_sending
					(from_addr,from_name,
					to_addr,to_name,
					reply_addr,reply_name,
					sender_addr,subject,body,email_type)
					VALUES (%s,%s,
						%s,%s,
						%s,%s,
						%s,
						%s,
						%s,%s)
					RETURNING id",
					(!$from||$from=='')? 'NULL':"'".$from."'",
					(!$fromName||$fromName=='')? 'NULL':"'".$fromName."'",
					(!$to||$to=='')? 'NULL':"'".$to."'",
					(!$toName||$toName=='')? 'NULL':"'".$toName."'",
					(!$reply||$reply=='')? 'NULL':"'".$reply."'",
					(!$replyName||$replyName=='')? 'NULL':"'".$replyName."'",
					(!$sender||$sender=='')? 'NULL':"'".$sender."'",
					(!$subject||$subject=='')? 'NULL':"'".$subject."'",
					(!$body||$body=='')? 'NULL':"E'".$body."'",
					is_null($smsType)? 'NULL':"'".$smsType."'"
			));
			
			return $ar['id'];
		}
	}
	
	public static function addAttachment($dbLink,
				$mailId,$fileName){
		if ($mailId){
			$dbLink->query(sprintf(
			"INSERT INTO
				mail_for_sending_attachments
				(mail_for_sending_id,file_name)
			VALUES (%d,'%s')",
			$mailId,$fileName)
			);	
		}
	}
	public static function sendAllMail($delFiles,&$dbLink,
				$smtpHost,$smtpPort,$smtpUser,$smtpPwd){
		// Perform Query
		$result = $dbLink->query(
			"SELECT
				m.id AS email_id,
				m.from_addr,
				m.from_name,
				m.to_addr,
				m.to_name,
				m.reply_addr,
				m.reply_name,
				m.body,
				m.sender_addr,
				m.subject,
				mat.file_name
				
			FROM mail_for_sending AS m
			LEFT JOIN mail_for_sending_attachments AS mat
				ON mat.mail_for_sending_id=m.id
			WHERE m.sent=FALSE");
		$email_id = 0;
		while ($row=$dbLink->fetch_array($result)){			
			if ($row['email_id']!=$email_id){
				if ($email_id!=0&&$mail){
					self::send_mail($dbLink,$email_id,$mail,$mail_files,$delFiles);
				}
				if (strlen($row['body'])){					
					$mail= new PHPMailer();
					$mail->IsSMTP();
					$mail->Mailer = 'smtp';
					$mail->SMTPDebug 		= FALSE;
					$mail->CharSet			='UTF-8';				
					$mail->Host  			= $smtpHost;
					$mail->Port			= $smtpPort;
					$mail->SMTPAuth			= TRUE;
					$mail->AuthType			= 'LOGIN';
					$mail->Username			= $smtpUser;
					$mail->Password			= $smtpPwd;
					$mail->SMTPSecure		= 'ssl';
					//header
					//$mail->SetEncodedEmailHeader("To",$row['to_addr'],'andrey');//$row['to_name']
					//$mail->From				= $row['from_addr'];
					$mail->setFrom($row['from_addr'],$row['from_name']);
					$to_addr_ar = explode(';',$row['to_addr']);
					$to_name_ar = explode(';',$row['to_name']);
					$i = 0;
					foreach($to_addr_ar as $to_addr){
						$mail->addAddress($to_addr,$to_name_ar[$i]);
						$i++;
					}
					
					$mail->AddReplyTo($row['reply_addr'],$row['reply_name']);
					$mail->Subject			= $row['subject'];
					$mail->Body			= $row['body'];
				}
				
				$mail_files = array();				
			}
			if (strlen($row['file_name'])&&strlen($row['body'])){				
				if (file_exists(OUTPUT_PATH.$row['file_name'])){
					$mail->AddAttachment(OUTPUT_PATH.$row['file_name']);
					array_push($mail_files,OUTPUT_PATH.$row['file_name']);
				}
			}
			$email_id = $row['email_id'];
		}		
		if ($email_id!=0){			
			self::send_mail($dbLink,$email_id,$mail,$mail_files,$delFiles);
		}
		
	}
	public static function send_mail($dbLink,
		$emailId,$emailMessage,$mailFiles,$delFiles){			
		//sending
		if ($emailMessage){
			try{
				$error_str = ($emailMessage->Send())? 'NULL':"'".$emailMessage->ErrorInfo."'";
				
				$dbLink->query(sprintf(
				"UPDATE mail_for_sending
				SET
					sent = TRUE,
					sent_date_time = now(),
					error_str = %s
				WHERE id=%d",
				$error_str,$emailId
				));
				
				if (count($mailFiles)&&$delFiles){
					foreach ($mailFiles as $file_name){
						if (file_exists($file_name)){
							unlink($file_name);
						}
					}
				}
			}
			catch(Exception $e){
				//throw $e;
				error_log("EmailSender error: ".$e->getMessage()."\n");
			}
		}
	}
}
?>
