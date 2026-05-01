<html>
	<head>
		<meta http-equiv="content-type" content="text/html; charset=UTF-8"/>
	</head>
	<body>
	<h1>Catalog make helper 1.0</h1>

<?php
	require_once("CatHelper.php");
	
	define('REPO_DIR',realpath(dirname(__FILE__)));
	
	//commands
	define('SBMT_MAKE','make');
	define('PARAM_CAT_BASE_MODEL_ID','base_model_id');
	define('PARAM_CAT_LIST_MODEL','list_model');
	define('PARAM_CAT_LIST_VIEW','list_view');
	define('PARAM_CAT_LIST_FORM','list_form');
	define('PARAM_CAT_SRV_LIST_TEMPLATE','server_template_list');
	define('PARAM_CAT_SRV_DIALOG_TEMPLATE','server_template_dialog');
	define('PARAM_CAT_VIEWS','views');
	define('PARAM_CAT_VIEWS_SEC','views_section');
	define('PARAM_CAT_VIEWS_DESCR','views_descr');

	define('PARAM_CAT_DIALOG_MODEL','dialog_model');
	define('PARAM_CAT_DIALOG_VIEW','dialog_view');
	define('PARAM_CAT_DIALOG_FORM','dialog_form');
	
	define('PARAM_CAT_CONTROLLER','controller');
	
	echo '</br>';
	echo '</br>';
	echo '<form action="cat.php" method="POST" name=""
	enctype="multipart/form-data">
		<div class="form-group">							
			<label for="'.PARAM_CAT_BASE_MODEL_ID.'">Base model id:</label>
			<input type="text" id="'.PARAM_CAT_BASE_MODEL_ID.'" name="'.PARAM_CAT_BASE_MODEL_ID.'" size="15" maxlength="100" value="'.(isset($_REQUEST[PARAM_CAT_BASE_MODEL_ID])? $_REQUEST[PARAM_CAT_BASE_MODEL_ID]:"").'" required="required"/>			
		</div>
		<div class="form-group">			
			<input type="checkbox" id="'.PARAM_CAT_LIST_MODEL.'" name="'.PARAM_CAT_LIST_MODEL.'" value="1" checked="checked"/>
			<label for="'.PARAM_CAT_LIST_MODEL.'">List model</label>
		</div>
		
		<div class="form-group">			
			<input type="checkbox" id="'.PARAM_CAT_LIST_VIEW.'" name="'.PARAM_CAT_LIST_VIEW.'" value="1" checked="checked"/>
			<label for="'.PARAM_CAT_LIST_VIEW.'">List javascript view</label>
		</div>

		<div class="form-group">			
			<input type="checkbox" id="'.PARAM_CAT_SRV_LIST_TEMPLATE.'" name="'.PARAM_CAT_SRV_LIST_TEMPLATE.'" value="1" checked="checked"/>
			<label for="'.PARAM_CAT_SRV_LIST_TEMPLATE.'">Add list to server templates</label>
		</div>
		<div class="form-group">			
			<input type="checkbox" id="'.PARAM_CAT_LIST_FORM.'" name="'.PARAM_CAT_LIST_FORM.'" value="1" checked="checked"/>
			<label for="'.PARAM_CAT_LIST_FORM.'">Create list form</label>
		</div>

		<div class="form-group">			
			<input type="checkbox" id="'.PARAM_CAT_VIEWS.'" name="'.PARAM_CAT_VIEWS.'" value="1" checked="checked"/>
			<label for="'.PARAM_CAT_VIEWS.'">Add to views</label>
		</div>
		<div class="form-group">							
			<label for="'.PARAM_CAT_VIEWS_SEC.'">Section in views:</label>
			<input type="text" id="'.PARAM_CAT_VIEWS_SEC.'" name="'.PARAM_CAT_VIEWS_SEC.'" size="15" maxlength="100" value="'.(isset($_REQUEST[PARAM_CAT_VIEWS_SEC])? $_REQUEST[PARAM_CAT_VIEWS_SEC]:"").'"/>
		</div>
		<div class="form-group">							
			<label for="'.PARAM_CAT_VIEWS_DESCR.'">Description in views:</label>
			<input type="text" id="'.PARAM_CAT_VIEWS_DESCR.'" name="'.PARAM_CAT_VIEWS_DESCR.'" size="15" maxlength="100" value="'.(isset($_REQUEST[PARAM_CAT_VIEWS_DESCR])? $_REQUEST[PARAM_CAT_VIEWS_DESCR]:"").'"/>
		</div>
		
		<div class="form-group">			
			<input type="checkbox" id="'.PARAM_CAT_DIALOG_MODEL.'" name="'.PARAM_CAT_DIALOG_MODEL.'" value="1" checked="checked"/>
			<label for="'.PARAM_CAT_DIALOG_MODEL.'">Dialog model</label>
		</div>
		
		<div class="form-group">			
			<input type="checkbox" id="'.PARAM_CAT_DIALOG_VIEW.'" name="'.PARAM_CAT_DIALOG_VIEW.'" value="1" checked="checked"/>
			<label for="'.PARAM_CAT_DIALOG_VIEW.'">Dialog javascript view</label>
		</div>
		<div class="form-group">			
			<input type="checkbox" id="'.PARAM_CAT_SRV_DIALOG_TEMPLATE.'" name="'.PARAM_CAT_SRV_DIALOG_TEMPLATE.'" value="1" checked="checked"/>
			<label for="'.PARAM_CAT_SRV_DIALOG_TEMPLATE.'">Add dialog to server templates</label>
		</div>
		<div class="form-group">			
			<input type="checkbox" id="'.PARAM_CAT_DIALOG_FORM.'" name="'.PARAM_CAT_DIALOG_FORM.'" value="1" checked="checked"/>
			<label for="'.PARAM_CAT_DIALOG_FORM.'">Create dialog form</label>
		</div>

		<div class="form-group">			
			<input type="checkbox" id="'.PARAM_CAT_CONTROLLER.'" name="'.PARAM_CAT_CONTROLLER.'" value="1" checked="checked"/>
			<label for="'.PARAM_CAT_CONTROLLER.'">Make controller</label>
		</div>
		
		<input type="submit" value="Make" name="'.SBMT_MAKE.'"/>
	</form>';	
	echo '</br>';
	
	//command
	if (isset($_REQUEST[SBMT_MAKE])){	
		$man = new CatHelper(
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
			if (!isset($_REQUEST[PARAM_CAT_BASE_MODEL_ID])){
				echo '<p>Base model is not defined!</p>';
				exit;
			}
			$man->makeCatalogObjects($_REQUEST);
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
