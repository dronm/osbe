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
		
	this.m_lsnHeaderName = options.lsnHeaderName || "X-LSN-Position";
	this.m_lsnStorageKey = options.lsnStorageKey || "serv_connector_lsn_position";
	this.m_lsnPosition = null;

	this.m_timeoutMs = options.timeoutMs || 15000;

	try{
		if (options.lsnPosition){
			this.m_lsnPosition = options.lsnPosition;
		}
		else if (typeof localStorage !== "undefined"){
			this.m_lsnPosition = localStorage.getItem(this.m_lsnStorageKey) || null;
		}
	}
	catch(e){
		this.m_lsnPosition = null;
	}
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

ServConnector.prototype.m_lsnPosition;
ServConnector.prototype.m_lsnStorageKey;
ServConnector.prototype.m_lsnHeaderName;

ServConnector.prototype.m_retry;
ServConnector.prototype.m_timeoutMs;
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
	var self = this;
	var requestId = this.m_requestId;
	var url = this.getHost() + (URLResource ? URLResource : this.getScript());
	var send_param = null;
	var stat0_tries = 10;
	var stat0_delay = 100;
	var authRefreshTried = false;

	async = (async == undefined) ? true : async;

	if (isGet){
		if (params && !CommonHelper.isEmpty(params)){
			url = url + "?" + this.queryParamsAsStr(params, true);
		}
		send_param = null;
	}
	else{
		enctype = enctype || this.ENCTYPES.ENCODED;

		if (enctype == this.ENCTYPES.ENCODED){
			send_param = this.queryParamsAsStr(params, true);
		}
		else if (enctype == this.ENCTYPES.MULTIPART){
			if (typeof FormData !== "undefined"){
				send_param = new FormData();
				for (var par_id in params){
					if (params[par_id] && typeof params[par_id] == "object"){
						for (var fi = 0; fi < params[par_id].length; fi++){
							send_param.append(par_id + "[]", params[par_id][fi]);
						}
					}
					else{
						send_param.append(par_id, params[par_id]);
					}
				}
			}
			else{
				var boundary = String(Math.random()).slice(2);
				var boundaryMiddle = "--" + boundary + "\r\n";
				var boundaryLast = "--" + boundary + "--\r\n";

				send_param = ["\r\n"];
				for (var key in params){
					send_param.push(
						'Content-Disposition: form-data; name="' + key + '"\r\n\r\n' + params[key] + "\r\n"
					);
				}
				send_param = send_param.join(boundaryMiddle) + boundaryLast;
			}
		}
	}

	var finishRequest = function(error_n,error_s,resp,vers_error){
		if (onReturn){
			onReturn.call(self, error_n, error_s, resp, requestId, vers_error);
		}

		if (error_n == self.ERR_AUTH_NOT_LOGGED || (error_n == self.ERR_AUTH_EXP && !self.m_refreshToken)){
			throw new FatalException({
				"code": error_n,
				"message": error_s
			});
		}
		else if (error_n == self.ERR_AUTH_EXP){
			if (authRefreshTried){
				throw new FatalException({
					"code": error_n,
					"message": error_s
				});
			}

			authRefreshTried = true;

			self.execRequest(
				true,
				{
					"c": "User_Controller",
					"f": "login_refresh",
					"token": self.m_accessToken,
					"refresh_token": self.m_refreshToken,
					"v": "ViewXML"
				},
				false,
				function(ref_e_n,ref_e_s,ref_resp){
					if (ref_e_n){
						throw new FatalException({
							"code": ref_e_n,
							"message": ref_e_s
						});
					}

					var m = ref_resp.getModel("Auth");
					if (m.getNextRow()){
						self.m_accessToken = m.getFieldValue("access_token");
						self.m_refreshToken = m.getFieldValue("refresh_token");

						if (navigator.cookieEnabled){
							CookieManager.set(
								"token",
								self.m_accessToken,
								{"expires": DateHelper.strtotime(m.getFieldValue("tokenExpires"))}
							);
						}
					}

					runRequest();
				}
			);
			return;
		}
		else if (error_n == self.ERR_SQL_SERVER){
			self.m_lastErrdbException = true;
			throw new DbException({
				"code": error_n,
				"message": error_s
			});
		}
		else if (vers_error){
			throw new VersException();
		}

		if (error_n == 0 && self.m_lastErrdbException){
			self.m_lastErrdbException = false;
			window.getApp().hideDbExceptionForm();
		}
	};

	var runRequest = function(){
		var xhr = (self.m_CORS === true) ? CommonHelper.createCORS() : CommonHelper.createXHR();
		var completed = false;

		var retryStatus0 = function(){
			stat0_tries--;
			if (stat0_tries > 0){
				var delay = stat0_delay;
				stat0_delay = stat0_delay * 2;

				setTimeout(function(){
					runRequest();
				}, delay);
				return true;
			}
			return false;
		};

		var completeOnce = function(error_n,error_s,resp,vers_error){
			if (completed){
				return;
			}
			completed = true;
			finishRequest(error_n, error_s, resp, vers_error);
		};

		xhr.onreadystatechange = function(){
			if (xhr.readyState == self.m_xhrStates.HEADERS_RECEIVED){
				return;
			}

			if (xhr.readyState != self.m_xhrStates.DONE){
				return;
			}

			var error_n = 0;
			var error_s = "";
			var resp = null;
			var vers_error = false;

			if (xhr.status == 0){
				if (retryStatus0()){
					return;
				}

				error_n = -1;
				error_s = self.ER_STATUS0;
				completeOnce(error_n, error_s, resp, vers_error);
				return;
			}

			error_n = (xhr.status >= 200 && xhr.status < 300) ? 0 : xhr.status;

			if (error_n != 0){
				error_s = xhr.statusText;
			}

			try {
				var responseLsn = xhr.getResponseHeader(self.getLsnHeaderName());
				if (responseLsn) {
					self.setLsnPosition(responseLsn);
				}
			}
			catch (e) {
				console.log("can not retrieve lsn header");
			}

			try{
				var tr = xhr.getResponseHeader("content-type");

				if (retContentType == "arraybuffer" || retContentType == "blob"){
					resp = xhr.response;
				}
				else if (tr && tr.indexOf("xml") >= 0){
					var resp_model_id;

					resp = new ResponseXML(xhr.responseXML);

					if (resp.modelExists("ModelServResponse")){
						resp_model_id = "ModelServResponse";
					}
					else if (resp.modelExists("Response")){
						resp_model_id = "Response";
					}

					if (resp_model_id){
						var m = new ModelServRespXML(resp.getModelData(resp_model_id));
						error_n = error_n ? error_n : m.result;
						error_s = m.descr;
						vers_error = (
							!error_n &&
							m.app_version &&
							m.app_version != window.getApp().getServVar("version") &&
							!window.getApp().getUpdateInstPostponed()
						);
					}
					else{
						resp = xhr.responseXML;
					}
				}
				else if (tr && tr.indexOf("json") >= 0){
					var resp_o = CommonHelper.unserialize(xhr.responseText);

					if (resp_o.models){
						resp = new ResponseJSON(resp_o);

						var json_resp_model_id = window.getApp().SERV_RESPONSE_MODEL_ID;
						if (resp.modelExists(json_resp_model_id)){
							var jm = new ModelServRespJSON(resp.getModelData(json_resp_model_id));
							error_n = error_n ? error_n : jm.result;
							error_s = jm.descr;
							vers_error = (
								!error_n &&
								jm.app_version &&
								jm.app_version != window.getApp().getServVar("version") &&
								!window.getApp().getUpdateInstPostponed()
							);
						}
					}
					else{
						resp = resp_o;
					}
				}
				else{
					if (retContentType != undefined && tr && tr.indexOf(retContentType) < 0){
						error_n = error_n ? error_n : -1;
						error_s = xhr.responseText;
					}
					else{
						resp = xhr.responseText;
					}
				}
			}
			catch(e){
				error_n = error_n ? error_n : -1;
				error_s = e.message;
			}

			completeOnce(error_n, error_s, resp, vers_error);
		};

		xhr.onerror = function(){
			if (completed){
				return;
			}

			if (retryStatus0()){
				return;
			}

			completeOnce(-1, self.ER_STATUS0, null, false);
		};

		xhr.onabort = function(){
			if (completed){
				return;
			}
			completeOnce(-1, self.ER_STATUS0, null, false);
		};

		xhr.ontimeout = function(){
			if (completed){
				return;
			}

			if (isGet && retryStatus0()){
				return;
			}

			completeOnce(-1, self.ER_STATUS0, null, false);
		};

		xhr.open(isGet ? "GET" : "POST", url, self.getCORS() ? true : async);

		if (!isGet){
			if (enctype == self.ENCTYPES.ENCODED){
				xhr.setRequestHeader("Content-Type", enctype);
			}
			else if (enctype == self.ENCTYPES.MULTIPART && typeof FormData === "undefined"){
				var boundaryMatch = /--([^\r\n]+)/.exec(send_param);
				if (boundaryMatch){
					xhr.setRequestHeader("Content-Type", "multipart/form-data; boundary=" + boundaryMatch[1]);
				}
			}
		}

		if (!self.getCORS() && xhr.setRequestHeader){
			xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
		}

		if (isGet){
			xhr.setRequestHeader(self.getLsnHeaderName(), self.getLsnPosition());
		}

		if (async && (retContentType == "arraybuffer" || retContentType == "blob")){
			xhr.responseType = retContentType;
		}

		xhr.send(send_param);
	};

	runRequest();

	return requestId;
};

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

//lsn related functions
ServConnector.prototype.getLsnHeaderName = function(){
	return this.m_lsnHeaderName;
};

ServConnector.prototype.getLsnPosition = function(){
	return this.m_lsnPosition;
};

ServConnector.prototype.setLsnPosition = function(lsn){
	if (!lsn){
		return;
	}

	this.m_lsnPosition = lsn;
	console.log("lsn position set to:"+this.m_lsnPosition);

	try{
		if (typeof localStorage !== "undefined"){
			localStorage.setItem(this.m_lsnStorageKey, lsn);
		}
	}
	catch(e){}
};

ServConnector.prototype.clearLsnPosition = function(){
	this.m_lsnPosition = null;

	try{
		if (typeof localStorage !== "undefined"){
			localStorage.removeItem(this.m_lsnStorageKey);
		}
	}
	catch(e){}
};


