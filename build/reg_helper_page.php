<html>
	<head>
		<meta http-equiv="content-type" content="text/html; charset=UTF-8"/>
	</head>
	<body>
	<h1>Balance register make helper 1.0</h1>

<?php
	require_once("RegHelper.php");
	
	define('REPO_DIR',realpath(dirname(__FILE__)));
	
	//commands
	define('SBMT_MAKE','make');
	define('PARAM_RA_MODEL_ID','ra_model_id');
	
	echo '<p>';
	echo '<div>1) Create RA model</div>';
	echo '<div>2) Add enum to reg_types</div>';
	echo '</p>';
	
	echo '</br>';
	echo '</br>';
	echo '<form action="reg.php" method="POST" name=""
	enctype="multipart/form-data">
		<div class="form-group">							
			<label for="'.PARAM_RA_MODEL_ID.'">Register action model (RA*):</label>
			<input type="text" id="'.PARAM_RA_MODEL_ID.'" name="'.PARAM_RA_MODEL_ID.'" size="15" maxlength="100" value="'.(isset($_REQUEST[PARAM_RA_MODEL_ID])? $_REQUEST[PARAM_RA_MODEL_ID]:"").'" required="required"/>			
		</div>
		
		<input type="submit" value="Make" name="'.SBMT_MAKE.'"/>
	</form>';	
	echo '</br>';
	
	//command
	if (isset($_REQUEST[SBMT_MAKE])){	
		$man = new RegHelper(
			substr(ABSOLUTE_PATH,0,strlen(ABSOLUTE_PATH)-1),
			REPO_DIR,
			substr(USER_JS_PATH,0,strlen(USER_JS_PATH)-1),
			array(
				'buildGroup' => BUILD_GROUP,
				'buildFilePermission' => BUILD_FILE_PERMISSION,
				'buildDirPermission' => BUILD_DIR_PERMISSION
			)
		);
		//try{
			if (!isset($_REQUEST[PARAM_RA_MODEL_ID])){
				echo '<p>Register RA model is not defined!</p>';
				exit;
			}
			$man->makeRegisterObjects($_REQUEST);
		/*
		}
		catch(Exception $e){
			echo '<p>Error:'.$e->getMessage().'</p>';
		}
		*/
	}
	
?>

	</body>
</html>
