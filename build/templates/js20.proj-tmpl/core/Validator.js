/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2016

 * @class
 * @classdesc basic validator class
 
 * @param {Object} options
 * @param {int} options.minLength
 * @param {int} options.maxLength
 * @param {boolean} [options.fixLength=false]
 * @param {boolean} [options.required=false] 
 */

function Validator(options){
	options = options || {};
	this.setRequired(options.required);
	this.setMinLength(options.minLength);
	this.setFixLength(options.fixLength);
	this.setMaxLength(options.maxLength);
}

Validator.prototype.m_required;
Validator.prototype.m_minLength;
Validator.prototype.m_maxLength;
Validator.prototype.m_fixLength;

Validator.prototype.setRequired = function(v){
	this.m_required = v;
}
Validator.prototype.getRequired = function(){
	return this.m_required;
}
Validator.prototype.setMinLength = function(v){
	this.m_minLength = v;
}
Validator.prototype.getMinLength = function(){
	return this.m_minLength;
}
Validator.prototype.setMaxLength = function(v){
	this.m_maxLength = v;
}
Validator.prototype.getMaxLength = function(){
	return this.m_maxLength;
}

Validator.prototype.setFixLength = function(v){
	this.m_fixLength = v;
}
Validator.prototype.getFixLength = function(){
	return this.m_fixLength;
}
/*
Validator.prototype.isNull = function(val,defVal){
	return (
		(val===null)
		&&
		(defVal===null)
	);
}
*/
Validator.prototype.isTooLong = function(val){
	return (val && this.m_maxLength && val.length && val.length>this.m_maxLength);
}

Validator.prototype.isTooShort = function(val){
	return (val && this.m_minLength && val.length && val.length<this.m_minLength);
}

Validator.prototype.isNotFixed = function(val){
	return (val && this.m_fixLength && val.length && val.length!=this.m_maxLength);
}

Validator.prototype.validate = function(val){
	if (this.getRequired()
	&& val===null){
		throw new Error(this.ER_EMPTY);
	}
	if (this.isTooLong(val)){
		throw new Error(this.ER_TOO_LONG);
	}
	if (this.isTooShort(val)){
		throw new Error(this.ER_TOO_SHORT);
	}	
	if (this.isNotFixed(val)){
		throw new Error(this.ER_INVALID);
	}
}

Validator.prototype.correctValue = function(v){
	return v;
}
