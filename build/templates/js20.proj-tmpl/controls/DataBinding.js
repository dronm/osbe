/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2016
 
 * @class
 * @classdesc binding of form visual control to model
 
 * @param {object} options
 * @param {Control} options.control edit Control
 * @param {Field} options.field
 * @param {Model} options.model
 * @param {array} options.keyIds
 * @param {string} options.assocIndex
 */
function DataBinding(options){
	options = options || {};	
	
	this.m_control = options.control;
	this.m_field = options.field;
	this.m_fieldId = options.fieldId;
	this.m_model = options.model;
	this.m_keyIds = options.keyIds;
	this.m_assocIndex = options.assocIndex;
}

/* Constants */


/* private members */
DataBinding.prototype.m_control;
DataBinding.prototype.m_field;
DataBinding.prototype.m_fieldId;
DataBinding.prototype.m_model;
DataBinding.prototype.m_keyIds;

/* protected*/


/* public methods */
DataBinding.prototype.getControl = function(){
	return this.m_control;
}
DataBinding.prototype.setControl = function(v){
	this.m_control = v;
}

DataBinding.prototype.getField = function(){
	return this.m_field;
}

DataBinding.prototype.setField = function(v){
	this.m_field = v;
}

DataBinding.prototype.getFieldId = function(){
	return this.m_fieldId;
}

DataBinding.prototype.setFieldId = function(v){
	this.m_fieldId = v;
}

DataBinding.prototype.getModel = function(){
	return this.m_model;
}

DataBinding.prototype.setModel = function(v){
	this.m_model = v;
}

DataBinding.prototype.getKeyIds = function(){
	return (this.m_keyIds)? this.m_keyIds: ( (this.m_control && this.m_control.getKeyIds)? this.m_control.getKeyIds():null);
}

DataBinding.prototype.setKeyIds = function(v){
	this.m_keyIds = v;
}
DataBinding.prototype.getAssocIndex = function(){
	return this.m_assocIndex;
}

DataBinding.prototype.setAssocIndex = function(v){
	this.m_assocIndex = v;
}

