OpensourceSmallBusinessErp

backend && Frontend  solution
PHP && Javascript based

see Wiki for detailes


2.1.2
	Model.sysModel attribute
	Constant_Controller.get_values takes field_sep parameter

14/04/2017
	GridColumn added cellElements for object support in cells
	Grid showHead attribute
	Grid Attribute rowClass is removed and added to Head
	Grid onGetData Cell options cloning
	GridHead is documented acording to JSDoc rules
	ViewObjectAjx changed function addDetailDataSet. ViewObjectAjx.m_DetailDataSet contains now not datasets' names but ids
	
	JSON data Type on server and js
	
15/04/2017
	JSDOC support for js documentation from https://github.com/jsdoc3/jsdoc
	Project structure modification: doc folder has now backend and frontend folders for server and client-side documentation.
	Template directories have been created.
	
	documentation pattern structure: 
		build/templates/build.proj-tmpl/templates.proj-tmpl/doc.proj-tmpl/Doc_html.xsl
		is moved to 
		build/templates/build.proj-tmpl/templates.proj-tmpl/doc.proj-tmpl/backend.proj-tmpl/Doc_html.xsl
		added
		build/templates/build.proj-tmpl/templates.proj-tmpl/doc.proj-tmpl/frontend.proj-tmpl/JSDocConf.xsl
		
	Doc_html.xsl translated into English
	
18/04/2017
	ProjectManager standart XSLTProcessor usage if XSLT_PROCESSOR_TEMPLATE constant is not defined in Config.php	
	
19/04/2017
	ProjectManager windows symbolic link support with external utilities. Constant SYMLINK_TEMPLATE added to build/Config.php
	ProjectManager translation
	Profix # is added for build/Config.php replacing parameters	
	
	Edit.js can accept emty class ("") or null so that it wont inherit default class value
	
	VL classes documentation
	
	Array data Type on server and js attribute ArrayType to md.model
	
20/04/2017
	Edit.js label position (right/left)	
	
	TCPClient base class
	
27/04/2017
	Server View->write error code is added. So html views would use it to display different pages 
	
03/05/2017
	JSONB data type	
	
2.1.3	02/08/2017
	Permissions separated into defferent files based on roles	
	data type DT_XML
		Constants.php
		FieldSQLXML.php
		FieldExtXML.php
		ParamsSQL.php
		
2.1.4	11/08/2017
	Переделана сериализация объекта RefType
	Обрать внимание на сериализацию ModelFilter в сохраненных моделях! SaveVariant!!!
	
	Controller->ControllerObj->ControllerObjServer
	Controller->ControllerObj->ControllerObjClient
	PublicMethod->PublicMethodServer
	Все котроллеры js переделать от ControllerObjServer!!! все методы от PublicMethodServer
	
	ServResp->Response
	Response->ResponseXML
	Response->ResponseJSON
	
	Файл MD: Controllers->Controller->parentIdJS воспринимается Controller_js20 как родитель, если нет - ControllerAjxDb
		{bool} [Controllers->Controller->server=true]
		{bool} Controllers->Controller->client bool=true]
		
	Убрать все лишнее в контроллерах(тэги state ...)
	проверить validate по DTD
	
2.1.5	18/07/2017
	ModelTemplate template param {{id}} changed to real id on the fly on server side			

2.1.6	18/08/2017
	Hard coded parameter name 't' changed to PARAM_TEMPLATE
		Controller.php
		ModelSQL.php
	Controller.php bug fix permitting to 
	
2.1.9
	cmd.php,Controller.php
	if  Controller->runPublicMethod() returns TRUE it means that headers have been sent already. No need to send anything else.
	so Controller->write() is not executed
	
2.1.10 02/10/2017
	new data types:DT_INT_BIG,DT_INT_SMALL
	
2.1.11 21/10/2017
	JS Mustache.
	
2.1.12 31/10/2017	
	basic_classes/VariantStorage.php Corrected mistakes.
