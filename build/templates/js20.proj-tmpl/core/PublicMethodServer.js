/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2017

 * @extends PublicMethod
 * @requires core/extend.js
 * @requires core/PublicMethod.js     

 * @class
 * @classdesc
 
 * @param {string} id - Object identifier
 * @param {namespace} options
 * @param {ControllerAjx} options.controller
 * @param {string} options.requestType
 * @param {bool} options.async
 * @param {string} options.encType
 * @param {bool} [options.ws=false] use web socket
 */
function PublicMethodServer(id,options){
	options = options || {};	
	
	if (!options.controller){
		throw Error(CommonHelper.format(this.ER_NO_CONTROLLER, Array(id)));
	}
		
	this.setRequestType(options.requestType);
	this.setAsync(options.async);
	this.setEncType(options.encType);
	this.setWS(options.ws);
	
	PublicMethodServer.superclass.constructor.call(this,id,options);
}
extend(PublicMethodServer,PublicMethod);

/* Constants */


/* private members */
PublicMethodServer.prototype.m_requestType;
PublicMethodServer.prototype.m_sync;
PublicMethodServer.prototype.m_encType;
PublicMethodServer.prototype.m_ws;

/* protected*/


/* public methods */
PublicMethodServer.prototype.getRequestType = function(){
	return this.m_requestType;
}
PublicMethodServer.prototype.setRequestType = function(v){
	this.m_requestType = v;
}

PublicMethodServer.prototype.getAsync = function(){
	return this.m_async;
}
PublicMethodServer.prototype.setAsync = function(v){
	this.m_async = v;
}

PublicMethodServer.prototype.getEncType = function(){
	return this.m_encType;
}
PublicMethodServer.prototype.setEncType = function(v){
	this.m_encType = v;
}

PublicMethodServer.prototype.download = function(viewId,ind,callBack){
	//arguments to fields
	this.getController().download(this.getId(),viewId,ind,callBack);
}
PublicMethodServer.prototype.openHref = function(viewId, winParams, winName){
	return this.getController().openHref(this.getId(),viewId,winParams,winName);
}

PublicMethodServer.prototype.run = function(options){
	if(this.m_ws===true && options.ws==undefined){
		options.ws = true;
	}
	return this.getController().run(this.getId(), options);
}

PublicMethodServer.prototype.getWS = function(){	
	return this.m_ws;
}
PublicMethodServer.prototype.setWS = function(v){	
	this.m_ws = v;
}
