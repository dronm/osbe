/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2017

 * @extends ControllerObj
 * @requires core/extend.js
 * @requires core/ControllerObj.js
 * @requires core/PublicMethodServer.js           

 * @class
 * @classdesc
 
 * @param {namespace} options
 * @param {ServConnector} options.servConnector 
 */
function ControllerObjServer(options){
	options = options || {};	
	
	options.publicMethodClass = options.publicMethodClass || PublicMethodServer;
	
	this.setServConnector(options.servConnector);
	
	ControllerObjServer.superclass.constructor.call(this,options);
}
extend(ControllerObjServer,ControllerObj);

/* Constants */
ControllerObjServer.prototype.PARAM_DEF_VIEW = "ViewXML";
ControllerObjServer.prototype.PARAM_CONTROLLER = "c";
ControllerObjServer.prototype.PARAM_METH = "f";
ControllerObjServer.prototype.PARAM_VIEW = "v";


/* private members */
ControllerObjServer.prototype.m_servConnector;
ControllerObjServer.prototype.m_resp;


/* protected*/
ControllerObjServer.prototype.addDefParams = function(pm){	
	pm.addField(new FieldString(this.PARAM_CONTROLLER,{"value":this.getId()}));
	pm.addField(new FieldString(this.PARAM_METH,{"value":pm.getId()}));
	pm.addField(new FieldString(this.PARAM_VIEW,{"value":this.PARAM_VIEW_VALUE}));
}

//returns number of added params
ControllerObjServer.prototype.checkMethodParams = function(methId,viewId,params){
	var param_cnt = 0;
	var pm = this.getPublicMethod(methId);	
	for (var id in pm.getFields()){
		//skeep predefind fields
		if(id == this.PARAM_CONTROLLER || id == this.PARAM_METH || id == this.PARAM_VIEW){
			continue;
		}
		var f = pm.getField(id);
		var is_null = f.isNull();
		//console.log("Controller.prototype.getParams field="+id+" is_set="+f.isSet()+" is_null="+f.isNull());
		if (is_null && f.getValidator().getRequired()){
			//not from gui, gui has its own validation
			throw Error(CommonHelper.format(this.ER_EMPTY,Array(this.getId(),methId,f.getId())));
		}		
		if (f.isSet()){
			params[id] = f.getValueXHR();
			param_cnt++;
		}		
	}
	return param_cnt;
}

ControllerObjServer.prototype.getParams = function(methId,viewId){

	var params = {};	
	params[this.PARAM_CONTROLLER] = this.getId();
	params[this.PARAM_METH] = methId;
	params[this.PARAM_VIEW] = viewId || this.PARAM_DEF_VIEW;
	
	this.checkMethodParams(methId,viewId,params);
	return params;
}


/* public methods */
ControllerObjServer.prototype.getServConnector = function(){
	return (this.m_servConnector)? this.m_servConnector:window.getApp().getServConnector();
}
ControllerObjServer.prototype.setServConnector = function(v){
	this.m_servConnector = v;
}

/**
 * @param {string} methId Method identifier
 * @param {object} options
 * @param {bool} [options.requestType=true],
 * @param {bool} [options.async=true]
 * @param {function} options.fail Arguments resp,errCode,errStr,requestId
 * @param {function} options.all Arguments resp,errCode,errStr,requestId 
 * @param {function} options.ok Arguments {Response} resp, {string} requestId
 * @param {string} [options.retContentType=xml]: Return type. Can be one of: document||text||json|| arraybuffer||blob
 * @param {string} options.encType Encoding for post requests
 * @param {string} options.viewId
 * @param {bool} [options.ws=false]
 * @param {function} options.progress Argument json
*/
ControllerObjServer.prototype.run = function(methId,options){

	options = options || {};
	var meth = this.getPublicMethod(methId);
	
	if (options.requestType==undefined){
		options.requestType = (meth.getRequestType()!=undefined)? meth.getRequestType():"get";
	}
	if (options.async==undefined){
		options.async = (meth.getAsync()!=undefined)? meth.getAsync():true;
	}
	if (options.encType==undefined){
		options.encType = (meth.getEncType()!=undefined)? meth.getEncType():null;
	}
	
	options.retContentType = (options.retContentType==undefined||options.retContentType=="xml")? "document" : options.retContentType;
	
	var self = this;
	options.fail = options.fail || function(resp,errCode,errStr){
		window.showError(errCode+" "+errStr);
	};
	
	var ret_func = function(errCode, errStr, resp, requestId){
	
		if (!options.async){
			window.setGlobalWait(false);
		}
	
		if (errCode!=0){
			//Error
			options.fail.call(self,resp,errCode,errStr,requestId);
		}
		else if (options.ok){
			//success user function
			self.m_resp = requestId;
			options.ok.call(self,resp,requestId);
		}
		else{
			//success no func
			self.m_resp = resp;
		}
		
		if (options.all){
			options.all.call(self,resp,errCode,errStr,requestId);
		}				
		
	}
				
	//HTTP or WS
	//Web Socket resolution rule:
	//	- AppSrv exists
	//	- AppSrv connection active
	//	- options.ws = true || method.getWS = true
	//	otherwise use HTTP	
	var app_srv = false;
	if(window["AppSrv"] && (options.ws===true || (meth.getWS && meth.getWS()===true)) ){
		app_srv = window.getApp().getAppSrv();
	}
//debugger	
	if (app_srv && app_srv.connActive && app_srv.connActive()){
		var argv = {};
		this.checkMethodParams(methId, options.viewId, argv);
		
		var contr_id = this.getId();
		contr_id = contr_id.substring(0, contr_id.indexOf("_Controller"));
		app_srv.runPublicMethod(
			contr_id+"."+methId
			,argv
			,options.viewId || this.PARAM_DEF_VIEW
			,options.progress
			,ret_func
		)
		
	}else{
		if (!options["async"]){
			window.setGlobalWait(true);
		}
		
		var params = this.getParams(methId,options.viewId);
		//template
		if(options.t){
			params.t = options.t;
		}
		
		//offlien support
		//if(!navigator.onLine){
		//	console.log("offline functionality for query with params:",params);
		//	return;
		//}

		var conn = this.getServConnector();
		var con_func = (options.requestType=="post")? conn.sendPost : conn.sendGet;
		
		this.m_resp = null;
		
		return con_func.call(conn,
			params,
			options["async"],
			ret_func,
			options.retContentType,
			options.encType
		);
		
	}
}

//ind for multidownload is obligatory to create many frames
/*
ControllerObjServer.prototype.download = function(methId,viewId,ind,callBack){
	const params = this.getParams(methId, viewId);	
	const parStr = this.getServConnector().queryParamsAsStr(params, true);//encode!!!
	const source = window.getApp().getServConnector().getScript()+"?"+parStr;

	fetch(source, { method: 'GET' })
	.then(response => {
		const contentType = response.headers.get('content-type'); // Get Content-Type
		if (contentType && contentType.includes('text/xml')) {
			//error
			response.text().then(xmlText => {
				const parser = new DOMParser();
				const xmlDocument = parser.parseFromString(xmlText, "application/xml");
				const resp = new ResponseXML(xmlDocument);
				const respModelId = window.getApp().SERV_RESPONSE_MODEL_ID;
				const m = resp.modelExists(respModelId)? new ModelServRespXML(resp.getModelData(respModelId)) : null;
				if (m && m.result){
					//error
					//throw new Error(m.descr);
					if (callBack){
						callBack(m.result);
					}
					
					window.showError(m.descr, null, 10000);
				};
			});
		}

		const contentDisposition = response.headers.get('Content-Disposition');
		let filename = 'downloaded-file';
		if (contentDisposition) {
			let match = contentDisposition.match(/filename\*=(?:UTF-8'')?([^;]+)/);
			if (match) {
				// Decode UTF-8 encoded filename
				filename = decodeURIComponent(match[1]);
			} else {
				match = contentDisposition.match(/filename="(.+?)"/);
				if (match) {
					filename = match[1]; // Plain filename (if UTF-8 encoding wasn't used)
				}
			}			
		}
			    
		return response.blob().then(blob => ({ blob, filename }));
		
	})
	.then(({ blob, filename }) => {
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = filename;
		document.body.appendChild(a);
		a.click();
		URL.revokeObjectURL(url);
		if (callBack){
			callBack(0);
		}
		
	});	
}
*/
ControllerObjServer.prototype.download = function(methId, viewId, ind, callBack) {
	const params = this.getParams(methId, viewId);
	const parStr = this.getServConnector().queryParamsAsStr(params, true);
	const source = window.getApp().getServConnector().getScript() + "?" + parStr;

	fetch(source, { method: "GET" })
		.then((response) => {
			const contentType = (response.headers.get("content-type") || "").toLowerCase();

			if (contentType.includes("xml")) {
				return response.text().then((xmlText) => {
					const parser = new DOMParser();
					const xmlDocument = parser.parseFromString(xmlText, "application/xml");
					const resp = new ResponseXML(xmlDocument);
					const respModelId = window.getApp().SERV_RESPONSE_MODEL_ID;
					const m = resp.modelExists(respModelId)
						? new ModelServRespXML(resp.getModelData(respModelId))
						: null;

					if (m && m.result) {
						if (callBack) {
							callBack(m.result);
						}

						window.showError(m.descr, null, 10000);
					}

					return null;
				});
			}

			const contentDisposition = response.headers.get("Content-Disposition");
			let filename = "downloaded-file";

			if (contentDisposition) {
				let match = contentDisposition.match(/filename\*=(?:UTF-8'')?([^;]+)/i);

				if (match) {
					filename = decodeURIComponent(match[1]);
				} else {
					match = contentDisposition.match(/filename="(.+?)"/i);

					if (match) {
						filename = match[1];
					}
				}
			}

			return response.blob().then((blob) => ({ blob, filename }));
		})
		.then((fileData) => {
			if (!fileData) {
				return;
			}

			const url = URL.createObjectURL(fileData.blob);
			const a = document.createElement("a");

			a.href = url;
			a.download = fileData.filename;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);

			setTimeout(() => {
				URL.revokeObjectURL(url);
			}, 1000);

			if (callBack) {
				callBack(0);
			}
		})
		.catch((error) => {
			window.showError(error.message, null, 10000);
		});
};

ControllerObjServer.prototype.openHref = function(methId,viewId,winParams){
	var meth = this.getPublicMethod(methId);
	return window.getApp().getServConnector().openHref(this.getParams(methId,viewId),winParams);
}

ControllerObjServer.prototype.getResponse = function(){
	return this.m_resp;
}
