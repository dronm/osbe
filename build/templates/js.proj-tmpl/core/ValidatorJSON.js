/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2016

 * @extends Validator
 * @requires core/extend.js 
 * @requires core/Validator.js

 * @class
 * @classdesc
 
 * @param {Object} options
 */

function ValidatorJSON(options){
	ValidatorJSON.superclass.constructor.call(this,options);
}
extend(ValidatorJSON,Validator);

ValidatorJSON.prototype.correctValue = function(v){
	/*
	var uns_v = CommonHelper.unserialize(v);
	console.log("ValidatorJSON.prototype.correctValue value="+v)
	console.dir(uns_v);
	*/
	return CommonHelper.unserialize(v);
}
