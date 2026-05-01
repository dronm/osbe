/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2016
 
 * @class
 * @classdesc Basic application class
 
 * @param {string} id - html tag id
 * @param {Object} options
 * @param {string} options.host
 * @param {string} options.bsCol
 * @param {Object} options.servVars
 * @param {string} options.constantXMLString  - XML data for model  
 * @param {string} options.locale 
 */
function App(id,options){

	this.setId(id);
	
	options = options || {};	
	options.servVars = options.servVars || {};
		
	var host = options.servVars.basePath || window.location.hostname || "";
	
	this.setHost(host);
	this.setScript(options.script);
	this.m_servVars = options.servVars;
		
	var con_opts = {
		"host":host,
		"token":this.m_servVars.token,
		"tokenr":this.m_servVars.tokenr,
		"tokenExpires":DateHelper.strtotime(this.m_servVars.tokenExpires)
	};
	this.setServConnector(new ServConnector(con_opts));
	
	this.m_constantManager = new ConstantManager({"XMLString":options.constantXMLString});
	
	if(window["SessionVarManager"]){
		this.m_sessionVarManager = new SessionVarManager();
	}
	
	this.m_cashData = {};
	this.m_openedForms = {};
	
	//this.m_templates = options.templates || {};
	this.m_templateParams = {};
	
	this.setPaginationClass(options.paginationClass || GridPagination);
	
	//this.m_tabManager = new TabManager("windowData");
}

/* Constants */

App.prototype.DEF_dateEditMask = "99/99/9999";
App.prototype.DEF_dateFormat = "d/m/Y";

App.prototype.DEF_dateTimeEditMask = "99/99/9999 99:99:99";
App.prototype.DEF_dateTimeFormat = "d/m/Y H:i:s";

App.prototype.DEF_phoneEditMask = "+7-(999)-999-99-99";
App.prototype.DEF_timeEditMask = "99:99";
App.prototype.DEF_timeFormat = "H:i:s";

App.prototype.DEF_LOCALE = "ru";

App.prototype.VERSION = "2.1.011";

App.prototype.HISTORY_KEEP_LEN = 20;

App.prototype.WIN_MES_WIDTH_DEF = 18;
App.prototype.WIN_MES_POS_DEF = "overlap";

App.prototype.UPDATE_INST_POSTPONE_DELAY = 5*60*1000;

/* private members */
App.prototype.m_id;
App.prototype.m_host;
App.prototype.m_script;
App.prototype.m_bsCol;
App.prototype.m_winClass;
App.prototype.m_servVars;
App.prototype.m_constantManager;
App.prototype.m_sessionVarManager;
App.prototype.m_servConnector;
App.prototype.m_dateEditMask;
App.prototype.m_dateFormat;
App.prototype.m_dateTimeEditMask;
App.prototype.m_dateTimeFormat;
App.prototype.m_timeFormat;

App.prototype.m_phoneEditMask;
App.prototype.m_timeEditMask;

App.prototype.m_locale;
App.prototype.m_cashData;

App.prototype.m_openedForms;

App.prototype.m_templates;
App.prototype.m_templateParams;

App.prototype.m_paginationClass;

App.prototype.m_enums;
App.prototype.m_predefinedItems;

App.prototype.m_tabManager;

App.prototype.m_updateInstPostponed;

App.prototype.m_appSrv;
/* protected*/


/* public methods */
App.prototype.setHost = function(host){
	this.m_host = host;
}

App.prototype.getHost = function(){
	return this.m_host;
}

App.prototype.setScript = function(v){
	this.m_script = v;
}

App.prototype.getScript = function(){
	return this.m_script;
}

App.prototype.getBsCol = function(v){
	return window.getBsCol(v);
}

App.prototype.setWinClass = function(winClass){
	this.m_winClass = winClass;
}

App.prototype.getWinClass = function(winClass){
	return this.m_winClass;
}

App.prototype.getServVars = function(){
	return this.m_servVars;
}

App.prototype.getServVar = function(id){
	return this.m_servVars[id];
}

//ToDo set on server!
App.prototype.setServVar = function(id,val){
	//if(!this.m_servVars[id]){
	//	throw new Error("Server variable not found "+id);
	//}
	this.m_servVars[id] = val;
}

App.prototype.getConstantManager = function(){
	return this.m_constantManager;
}

App.prototype.getSessionVarManager = function(){
	return this.m_sessionVarManager;
}

App.prototype.getServConnector = function(){
	return this.m_servConnector;
}

App.prototype.setServConnector = function(v){
	this.m_servConnector = v;
}

/**/
App.prototype.getId = function(){
	return this.m_id;
}

App.prototype.setId = function(id){
	this.m_id = id;
}

App.prototype.setDateEditMask = function(v){
	this.m_dateEditMask = v;
}
App.prototype.getDateEditMask = function(){
	return (this.m_dateEditMask)? this.m_dateEditMask : this.DEF_dateEditMask;
}

App.prototype.setDateTimeEditMask = function(v){
	this.m_dateTimeEditMask = v;
}
App.prototype.getDateTimeEditMask = function(){
	return (this.m_dateTimeEditMask)? this.m_dateTimeEditMask : this.DEF_dateTimeEditMask;
}

App.prototype.setDateFormat = function(v){
	this.m_dateFormat = v;
}
App.prototype.getDateFormat = function(){
	return (this.m_dateFormat)? this.m_dateFormat : this.DEF_dateFormat;
}

App.prototype.setDateTimeFormat = function(v){
	this.m_dateTimeFormat = v;
}
App.prototype.getDateTimeFormat = function(){
	return (this.m_dateTimeFormat)? this.m_dateTimeFormat : this.DEF_dateTimeFormat;
}

App.prototype.setTimeFormat = function(v){
	this.m_timeFormat = v;
}
App.prototype.getTimeFormat = function(){
	return (this.m_timeFormat)? this.m_timeFormat : this.DEF_timeFormat;
}

App.prototype.setPhoneEditMask = function(v){
	this.m_phoneEditMask = v;
}
App.prototype.getPhoneEditMask = function(){
	return (this.m_phoneEditMask)? this.m_phoneEditMask : this.DEF_phoneEditMask;
}
App.prototype.setTimeEditMask = function(v){
	this.m_timeEditMask = v;
}
App.prototype.getTimeEditMask = function(){
	return (this.m_timeEditMask)? this.m_timeEditMask : this.DEF_timeEditMask;
}

App.prototype.getLocale = function(){
	return this.m_servVars["locale_id"] || this.DEF_LOCALE;
}

App.prototype.formatError = function(erCode,erStr){
	return (erStr + (erCode)? (", code:"+erCode):"");
}

App.prototype.getCashData = function(id){
	return this.m_cashData[id];
}
App.prototype.setCashData = function(id,val){
	this.m_cashData[id] = val;
}

App.prototype.getOpenedForms = function(){
	return this.m_openedForms;
}

App.prototype.addOpenedForm = function(id,form){
	this.m_openedForms[id] = form;
}
App.prototype.delOpenedForm = function(id){
	delete this.m_openedForms[id];
}

App.prototype.numberFormat = function(val,prec){
	return CommonHelper.numberFormat(val, prec, CommonHelper.getDecimalSeparator(), " ");
}

App.prototype.addTemplate = function(id,tmpl){
	this.m_templates[id] = tmpl;
}

App.prototype.downloadServerTemplate = function(serverTemplateId,classId,callBack){
	var self = this;
	this.getServConnector().sendGet(
		{"t":serverTemplateId,"v":"ViewXML"},
		(callBack!=undefined),
		(function(serverTemplateId,classId){
			return function(eN,eS,resp){
				var m_list = resp.getModels();
				if(m_list && m_list[serverTemplateId+"-template"]){
					self.m_templates[classId] = m_list[serverTemplateId+"-template"].innerHTML;
					if(callBack){
						callBack(self.m_templates[classId]);
					}						
				}					
			}
		})(serverTemplateId,classId),
		"xml"
	);
}

App.prototype.getTemplate = function(id,callBack){	
	var tmpl = this.m_templates? this.m_templates[id]:null;
	/*
	if (!tmpl && this.m_serverTemplateIds){
		alert("App.prototype.getTemplate")
		var srv_tmpl_id,srv_tmpl_exists;
		if(CommonHelper.inArray(id,this.m_serverTemplateIds)>=0){
			srv_tmpl_id = id;
			srv_tmpl_exists = true;
		}
		else{
			var v_pos = id.lastIndexOf("_View");
			if(v_pos>=0){
				var srv_tmpl_id = id.substring(0,v_pos);
				if(CommonHelper.inArray(srv_tmpl_id,this.m_serverTemplateIds)>=0){
					srv_tmpl_exists = true;
				}
			}
		}
		if(srv_tmpl_exists){
			this.downloadServerTemplate(srv_tmpl_id,id,callBack);
			if(!callBack){
				tmpl = this.m_templates[id];
			}
		}
	}
	*/
	return tmpl;
}
App.prototype.setTemplate = function(id,v){
	this.m_templates[id] = v;
}

App.prototype.getPaginationClass = function(id){
	return this.m_paginationClass;
}
App.prototype.setPaginationClass = function(v){
	this.m_paginationClass = v;
}

App.prototype.getDataTypes = function(){
	return this.m_dataTypes;
}
App.prototype.setDataTypes = function(v){
	this.m_dataTypes = v;
}

App.prototype.getDataType = function(id){
	return this.m_dataTypes[id];
}

App.prototype.setEnums = function(v){
	this.m_enums = v;
}

App.prototype.getEnums = function(){
	return this.m_enums;
}

App.prototype.getEnum = function(enumId,valId){
	if (!this.m_enums[enumId])throw Error("Enum not found "+enumId)
	return this.m_enums[enumId][this.getLocale()+"_"+valId];
}

App.prototype.setPredefinedItems = function(v){
	this.m_predefinedItems = v;
}

App.prototype.getPredefinedItems = function(){
	return this.m_predefinedItems;
}

App.prototype.getPredefinedItem = function(dataType,item){
	return this.m_predefinedItems[dataType][item];
}

//localStorage
App.prototype.storageSet = function(id,val){
	//catch (e) e == QUOTA_EXCEEDED_ERR
	if(localStorage)localStorage.setItem(id, val);
}
App.prototype.storageGet = function(id){	
	if(localStorage)return localStorage.getItem(id);
}


/**
 * returns offset as +03:00
 */
App.prototype.getTimeZoneOffsetStr = function(){
	return DateHelper.getTimeZoneOffsetStr();
}

/**
 * @param {object} stateObj c,f,t,extra,title,url,itemNode
 */
App.prototype.historyPush = function(stateObj){
	if(window.history){		
		stateObj.urlHash = CommonHelper.hash(stateObj.url);
		if(!window.history.length||!window.history.state||(window.history.state&&window.history.state.urlHash!=stateObj.urlHash) ){
			//console.log("App.prototype.historyPush url="+stateObj.url)
			window.history.pushState(
				stateObj,
				stateObj.title,
				""//stateObj.url
			);
		}
	}
}

App.prototype.showMenuItem = function(itemNode,c,f,t,extra,title){
	//console.log("showMenuItem C="+c+" f="+f+" t="+t+" extra="+extra+" title="+title)
	window.setGlobalWait(true);
	
	var self = this;
	
	var url_str = "?c="+c;//for hash
	var par_v = "ViewXML";
	
	var par = {"v":"ViewXML"};
	if (c)par.c=c;
	if (f){
		par.f=f;
		url_str+="&f="+f;
	}
	
	if (extra){
		var par_ar = extra.split("&");
		for (var i=0;i<par_ar.length;i++){
			var par_pair = par_ar[i].split("=");
			if (par_pair.length==2&&par_pair[1]){
				par[par_pair[0]] = par_pair[1];
				url_str+="&"+par_pair[0]+"="+par_pair[1];
				if(par_pair[0]=="v"){
					par_v = par_pair[1];
				}
			}
		}
	}
	
	this.m_storedTemplate = this.getTemplate(t) ||
		{
			"id":t,
			"template":null,
			"dataModelId":null,
			"variantStorage":null
		}
	;
	
	par.t=t;
	url_str+="&t="+t;
	url_str+="&v="+par_v;
	/*
	if (!this.m_storedTemplate.template){
		par.t=t;
	}
	else if(this.m_storedTemplate.variantStorage && this.m_storedTemplate.variantStorage.model){
		//need filter!!!	
	}
	*/
	
	this.historyPush({
		"c":c,
		"f":f,
		"t":t,
		"extra":extra,
		"title":title,
		"url":url_str
	});
	
	this.getServConnector().sendGet(
		par,
		false,
		function(eN,eS,resp){
			if (eN!=0){
				window.setGlobalWait(false);
				window.showError(eS);
			}
			else{				
				self.renderContentXML(resp);
				window.setGlobalWait(false);
			}
		},
		"xml"
	);
	
	return false;
}

App.prototype.renderContentXML = function(resp){
	//var t0 = performance.now();
	try{
		var data_n = CommonHelper.nd("windowData");
		if (!data_n)return;

		if (this.m_view){
			//console.log("App.prototype.renderContentXML Deletting old this.m_view "+this.m_view.getId())
			this.m_view.delDOM();
			delete this.m_view;
		}
		
		//these views were needed for main page on load, now they can be discarted		
		if(window["page_views"]){
			//console.log("Clearing page_views from specific urls")
			for(var v_id in window["page_views"]){
				window["page_views"][v_id].delDOM();
				delete window["page_views"][v_id];
			}
			delete window["page_views"];
		}

		//remove all child nodes
		while (data_n.firstChild) {
			data_n.removeChild(data_n.firstChild);
		}	
	
		var v_opts = {"models":{}};
		var resp_models = resp.getModels();
		
		for (var m_id in resp_models){
			//console.log("m_id="+m_id)
			var sys_model = resp_models[m_id].getAttribute("sysModel");
			if (sys_model=="1" && resp_models[m_id].getAttribute("templateId")){
				// && !this.m_storedTemplate.template
				v_opts.template = resp_models[m_id].innerHTML;
				//this.m_storedTemplate.template = resp_models[m_id].innerHTML;
				//v_opts.template = this.m_storedTemplate.template;
				/*
				for(var i=0;i<resp_models[m_id].childNodes.length;i++){
					data_n.append(resp_models[m_id].childNodes[i]);
				}
				*/
			}
			else if (sys_model=="1"){
			
			}
			else{
				if(window[m_id]){
					var model_constr = eval(m_id);
					v_opts.models[m_id] = new model_constr({"data":resp.getModelData(m_id)});
				}
				else{
					v_opts.models[m_id] = new ModelXML(m_id,{"data":resp.getModelData(m_id)});
				}
			}
		}	
		this.m_storedTemplate.variantStorage = {"name":this.m_storedTemplate.id,"model":null};
		if (v_opts.models.VariantStorage_Model){
			this.m_storedTemplate.variantStorage.model = v_opts.models.VariantStorage_Model;
			this.m_storedTemplate.variantStorage.model.getRow(0);
		}
		
		//this.setTemplate(this.m_storedTemplate.id,this.m_storedTemplate);
		
		v_opts.variantStorage = this.m_storedTemplate.variantStorage;
		/*
		if (this.m_storedTemplate.template){
			data_n.innerHTML = this.m_storedTemplate.template;
		}
		*/
		var view = eval(this.m_storedTemplate.id+"_View");
		
		this.m_view = new view(this.m_storedTemplate.id,v_opts);
		this.m_view.toDOM(data_n);
		//console.log("App.prototype.renderContentXML rendering new this.m_view "+this.m_view.getId())
	}
	catch(e){
		//window.showError(e.message);
		window.onerror(e.message,"App.js",369,1);
	}
	
	//var t1 = performance.now();
	//console.log("renderContentXML took " + (t1 - t0) + " milliseconds.")
	
	return false;
}

App.prototype.showAbout = function(){
	window.setGlobalWait(true);
	var contr = new About_Controller(this);
	contr.run("get_object",{
		"t":"About",
		"ok":function(resp){
			var v = new About_View("About_View",{
				"template":resp.getModelData("About-template").innerHTML,
				"models":{"About_Model":new About_Model({"data":resp.getModelData("About_Model")})}
			});
			window.setGlobalWait(false);
			WindowAbout.show(v);
		},
		"fail":function(){
			window.setGlobalWait(false);
		}
	})	
}
App.prototype.quit = function(){	
	var self = this;
	(new User_Controller()).run("logout",{
		"ok":function(){
			self.getServConnector().quit();
			window.location.href = self.getServVar("basePath");
		}
	});
	window.setGlobalWait(true);
	return false;
}

App.prototype.getCurrentView = function(){
	return this.m_view;
}

App.prototype.setWinMessageStyle = function(v){
	this.m_winMessageStyle = v
}
App.prototype.getWinMessageStyle = function(){
	if(!this.m_winMessageStyle){
		var s_var = this.getServVar("win_message_style");
		this.m_winMessageStyle = CommonHelper.unserialize(s_var);
		if(CommonHelper.isEmpty(this.m_winMessageStyle)){
			this.m_winMessageStyle = {
				"win_width":18,
				"win_position":"overlap"
			}
		}
	}
	return this.m_winMessageStyle;
}

/*
App.prototype.getTabManager = function(){
	return this.m_tabManager;
}
*/

/**
 * @param {int} delay in milliseconds
 */
App.prototype.setUpdateInstPostponed = function(v,delay){
	this.m_updateInstPostponed = v;
	if(v){
		var self = this;
		setTimeout(function(){
			self.setUpdateInstPostponed(false);
		},delay);
	}
}

App.prototype.getUpdateInstPostponed = function(v){
	return this.m_updateInstPostponed;
}

App.prototype.getUpdateInstPostponeDelay = function(){
	if(!this.m_updateInstPostponeDelay){
		this.m_updateInstPostponeDelay = this.UPDATE_INST_POSTPONE_DELAY;
	}
	return this.m_updateInstPostponeDelay;
}

App.prototype.getAppSrv = function(){
	return this.m_appSrv;
}	

/**
 */
App.prototype.initAppSrv = function(appSrvOptions){	
	if(window["AppSrv"] && appSrvOptions){
		console.log("App.prototype.initAppSrv")		
		var self = this;
		appSrvOptions.onSetClientId = function(clientId){
			//eventServerClientId to server
			if(self.m_sessionVarManager){
				self.m_sessionVarManager.set("eventServerClientId",clientId);
			}
			self.subscribeToEventSrv(clientId);
		}
		try{
			this.m_appSrv = new AppSrv(appSrvOptions);			
			this.m_appSrv.connect();
		}
		catch(e){
			//web sockets are not supported
			if(window.showTempError){
				window.showTempError(this.ER_WS_NOT_SUPPERTED);
			}
			else{
				throw new Error(this.ER_WS_NOT_SUPPERTED);
			}
		}		
	}
}

/**
 * One subscription for all common app events
 */
App.prototype.subscribeToEventSrv = function(clientId){
console.log("App.prototype.subscribeToEventSrv")
	var self = this;
	if(!this.m_subscribeGroupId){
		//first subscription - constants		
		this.m_subscribeGroupId = this.m_appSrv.subscribe(
			[{"id":"Constant.update"}]
			,function(json){
				if(json.eventId=="Constant.update" && self.m_constantManager){
					self.m_constantManager.onEventSrvMessage(json);
				}
			}			
		);	
		
	}
	else{
		//close old id
		this.m_appSrv.unsubscribe(this.m_subscribeGroupId);
	}
	
	this.m_subscribeGroupId = this.m_appSrv.subscribe(
		[{"id":"SessionVar.update."+clientId}]
		,function(json){
			if(json.eventId=="SessionVar.update" && self.m_sessionVarManager){
				self.m_sessionVarManager.onEventSrvMessage(json);
			}
		}			
	);	
}

