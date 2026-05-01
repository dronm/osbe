/* Copyright (c) 2012 
	Andrey Mikhalevich, Katren ltd.
*/
/*	
	Description
*/
//ф
/** Requirements
 * @requires common/functions.js
 * @requires core/Field.js
*/

/* constructor */
function PublicMethod(id){
	this.setId(id);
	this.m_params={};
}

/* constants */
PublicMethod.prototype.ER_PARAM_NOT_FOUND = "Поле '%' метода '%' не найден.";

/* private members */
PublicMethod.prototype.m_id;
PublicMethod.prototype.m_params;

/* private methods */
PublicMethod.prototype.paramExists = function(paramName){
	return (this.m_params[paramName]!=undefined);
}

/* public methods */
PublicMethod.prototype.getId = function(){
	return this.m_id;
}
PublicMethod.prototype.setId = function(id){
	this.m_id = id;
}

PublicMethod.prototype.addParam = function(param){
	this.m_params[param.getId()] = param;
}
PublicMethod.prototype.removeParam = function(paramId){
	delete this.m_params[paramId];
	this.m_params[paramId]=undefined;
}

PublicMethod.prototype.setParam = function(param){
	this.addParam(param);
}
PublicMethod.prototype.checkParam = function(paramName){
	if (!this.paramExists(paramName)){
		throw new Error(
			CommonHelper.format(this.ER_PARAM_NOT_FOUND,
				Array(paramName, this.getId())
			));
		
	}
	return true;
}
PublicMethod.prototype.getParamById = function(paramId){
	this.checkParam(paramId);
	return this.m_params[paramId];
}
PublicMethod.prototype.getParams = function(){
	return this.m_params;
}
PublicMethod.prototype.setParamValue = function(paramName,value){
	try{
		this.m_params[paramName].setValue(value);
	}
	catch(e){
		throw new Error("Public method: '"+this.getId()+"', param '"+paramName+"' not found.");
	}
}
PublicMethod.prototype.getParamValue = function(paramName){
	return this.getParamById(paramName).getValue();
}
