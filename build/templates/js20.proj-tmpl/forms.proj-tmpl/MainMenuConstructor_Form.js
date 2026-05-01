/**
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2016
 
 * @class
 * @classdesc
 
 * @extends WindowFormObject	
 
 * @param {namespace} options
 * @param {string} options.formName
 * @param {string} options.method
 * @param {string} options.controller   
 */	
function MainMenuConstructor_Form(options){
	options = options || {};	
	
	options.formName = "MainMenuConstructor";
	options.controller = "MainMenuConstructor_Controller";
	options.method = "get_object";
	
	MainMenuConstructor_Form.superclass.constructor.call(this,options);
}
extend(MainMenuConstructor_Form,WindowFormObject);

/* Constants */


/* private members */

/* protected*/


/* public methods */

