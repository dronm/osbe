/**
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2014
 
 * @extends WindowForm
 * @class
 * @classdesc Basic visual view
 
 * @requires core/extend.js
 * @requires controls/WindowForm.js     
  
 * @param {object} options
 * @param {Controller} options.controller
 * @param {object} options.keys
 * @param {string} [options.view=Child]
 * @param {string} options.method
 * @param {string} options.template   
 */
function WindowFormObject(options){
	options = options || {};	
	/*
	if (!options.method){
		throw Error(this.ER_NO_METHOD);
	}
	*/

	options.host = options.host || window.getApp().getHost();
	options.script = options.script || window.getApp().getScript();
	options.URLParams = options.URLParams || "";
	
	if (options.formName){
		//options.controller = options.controller || options.formName+"_Controller";
		options.template = options.template || options.formName;
	}
	
	options.view = options.view || "Child";

	options.keys = options.keys || {"id":null};
	
	if (options.fullScreen==undefined && options.width==undefined && options.height==undefined){
		options.fullScreen = true;
	}
	options.name = options.name||options.formName;//+CommonHelper.serialize(options.keys);
	
	this.setController(options.controller);
	this.setMethod(options.method);
	this.setTemplate(options.template);
	this.setView(options.view);
	this.setKeys(options.keys);
	this.setMode((options.params && options.params.cmd)? options.params.cmd:null);  
	
	/*
	if(options.URLParams.length){
		options.params = options.params || {};
		options.params.editViewOptions = {};
		var url_par_ar = options.URLParams.split("&");
		for(var i=0;i<url_par_ar.length;i++){
			url_par_v_ar = url_par_ar[i].split("=");
			if(url_par_v_ar&&url_par_v_ar.length==2){
				options.params.editViewOptions[url_par_v_ar[0]] = url_par_v_ar[1];
			}
		}
	}	
	*/
	WindowFormObject.superclass.constructor.call(this,options);
	
}
extend(WindowFormObject,WindowForm);

/* Constants */


/* private members */
WindowFormObject.prototype.m_controller;
WindowFormObject.prototype.m_method;
WindowFormObject.prototype.m_template;
WindowFormObject.prototype.m_view;
WindowFormObject.prototype.m_keys;
WindowFormObject.prototype.m_keyIds;
WindowFormObject.prototype.m_mode;

/* protected*/

/* public methods */
WindowFormObject.prototype.getURLParams = function(){
	var str = this.m_controller? ("c="+this.m_controller):"";
	if(this.m_method)str += "&f="+this.m_method;
	if(this.m_template) str += "&t="+this.m_template;
	if(this.m_mode) str += "&mode="+this.m_mode;
	str += ((str=="")? "":"&") + "v="+this.m_view;
	
	for(var fid in this.m_keys){
		if (this.m_keys[fid]!=undefined){
			str += "&"+fid+"="+this.m_keys[fid];
		}
	}
	
	if (this.m_URLParams){
		str += "&"+this.m_URLParams;
	}
	
	var conn = window.getApp().getServConnector();
	if(conn.getAccessTokenParam){
		str+= "&"+conn.getAccessTokenParam()+"="+conn.getAccessToken();
	}
	
	return str;
}

WindowFormObject.prototype.setKeys = function(v){
	this.m_keyIds = [];
	for (var keyid in v){
		this.m_keyIds.push(keyid);
	}

	this.m_keys = v
}

WindowFormObject.prototype.getKeys = function(){
	return this.m_keys;
}
WindowFormObject.prototype.getKeyIds = function(){
	return this.m_keyIds;
}

WindowFormObject.prototype.setController = function(v){
	this.m_controller = v
}
WindowFormObject.prototype.getController = function(){
	return this.m_controller;
}
WindowFormObject.prototype.setMethod = function(v){
	this.m_method = v
}
WindowFormObject.prototype.getMethod = function(){
	return this.m_method;
}
WindowFormObject.prototype.setView = function(v){
	this.m_view = v
}
WindowFormObject.prototype.getView = function(){
	return this.m_view;
}
WindowFormObject.prototype.setTemplate = function(v){
	this.m_template = v
}
WindowFormObject.prototype.getTemplate = function(){
	return this.m_template;
}
WindowFormObject.prototype.setMode = function(v){
	this.m_mode = v
}
WindowFormObject.prototype.getMode = function(){
	return this.m_mode;
}
