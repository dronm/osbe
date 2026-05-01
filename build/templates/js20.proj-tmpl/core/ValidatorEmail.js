/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2016

 * @extends ValidatorString
 * @requires core/ValidatorString.js

 * @class
 * @classdesc
 
 * @param {Object} options
 */
function ValidatorEmail(options){

	options.maxLength = this.MAX_LENGTH;
	
	ValidatorEmail.superclass.constructor.call(this,options);
}
extend(ValidatorEmail,ValidatorString);

ValidatorEmail.prototype.MAX_LENGTH = 100;

ValidatorEmail.prototype.validate = function(val){
	
	ValidatorEmail.superclass.validate.call(this,val);
	
	var re = /\S+@\S+\.\S+/;
	if (val&&val.length&&!re.test(val)){
		throw new Error(this.ER_INVALID);
	}
}

