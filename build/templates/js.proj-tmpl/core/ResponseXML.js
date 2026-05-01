/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2016
 
 * @class
 * @classdesc Response as XML

 * @requires core/extend.js
 * @requires core/Response.js
 
 * @param {string} resp
 */
function ResponseXML(resp){
	ResponseXML.superclass.constructor.call(this,resp);
}
extend(ResponseXML,Response);

ResponseXML.prototype.TAG_ROOT = "document";
ResponseXML.prototype.TAG_MODEL = "model";

ResponseXML.prototype.getInitResponse = function(){
	return DOMHelper.xmlDocFromString("<"+this.TAG_ROOT+"></"+this.TAG_ROOT+">");
}

ResponseXML.prototype.setModelData = function(id,node){		
	this.m_resp.firstChild.appendChild(node);
	
	ResponseXML.superclass.setModelData.call(this,id,node);
}

ResponseXML.prototype.setResponse = function(resp){
	ResponseXML.superclass.setResponse.call(this,resp);
	
	var models = this.m_resp.documentElement.getElementsByTagName(this.TAG_MODEL);
	for (var i=0;i<models.length;i++){
		if (models[i].parentNode==this.m_resp.documentElement){
			this.m_models[models[i].getAttribute("id")] = models[i];
		}
	}
}

ResponseXML.prototype.getModel = function(id,modelOptions){
	if (this.modelExists(id) && !this.m_modelInstances[id]){
		modelOptions = modelOptions || {};
		modelOptions.data = this.m_models[id];
		this.m_modelInstances[id] = (window[id]? new window[id](modelOptions) : new ModelXML(id,modelOptions));
	}
	return this.m_modelInstances[id];
}
