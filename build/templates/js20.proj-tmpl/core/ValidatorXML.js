/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2016

 * @extends Validator
 * @requires core/Validator.js

 * @class
 * @classdesc
 
 * @param {Object} options
 */
function ValidatorXML(options){
	ValidatorXML.superclass.constructor.call(this,options);
}
extend(ValidatorXML,Validator);

ValidatorXML.prototype.correctValue = function(v){
	if(typeof v === "string"){
		v = DOMHelper.xmlDocFromString(v);
	}
	return v;
}
