/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2016

 * @extends Validator
 * @requires core/Validator.js

 * @class
 * @classdesc
 
 * @param {Object} options
 */
function ValidatorEnum(options){
	options = options || {};
	this.setEnumValues(options.enumValues);
	
	ValidatorEnum.superclass.constructor.call(this,options);
}
extend(ValidatorEnum,Validator);

ValidatorEnum.prototype.m_enumValues;


ValidatorEnum.prototype.setEnumValues = function(v){
	this.m_enumValues = v;
}

ValidatorEnum.prototype.getEnumValues = function(){
	return this.m_enumValues;
}

ValidatorEnum.prototype.validate = function(val){
	ValidatorEnum.superclass.validate.call(this,val);
		
	var vals = this.getEnumValues();
	if (vals!==undefined && val!=undefined && vals.indexOf(val)<0){
		throw new Error(this.ER_INVALID);
	}
	
}
