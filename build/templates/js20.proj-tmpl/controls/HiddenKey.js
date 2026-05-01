/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2017

 * @class
 * @classdesc
 
 * @param {string} id - Object identifier
 * @param {object} options
 * @param {Validator} options.validator
 */
function HiddenKey(id,options){
	options = options || {};	
	
	options.visible = false;
	
	this.setValidator(options.validator);
	
	HiddenKey.superclass.constructor.call(this,id,"DIV",options);
}
extend(HiddenKey,ControlForm);

