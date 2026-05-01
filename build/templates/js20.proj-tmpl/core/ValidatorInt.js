/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2016
 
 * @extends Validator
 * @requires core/Validator.js
 
 * @class
 * @classdesc
 
 * @param {string} id - Field identifier
 * @param {namespace} options
 * @param {integer} maxValue
 * @param {integer} minValue
 * @param {boolean} [notZero=false] Default false,
 * @param {boolean} [unsigned=false]
 */
function ValidatorInt(options){
	ValidatorInt.superclass.constructor.call(this,options);
	
	if (options.maxValue){
		this.setMaxValue(options.maxValue);
	}
	if (options.minValue){
		this.setMinValue(options.minValue);
	}
	if (options.notZero!=undefined){
		this.setNotZero(options.notZero);
	}
	if (options.unsigned!=undefined){
		this.setUnsigned(options.unsigned);
	}	
}
extend(ValidatorInt,Validator);

ValidatorInt.prototype.m_maxValue;
ValidatorInt.prototype.m_minValue;
ValidatorInt.prototype.m_notZero;
ValidatorInt.prototype.m_unsigned;

ValidatorInt.prototype.correctValue = function(v){
	v = this.toNumber(v);
	if (isNaN(v)) v = null;
	return v;
}

ValidatorInt.prototype.toNumber = function(v){
	return parseInt(v);
}

ValidatorInt.prototype.validate = function(v){
	var n = this.toNumber(v);
	
	if (this.getRequired() && isNaN(n)){
		throw new Error(this.ER_INVALID);		
	}	
	if (this.m_maxValue && n>this.m_maxValue){
		throw new Error(CommonHelper.format(this.ER_VIOL_MAX,[n]));
	}
	if (this.m_minValue && n<this.m_minValue){
		throw new Error(CommonHelper.format(this.ER_VIOL_MIN,[n]));
	}
	if (this.m_notZero&&n==0){
		throw new Error(this.ER_VIOL_NOT_ZERO);
	}
	if (this.m_unsigned&&n<0){
		throw new Error(this.ER_VIOL_UNSIGNED);
	}
	
	return n;
}

ValidatorInt.prototype.getMaxValue = function(){
	return this.m_maxValue;
}
ValidatorInt.prototype.setMaxValue = function(v){
	this.m_maxValue = v;
}

ValidatorInt.prototype.getMinValue = function(){
	return this.m_minValue;
}
ValidatorInt.prototype.setMinValue = function(v){
	this.m_minValue = v;
}

ValidatorInt.prototype.getUnsigned = function(){
	return this.m_unsigned;
}
ValidatorInt.prototype.setUnsigned = function(v){
	this.m_unsigned = v;
}
ValidatorInt.prototype.getNotZero = function(){
	return this.m_notZero;
}
ValidatorInt.prototype.setNotZero = function(v){
	this.m_notZero = v;
}
