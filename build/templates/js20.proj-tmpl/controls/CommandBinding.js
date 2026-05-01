/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2016
 
 * @class
 * @classdesc binding of form visual control to model
 
 * @param {object} options
 * @param {Control} options.control edit Control
 * @param {Field} options.field
 * @param {string} options.fieldId
 * @param {array} options.keyIds 
 * @param {string} options.assocIndex
 * @param {function} options.func
 * @param {bool} [options.sendNull=true]
 */
function CommandBinding(options){
	options = options || {};	
	
	this.m_control = options.control;
	this.m_field = options.field;
	this.m_fieldId = options.fieldId;
	this.m_func = options.func;
	
	if (!this.m_fieldId && !this.m_field && this.m_control){
		if (this.m_control.getKeyIds && this.m_control.getKeyIds().length){
			this.m_fieldId = this.m_control.getKeyIds()[0];
			//console.log("CommandBinding.constructor ctrlName="+this.m_control.getName()+" fieldId="+this.m_fieldId)
		}
		else{
			this.m_fieldId = this.m_control.getName();
		}
	}
	
	this.m_assocIndex = options.assocIndex;
	this.m_sendNull = (options.sendNull!=undefined)? options.sendNull:true;
}

/* Constants */


/* private members */
CommandBinding.prototype.m_control;
CommandBinding.prototype.m_field;
CommandBinding.prototype.m_fieldId;
CommandBinding.prototype.m_func;
CommandBinding.prototype.m_sendNull;

/* protected*/


/* public methods */
CommandBinding.prototype.getControl = function(){
	return this.m_control;
}

CommandBinding.prototype.setControl = function(v){
	this.m_control = v;
}

CommandBinding.prototype.getField = function(){
	return this.m_field;
}

CommandBinding.prototype.setField = function(v){
	this.m_field = v;
}

CommandBinding.prototype.getFieldId = function(){
	return this.m_fieldId;
}

CommandBinding.prototype.setFieldId = function(v){
	this.m_fieldId = v;
}
CommandBinding.prototype.getAssocIndex = function(){
	return this.m_assocIndex;
}

CommandBinding.prototype.setAssocIndex = function(v){
	this.m_assocIndex = v;
}

CommandBinding.prototype.getFunc = function(){
	return this.m_func;
}

CommandBinding.prototype.setFunc = function(v){
	this.m_func = v;
}

CommandBinding.prototype.getSendNull = function(){
	return this.m_sendNull;
}

CommandBinding.prototype.setSendNull = function(v){
	this.m_sendNull = v;
}

