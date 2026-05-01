/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2018

 * @extends Control
 * @requires core/extend.js
 * @requires controls/Control.js     

 * @class
 * @classdesc
 
 * @param {string} id - Object identifier
 * @param {object} options
 */
function TemplateView(id,options){
	options = options || {};	
	
	this.setPublicMethod(options.publicMethod);
	this.setOnAfterRender(options.onAfterRender);
	this.setOnBeforeRender(options.onBeforeRender);
	this.setViewTemplateOptions(options.viewTemplateOptions);
	
	TemplateView.superclass.constructor.call(this,id,options.tagName,options);
	
	if (options.model){
		if (typeof(options.model)="ModelXML"){
			var resp = new ResponseXML();
		}
		else if (typeof(options.model)="ModelJSON"){
			var resp = new ResponseJSON();
		}
		this.setModel(options.model);	
		resp.setModelData(options.model)
		this.onGetData(resp);
	}	
}
//ViewObjectAjx,ViewAjxList
extend(TemplateView,Control);

/* Constants */


/* private members */
TemplateView.prototype.m_publicMethod;
TemplateView.prototype.m_onAfterRender;
TemplateView.prototype.m_onBeforeRender;
TemplateView.prototype.m_viewTemplateOptions;
TemplateView.prototype.m_model;
TemplateView.prototype.m_refreshInterval;

/* protected*/


/* public methods */
TemplateView.prototype.onGetData = function(resp){
	
	var t_options = {};
	if(this.m_viewTemplateOptions)CommonHelper.merge(t_options,this.m_viewTemplateOptions);
	
	if (this.m_onBeforeRender)this.m_onBeforeRender.call(this,resp);
	
	t_options.rows = [];
	var model = resp.getModel()
	
	while(model.getNextRow()){	
	}
	
	if (this.m_onAfterRender)this.m_onAfterRender.call(this,resp);
}

TemplateView.prototype.setPublicMethod = function(v){
	this.m_publicMethod = v;
}
TemplateView.prototype.getPublicMethod = function(){
	return this.m_publicMethod;
}
TemplateView.prototype.setOnAfterRender = function(v){
	this.m_onAfterRender = v;
}
TemplateView.prototype.setOnAfterRender = function(){
	return this.m_onAfterRender;
}
TemplateView.prototype.setOnBeforeRender = function(v){
	this.m_onBeforeRender = v;
}
TemplateView.prototype.getOnBeforeRender = function(){
	return this.m_onBeforeRender;
}
TemplateView.prototype.setViewTemplateOptions = function(v){
	this.m_viewTemplateOptions = v;
}
TemplateView.prototype.getViewTemplateOptions = function(){
	return this.m_viewTemplateOptions;
}
TemplateView.prototype.setModel = function(v){
	this.m_model = v;
}
TemplateView.prototype.getModel = function(){
	return this.m_model;
}
TemplateView.prototype.setRefreshInterval = function(v){
	this.m_refreshInterval = v;
}
TemplateView.prototype.getRefreshInterval = function(){
	return this.m_refreshInterval;
}
