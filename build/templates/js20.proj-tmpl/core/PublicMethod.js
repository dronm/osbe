/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2017

 * @class
 * @classdesc

 * @param {string} id
 * @param {object} options
 * @param {Controller} options.controller
 * @param {object} options.fields 
 */
function PublicMethod(id,options){

	this.setId(id);
	
	options = options || {};
	
	this.m_fields = options.fields || {};
	
	this.setController(options.controller);
}

/* constants */

/* private members */
PublicMethod.prototype.m_id;
PublicMethod.prototype.m_fields;
PublicMethod.prototype.m_controller;

/* private methods */
PublicMethod.prototype.fieldExists = function(id){
	return (this.m_fields[id]!=undefined);
}

/* public methods */
PublicMethod.prototype.getId = function(){
	return this.m_id;
}
PublicMethod.prototype.setId = function(id){
	this.m_id = id;
}

PublicMethod.prototype.addField = function(field){
	this.m_fields[field.getId()] = field;
}
PublicMethod.prototype.checkField = function(id){
	if (!this.fieldExists(id)){
		throw Error(CommonHelper.format(this.ER_NO_FIELD, Array(this.m_controller.getId(),this.getId(),id)) );		
	}
	return true;
}
PublicMethod.prototype.getField = function(id){
	this.checkField(id);
	return this.m_fields[id];
}

PublicMethod.prototype.getFields = function(){
	return this.m_fields;
}

PublicMethod.prototype.setFields = function(v){
	this.m_fields = v;
}
PublicMethod.prototype.setFieldValue = function(id,value){	
	/*if(value===null||value===undefined){
		this.resetFieldValue(id);
	}
	else{
		this.checkField(id);
		this.m_fields[id].setValue(value);
	}
	*/
	this.checkField(id);
	this.m_fields[id].setValue(value);
}
PublicMethod.prototype.getFieldValue = function(id){
	return this.getField(id).getValue();
}

PublicMethod.prototype.resetFieldValue = function(id){
	this.checkField(id);
	this.m_fields[id].resetValue();
}
PublicMethod.prototype.unsetFieldValue = function(id){
	this.checkField(id);
	this.m_fields[id].unsetValue();
}

PublicMethod.prototype.getController = function(){
	return this.m_controller;
}
PublicMethod.prototype.setController = function(c){
	this.m_controller = c;
}


/**
 * Stub
 */
PublicMethod.prototype.run = function(options){
}
