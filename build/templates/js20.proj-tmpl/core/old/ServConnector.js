/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2016
 
 * @class
 * @classdesc http connector

 * @param {namespace} options
 * @param {string} options.host
 * @param {string} [options.script=this.DEF_SCRIPT]
 * @param {boolean} [options.CORS=false] Cross origin resource sharing for Cross domain queries
 */
function ServConnector(options){
	options = options ||{};

	this.setHost(options.host || "");
	this.setScript(options.script || this.DEF_SCRIPT);
	this.setCORS((options.CORS!==undefined)? options.CORS:false);
	
	if(options.token){
		this.m_accessToken = options.token;
		if(navigator.cookieEnabled && CookieManager.get("token")!=this.m_accessToken){
			CookieManager.set("token",this.m_accessToken,{"expires":options.tokenExpires});
		}		
		if(options.tokenr){
			this.m_refreshToken = options.tokenr;			
		}
	}
	
	this.m_xhrStates = {		
		UNSENT:0, // начальное состояние
		OPENED:1, // вызван open
		HEADERS_RECEIVED:2, // получены заголовки
		LOADING:3, // загружается тело (получен очередной пакет данных)
		DONE:4 // запрос завершён				
	};
		
}

/* constants */
ServConnector.prototype.DEF_SCRIPT = "";// "index.php";

ServConnector.prototype.ERR_AUTH = 100;
ServConnector.prototype.ERR_AUTH_NOT_LOGGED = 102;
ServConnector.prototype.ERR_AUTH_EXP=101;
ServConnector.prototype.ERR_SQL_SERVER=105;
ServConnector.prototype.ERR_VERSION=107;

ServConnector.prototype.ENCTYPES = {
	ENCODED:"application/x-www-form-urlencoded",
	MULTIPART:"multipart/form-data",
	TEXT:"text-plain"
};


/* private members*/
ServConnector.prototype.m_xhrStates;
ServConnector.prototype.m_CORS;
ServConnector.prototype.m_host;
ServConnector.prototype.m_script;
ServConnector.prototype.m_port;
ServConnector.prototype.m_quit;

ServConnector.prototype.m_accessToken;
ServConnector.prototype.m_refreshToken;

/* private fucntions*/

/* public functions*/

/**
 * @public
 * @returns {boolean}
 */
ServConnector.prototype.getCORS = function(){
	return this.m_CORS;
}
/**
 * @public
 */
ServConnector.prototype.setCORS = function(v){
	this.m_CORS = v;
}

/**
 * @public
 * @returns {string} 
 */
ServConnector.prototype.getHost = function(){
	return this.m_host;
}
/**
 * @public
 * @param {string} host
 */
ServConnector.prototype.setHost = function(host){
	this.m_host = host;
}

/**
 * @public
 * @returns {string} 
 */
ServConnector.prototype.getScript = function(){
	return this.m_script;
}
/**
 * @public
 * @param {string} script
 */
ServConnector.prototype.setScript = function(script){
	this.m_script = script;
}

/**
 * @public
 * @returns {string}
 * @param {Object} params 
 */
ServConnector.prototype.queryParamsAsStr = function(params,encode){
	var param_str = "";
	for (var par_id in params){
		param_str+= (param_str=="")? "":"&";
		param_str+= par_id+"=";
		param_str+= (encode)? encodeURIComponent(params[par_id]) : params[par_id];
	}
	return param_str;
}

ServConnector.prototype.refreshToken = function(){
	var self = this;
	this.execRequest(
		true,
		{
		"c":"User_Controller",
		"f":"login_refresh",
		"token":this.m_accessToken,
		"refresh_token":this.m_refreshToken,
		"v":"ViewXML"
		},
		false,
		function(ref_e_n,ref_e_s,ref_resp){
			if(!ref_e_n){
				var m = ref_resp.getModel("Auth");//_Model
				if (m.getNextRow()){
					self.m_accessToken = m.getFieldValue("access_token");
					self.m_refreshToken = m.getFieldValue("refresh_token");
					if(navigator.cookieEnabled){
						CookieManager.set("token",self.m_accessToken,{"expires":DateHelper.strtotime(m.getFieldValue("tokenExpires"))});
					}									
				}
			}
		}
	);
}	

/**
 * @public
 * @param {boolean} isGet
 * @param {namespace} params
 * @param {boolean} [async=true]
 * @param {function} onReturn
 * @param {function} retContentType - expected return type in content-type
 * @param {string} [enctype=ENCODED] - post form encoding ENCODED || MULTIPART || TEXT
 */
ServConnector.prototype.sendRequest = function(isGet,params,async,onReturn,retContentType,enctype){
	this.m_requestId = CommonHelper.uniqid();

	async = (async==undefined)? true : async;
		
	if(this.m_accessToken && !navigator.cookieEnabled){
		params["token"] = this.m_accessToken;
	}
	if(this.m_accessToken && this.m_refreshToken && navigator.cookieEnabled && CookieManager.get("token")==undefined){
		//cookie expired
		this.refreshToken();
	}

	return this.execRequest(isGet,params,async,onReturn,retContentType,enctype);
}

ServConnector.prototype.execRequest = function(isGet,params,async,onReturn,retContentType,enctype,URLResource){
	
	var url = this.getHost() + (URLResource? URLResource:this.getScript());
	var send_param;
	
	var xhr = (this.m_CORS===true)? CommonHelper.createCORS() : CommonHelper.createXHR();
	var self = this;
	
	var stat0_tries = 10;
	var stat0_delay = 100; 		
//console.log('request_http', params)	
	xhr.onreadystatechange = function(){
		if (xhr.readyState == self.m_xhrStates.HEADERS_RECEIVED){
			//console.log("Status:"+xhr.status)
		}
		else if (xhr.readyState == self.m_xhrStates.DONE){		
			//console.log("ServConnector.prototype.onStateChange DONE");
			var error_n;
			var error_s;
			var resp;

			if (xhr.status==0){
				stat0_tries--;
				if(stat0_tries){
					setTimeout(function(){
						xhr.open(isGet? "GET":"POST", url, (self.getCORS())? true:async);
						xhr.send(send_param);
					}, stat0_delay);
					stat0_delay = stat0_delay*2;
					return;
				}
				error_s = self.ER_STATUS0;
				error_n = -1;
			}
			else{
				error_n = (xhr.status>=200 && xhr.status<300)? 0 : xhr.status;
				//console.log("xhr.status="+xhr.status)
				if (error_n!=0){				
					//in case of no content
					error_s = xhr.statusText;
					
				}
				var vers_error = false;
				//OK
				try{					
					var tr = xhr.getResponseHeader("content-type");
					//console.log("respType="+tr)
					if (retContentType=="arraybuffer"||retContentType=="blob"){
						//binary
						resp = xhr.response;
					}
					else if (tr && tr.indexOf("xml")>=0){
						//xml
						var resp_model_id;//two variants
						resp = new ResponseXML(xhr.responseXML);
						if (resp.modelExists("ModelServResponse")){
							resp_model_id = "ModelServResponse";
						}else if (resp.modelExists("Response")){
							resp_model_id = "Response";
						}
						if(resp_model_id){
							//No Error!
							//simplified version pure XML
							//throw new Error(self.ER_NO_RESP_MODEL);
							var m = new ModelServRespXML(resp.getModelData(resp_model_id));
							error_n = error_n? error_n:m.result;
							error_s = m.descr;
							vers_error = (!error_n && m.app_version && m.app_version!=window.getApp().getServVar("version") && !window.getApp().getUpdateInstPostponed());
						}else{
							resp = xhr.responseXML;
						}
					}
					else if (tr && tr.indexOf("json")>=0){
						//json
						var resp_o = CommonHelper.unserialize(xhr.responseText);
						if(resp_o.models){
							resp = new ResponseJSON(resp_o);
							var resp_model_id = window.getApp().SERV_RESPONSE_MODEL_ID;
							if(resp.modelExists(resp_model_id)){
								var m = new ModelServRespJSON(resp.getModelData(resp_model_id));
								error_n = error_n? error_n:m.result;
								error_s = m.descr;
								vers_error = (!error_n && m.app_version && m.app_version!=window.getApp().getServVar("version") && !window.getApp().getUpdateInstPostponed());
							}
						}
						else{
							//simplified version - pure JSON
							resp = resp_o;
						}
					}
					else{
						//text/html
						if (retContentType!=undefined && tr && tr.indexOf(retContentType)<0){

							//but something else has been requested 
							error_n = error_n? error_n:-1;
							error_s = xhr.responseText;
						}
						else{	
							resp = xhr.responseText;
						}
					}
				}
				catch(e){
					error_n = error_n? error_n:-1;
					error_s = e.message;
				}
			}
//console.timeEnd('request_http')				
			if (onReturn){
				onReturn.call(self,error_n,error_s,resp,self.m_requestId,vers_error);
			}
						
			if (error_n==self.ERR_AUTH_NOT_LOGGED || (error_n==self.ERR_AUTH_EXP && !self.m_refreshToken) ){
				//fatal errors
				throw new FatalException({
					"code":error_n
					,"message":error_s
				});
			}
			else if(error_n==self.ERR_AUTH_EXP){
				self.refreshToken();
				//resend same query
				self.execRequest(isGet,params,async,onReturn,retContentType,enctype);
				return;
			}
			else if (error_n==self.ERR_SQL_SERVER){
				//fatal errors
				self.m_lastErrdbException = true;
				throw new DbException({
					"code":error_n
					,"message":error_s
				});
			}
			else if (vers_error){
				throw new VersException();
			}
			
			if(error_n == 0 && self.m_lastErrdbException){
				//hide exception
				self.m_lastErrdbException = false;
				window.getApp().hideDbExceptionForm();
			}
		}		
	}
	
	
	if (isGet){
		//GET
		if (params && !CommonHelper.isEmpty(params)){
			url = url +"?"+ this.queryParamsAsStr(params,true);
		}
					
		send_param = null;
	}
	
	xhr.open(isGet? "GET":"POST", url, (this.getCORS())? true:async);
	
	if(!isGet){
		enctype = enctype || this.ENCTYPES.ENCODED;				
		if (enctype==this.ENCTYPES.ENCODED){
			xhr.setRequestHeader("Content-Type", enctype);
			send_param = this.queryParamsAsStr(params,true);
		}
		if (enctype==this.ENCTYPES.MULTIPART){
			if (typeof FormData !== 'undefined'){
				//xhr.setRequestHeader("Content-Type", enctype);+boundary Let browser handle it!
				send_param = new FormData();
				for (var par_id in params){
					if (params[par_id] && typeof params[par_id]=="object"){						
						//files
						for (var fi=0;fi<params[par_id].length;fi++){
							send_param.append(par_id+"[]",params[par_id][fi]);
						}
					}
					else{
						send_param.append(par_id,params[par_id]);
					}
				}
			}
			else{
				//no FormData
				var boundary = String(Math.random()).slice(2);
				var boundaryMiddle = '--' + boundary + '\r\n';
				var boundaryLast = '--' + boundary + '--\r\n';
				send_param = ['\r\n'];
				for (var key in params) {
					send_param.push('Content-Disposition: form-data; name="' + key + '"\r\n\r\n' + params[key] + '\r\n');
				}
				send_param = send_param.join(boundaryMiddle) + boundaryLast;
				xhr.setRequestHeader('Content-Type', 'multipart/form-data; boundary=' + boundary);				
			}
		}
	}
	if (!this.getCORS && xhr.setRequestHeader){
		//does not work with CORS???
		xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
	}
	
	if (async && (retContentType=="arraybuffer"||retContentType=="blob")){
		xhr.responseType = retContentType;
	}
	xhr.send(send_param);	
	
	return this.m_requestId;
}

/* in case of Post is a structure of parameters!*/
ServConnector.prototype.sendPost = function(params,async,onReturn,retContentType,enctype){	
//console.log("ServConnector.prototype.sendPost enctype="+enctype)
	if (this.m_quit)return;
	return this.sendRequest(false,params,async,onReturn,retContentType,enctype);
}
ServConnector.prototype.sendGet = function(params,async,onReturn,retContentType){
	if (this.m_quit)return;
	return this.sendRequest(true,params,async,onReturn,retContentType);
}
ServConnector.prototype.openHref = function(params,winParams,winName){
	if (this.m_quit)return;
	return window.open(
		this.getHost() + this.getScript() +"?"+ this.queryParamsAsStr(params,true),
		winName? winName:"_blank",
		winParams? winParams:"location=0,menubar=0,status=0,titlebar=0"
	); 
}
ServConnector.prototype.quit = function(){
	this.m_quit = true;
	if(this.m_accessToken && navigator.cookieEnabled){
		CookieManager.del("token");
	}		
}

ServConnector.prototype.getAccessToken = function(){
	return this.m_accessToken;
}

ServConnector.prototype.getPublicKey = function(){
	var p = this.m_accessToken.indexOf(":");
	if(p>=0){
		return this.m_accessToken.substring(0,p);
	}
}


