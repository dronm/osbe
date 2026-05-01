/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2018

 * @requires core/App.js
 * @requires core/AppWin.js
 * @requires core/CommonHelper.js   

 * @class
 * @classdesc Fatal exception. Modal window on screen center. Authorization is needed
 
 * @param {object} options
 * @param {int} options.code - Exception identifier
 * @param {string} options.message - Exception identifier
 * @param {object} options.templateOptions
 * @param {function} options.viewAddElement 
 */
function FatalException(options){
	this.m_code = options.code;
	this.m_message = options["message"];	
	
	this.m_cmdOk = options.cmdOk;
	this.m_templateOptions = options.templateOptions;
	this.m_viewAddElement = options.viewAddElement;
}

FatalException.prototype.TEMPLATE_ID = "FatalException";

FatalException.prototype.show = function(){
	//console.log("FatalException.prototype.show")
	//if (CommonHelper.nd("ex_"+this.m_code+":form")){
	if (document.getElementById("ex_"+this.m_code+":form")){
		//already got window
		return;
	}
	
	var p = window.location.href.indexOf("?");
	var redir;
	if(p>=0){
		redir = JSON.stringify({"ref":window.location.href.substr(p+1)});
	}
	
	var opts = this.m_templateOptions || {};
	if(this.m_code){
		opts.code = this.m_code;
	}
	if(this.m_message){
		opts["message"] = this.m_message;
	}
	var app = window.getApp();
	opts.url = app.getServVar("basePath")+(redir? "?redir="+redir:"");
	
	var view_opts = {
		"template":app.getTemplate(this.TEMPLATE_ID),
		"templateOptions":opts
	};
	
	var self = this;
	if(this.m_viewAddElement){
		 view_opts.addElement = function(){
		 	self.m_viewAddElement.call(this);
		 }
	}
	
	//this.m_view = new ControlContainer("ex_"+this.m_code+":view:body:view","TEMPLATE",view_opts);
	
	app.m_dbExceptionForm = new WindowFormModalBS("ex_"+this.m_code+":form",{
		"cmdCancel":false,
		"cmdOk":this.m_cmdOk,
		"content":new ControlContainer("ex_"+this.m_code+":view:body:view","TEMPLATE",view_opts),
		"contentHead":this.HEADER,
		"onClickOk":!this.m_cmdOk? null : (function(form){
			return function(){
				form.close();
			}
		})(app.m_dbExceptionForm)
	});

	app.m_dbExceptionForm.open();
}
