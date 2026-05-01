<html>
	<head>
		<meta http-equiv="content-type" content="text/html; charset=UTF-8"/>
	</head>
	<body>
	<h1>Object helper 2.0</h1>

<?php
	//require_once("CatHelper.php");
	
	define('REPO_DIR',realpath(dirname(__FILE__)));
	
	//commands
	define('SBMT_MAKE','make');
	define('PARAM_BASE_MODEL_ID','base_model_id');
	
	define('PARAM_LIST_MODEL','list_model');
	define('PARAM_LIST_VIEW','list_view');
	define('PARAM_LIST_FORM','list_form');
	
	define('PARAM_LIST_SRV_TEMPLATE','server_template_list');
	define('PARAM_DIALOG_SRV_TEMPLATE','server_template_dialog');
	
	define('PARAM_VIEWS','views');
	define('PARAM_VIEWS_SEC','views_section');
	define('PARAM_VIEWS_DESCR','views_descr');

	define('PARAM_DIALOG_MODEL','dialog_model');
	define('PARAM_DIALOG_VIEW','dialog_view');
	define('PARAM_DIALOG_FORM','dialog_form');
	
	define('PARAM_ADD_CONTROLLER','controller');
	
	define('PARAM_CONTROL_EDIT','control_edit');
	define('PARAM_CONTROL_SELECT','control_select');
	
	echo '</br>';
	echo '</br>';
	echo '<form action="cat.php" method="POST" name=""
	enctype="multipart/form-data">
		<div class="form-group">							
			<label for="'.PARAM_BASE_MODEL_ID.'">Base model id:</label>
			<input type="text" id="'.PARAM_BASE_MODEL_ID.'" name="'.PARAM_BASE_MODEL_ID.'" size="15" maxlength="100" value="'.(isset($_REQUEST[PARAM_BASE_MODEL_ID])? $_REQUEST[PARAM_BASE_MODEL_ID]:"").'" required="required"/>			
		</div>
		
		<!-- *** List *** -->
		<fieldset>
			<legend>List</legend>	
		
			<div class="form-group">			
				<input type="checkbox" id="'.PARAM_LIST_MODEL.'" name="'.PARAM_LIST_MODEL.'" value="1" checked="checked"/>
				<label for="'.PARAM_LIST_MODEL.'">List model</label>
			</div>
		
			<div class="form-group">			
				<input type="checkbox" id="'.PARAM_LIST_VIEW.'" name="'.PARAM_LIST_VIEW.'" value="1" checked="checked"/>
				<label for="'.PARAM_LIST_VIEW.'">List javascript view</label>
			</div>
			<div class="form-group">			
				<input type="checkbox" id="'.PARAM_LIST_FORM.'" name="'.PARAM_LIST_FORM.'" value="1" checked="checked"/>
				<label for="'.PARAM_LIST_FORM.'">List javascript form</label>
			</div>
			<div class="form-group">			
				<input type="checkbox" id="'.PARAM_LIST_SRV_TEMPLATE.'" name="'.PARAM_LIST_SRV_TEMPLATE.'" value="1" checked="checked"/>
				<label for="'.PARAM_LIST_SRV_TEMPLATE.'">Add list view to server templates</label>
			</div>
			
		</fieldset>	
		<!-- *** List *** -->	


		<!-- *** Views/menu *** -->
		<fieldset>
			<legend>Views/menu</legend>			
			<div class="form-group">			
				<input type="checkbox" id="'.PARAM_VIEWS.'" name="'.PARAM_VIEWS.'" value="1" checked="checked"/>
				<label for="'.PARAM_VIEWS.'">Add to views</label>
			</div>
			<div class="form-group">							
				<label for="'.PARAM_VIEWS_SEC.'">Section in views:</label>
				<input type="text" id="'.PARAM_VIEWS_SEC.'" name="'.PARAM_VIEWS_SEC.'" size="15" maxlength="100" value="'.(isset($_REQUEST[PARAM_VIEWS_SEC])? $_REQUEST[PARAM_VIEWS_SEC]:"").'"/>
			</div>
			<div class="form-group">							
				<label for="'.PARAM_VIEWS_DESCR.'">Description in views:</label>
				<input type="text" id="'.PARAM_VIEWS_DESCR.'" name="'.PARAM_VIEWS_DESCR.'" size="15" maxlength="100" value="'.(isset($_REQUEST[PARAM_VIEWS_DESCR])? $_REQUEST[PARAM_VIEWS_DESCR]:"").'"/>
			</div>
		</fieldset>		
		<!-- *** Views/menu *** -->
		
		
		<!-- *** Dialog *** -->
		<fieldset>
			<legend>Dialog</legend>			
		
			<div class="form-group">			
				<input type="checkbox" id="'.PARAM_DIALOG_MODEL.'" name="'.PARAM_DIALOG_MODEL.'" value="1" checked="checked"/>
				<label for="'.PARAM_DIALOG_MODEL.'">Dialog model</label>
			</div>		
			<div class="form-group">			
				<input type="checkbox" id="'.PARAM_DIALOG_VIEW.'" name="'.PARAM_DIALOG_VIEW.'" value="1" checked="checked"/>
				<label for="'.PARAM_DIALOG_VIEW.'">Dialog javascript view</label>
			</div>
			<div class="form-group">			
				<input type="checkbox" id="'.PARAM_DIALOG_FORM.'" name="'.PARAM_DIALOG_FORM.'" value="1" checked="checked"/>
				<label for="'.PARAM_DIALOG_FORM.'">Dialog javascript form</label>
			</div>		
			<div class="form-group">			
				<input type="checkbox" id="'.PARAM_DIALOG_SRV_TEMPLATE.'" name="'.PARAM_DIALOG_SRV_TEMPLATE.'" value="0" checked=""/>
				<label for="'.PARAM_DIALOG_SRV_TEMPLATE.'">Add dialog to server templates</label>
			</div>
		</fieldset>	
		<!-- *** Dialog *** -->


		<!-- *** Editting *** -->
		<fieldset>
			<legend>Edit javascript control</legend>			
		
			<div class="form-group">			
				<input type="checkbox" id="'.PARAM_CONTROL_EDIT.'" name="'.PARAM_CONTROL_EDIT.'" value="1" checked="checked"/>
				<label for="'.PARAM_CONTROL_EDIT.'">Control edit</label>
			</div>		
			<div class="form-group">			
				<input type="checkbox" id="'.PARAM_CONTROL_SELECT.'" name="'.PARAM_CONTROL_EDIT.'" value="0" checked=""/>
				<label for="'.PARAM_CONTROL_SELECT.'">Control select</label>
			</div>		
		</fieldset>

		<!-- *** Controller *** -->
		<div class="form-group">			
			<input type="checkbox" id="'.PARAM_ADD_CONTROLLER.'" name="'.PARAM_ADD_CONTROLLER.'" value="1" checked="checked"/>
			<label for="'.PARAM_ADD_CONTROLLER.'">Add controller</label>
		</div>
		
		<input type="submit" value="Proceed" name="'.SBMT_MAKE.'"/>
	</form>';	
	echo '</br>';
	
	//command
	if (isset($_REQUEST[SBMT_MAKE])){	
		$man = new Helper(
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
			if (!isset($_REQUEST[PARAM_BASE_MODEL_ID])){
				echo '<p>Base model is not defined!</p>';
				exit;
			}
			$man->makeObjects($_REQUEST);
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
