/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2010
 
 * @class
 * @classdesc Response object. Model container

 * @requires core/CommonHelper.js 
 
 * @param {string} resp - Server response
 */
function Response(resp){	
	this.m_models = {};
	this.m_modelInstances = {};
	this.setResponse(resp);
}

/* private members */
Response.prototype.m_resp;
Response.prototype.m_models;//model data cache
Response.prototype.m_modelInstances;//created objects corrected 21/02/20

/* public */
Response.prototype.getInitResponse = function(){
}

Response.prototype.setResponse = function(resp){	
	this.m_resp = resp? resp:this.getInitResponse();
}

Response.prototype.modelExists = function(id){
	return (this.m_models[id])? true:false;
}

Response.prototype.setModelData = function(id,data){
	this.m_models[id] = data;
}

/**
 * @param {string} id model id
 * returns {XMLDocument|JSON}
 */
Response.prototype.getModelData = function(id){
	if (!this.m_models[id]){
		throw new Error(CommonHelper.format(this.ERR_NO_MODEL,[id]));
	}
	return this.m_modelInstances[id]? this.m_modelInstances[id].getData():this.m_models[id];	
}

Response.prototype.getModels = function(){
	return this.m_models;	
}

Response.prototype.getModel = function(id,modelOptions){
	if (this.modelExists(id) && window[id] && !this.m_modelInstances[id]){
		modelOptions = modelOptions || {};
		modelOptions.data = this.m_models[id];
		this.m_modelInstances[id] = new window[id](modelOptions);
	}
	return this.m_modelInstances[id];
}
