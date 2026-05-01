/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2016

 * @extends Validator
 * @requires core/Validator.js

 * @class
 * @classdesc
 
 * @param {Object} options
 */
function ValidatorString(options){
	ValidatorString.superclass.constructor.call(this,options);
}
extend(ValidatorString,Validator);

ValidatorString.prototype.validate = function(val){
	ValidatorString.superclass.validate.call(this,val);
	
	if (this.getRequired() && val==""){
		//console.trace();
		throw new Error(this.ER_EMPTY);
	}
}

