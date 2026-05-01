/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2017

 * @extends Control
 * @requires core/extend.js
 * @requires Control.js     

 * @class
 * @classdesc
 
 * @param {string} id - Object identifier
 * @param {string} tagName
 * @param {object} options
 */
function ControlForm(id,tagName,options){
	options = options || {};	
	
	ControlForm.superclass.constructor.call(this,id,tagName,options);
}
extend(ControlForm,Control);

/* Constants */
ControlForm.prototype.VAL_INIT_ATTR = "initValue";

/* private members */
ControlForm.prototype.m_formatFunction;

/* protected*/


/* public methods */
ControlForm.prototype.setValidator = function(v){
	this.m_validator = v;
}
ControlForm.prototype.getValidator = function(){
	return this.m_validator;
}

ControlForm.prototype.setInitValue = function(val){
	this.setValue(val);
	this.setAttr(this.VAL_INIT_ATTR,this.getValue());
}

ControlForm.prototype.getInitValue = function(val){
	return this.getAttr(this.VAL_INIT_ATTR);
}

ControlForm.prototype.isNull = function(){
	var v = this.getValue();
	return (!v || v.length==0);
}
ControlForm.prototype.getModified = function(){
	var v = this.getValue();
	return (this.getValue()!=this.getInitValue());
}
ControlForm.prototype.getIsRef = function(){
	return false;
}
ControlForm.prototype.setValid = function(v){
	return false;
}
ControlForm.prototype.setValue = function(val){
	if (this.m_validator){
		val = this.m_validator.correctValue(val);
	}
	ControlForm.superclass.setValue.call(this,val);
}

ControlForm.prototype.getFormatFunction = function(){
	return this.m_formatFunction;
}
ControlForm.prototype.setFormatFunction = function(v){
	this.m_formatFunction = v;
}
ControlForm.prototype.getInputEnabled = function(){
	return this.getEnabled();
}
ControlForm.prototype.setInputEnabled = function(v){
	this.setEnabled(v);
}
