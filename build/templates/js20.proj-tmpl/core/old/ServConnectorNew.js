/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2016-2026
 
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
						CookieManager.set(
							"token",
							self.m_accessToken,{
								"expires":DateHelper.strtotime(m.getFieldValue("tokenExpires"))
							}
						);
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

ServConnector.prototype.execRequest = function(isGet, params, async, onReturn, retContentType, enctype, URLResource) {
	var self = this;
	var url = this.getHost() + (URLResource ? URLResource : this.getScript());
	var isCors = (typeof this.getCORS === "function")
		? (this.getCORS() === true)
		: ((typeof this.m_CORS === "function") ? (this.m_CORS() === true) : false);

	var sendParam = null;
	var bodyToSend = null;
	var finished = false;
	var retryNo = 0;

	if (isGet && params && !CommonHelper.isEmpty(params)) {
		url = url + "?" + this.queryParamsAsStr(params, true);
	}

	if (!isGet) {
		sendParam = this.preparePayload(params, enctype);
		bodyToSend = (sendParam && sendParam.__rawMultipart) ? sendParam.body : sendParam;
	}

	function finalize(result) {
		if (finished) {
			return;
		}
		finished = true;

		if (onReturn) {
			onReturn.call(
				self,
				result.error_n,
				result.error_s,
				result.resp,
				self.m_requestId,
				result.versError
			);
		}

		self.processRequestResult(
			result,
			isGet,
			params,
			async,
			onReturn,
			retContentType,
			enctype,
			URLResource,
		);
	}

	function tryRetry(status) {
		if (!self.shouldRetryRequest(isGet, status)) {
			return false;
		}

		retryNo++;

		setTimeout(function() {
			sendAttempt();
		}, self.getRetryDelayMs(retryNo));

		return true;
	}

	function makeXhr() {
		var xhr = isCors ? CommonHelper.createCORS() : CommonHelper.createXHR();

		if (async && self.m_timeoutMs > 0) {
			xhr.timeout = self.m_timeoutMs;
		}

		if (async && (retContentType === "arraybuffer" || retContentType === "blob")) {
			xhr.responseType = retContentType;
		}

		return xhr;
	}

	function sendAttempt() {
		if (finished) {
			return;
		}

		var xhr = makeXhr();

		xhr.ontimeout = function() {
			if (finished) {
				return;
			}

			if (tryRetry("timeout")) {
				return;
			}

			finalize({
				error_n: -1,
				error_s: self.ER_STATUS0,
				resp: undefined,
				versError: false,
				xhr: this,
				timeout: true,
				url
			});
		};

		xhr.onerror = function() {
			if (finished) {
				return;
			}

			finalize({
				error_n: -1,
				error_s: self.ER_STATUS0,
				resp: undefined,
				versError: false,
				xhr: this,
				timeout: false,
				url
			});
		};

		xhr.onabort = function() {
			if (finished) {
				return;
			}

			finalize({
				error_n: -1,
				error_s: "Request aborted",
				resp: undefined,
				versError: false,
				xhr: this,
				timeout: false,
				url
			});
		};

		xhr.onreadystatechange = function() {
			var result;
			var baseError;

			if (finished || xhr.readyState !== self.m_xhrStates.DONE) {
				return;
			}

			// status 0 is handled by ontimeout/onerror/onabort
			if (xhr.status === 0) {
				return;
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

			try {
				result = self.parseResponse(xhr, retContentType);
				result.xhr = xhr;
				result.url = url;
				result.timeout = false;
			}
			catch (e) {
				baseError = (xhr.status >= 200 && xhr.status < 300) ? 0 : xhr.status;

				result = {
					error_n: baseError || -1,
					error_s: e.message,
					resp: undefined,
					versError: false,
					xhr: this,
					timeout: false,
					url
				};
			}

			finalize(result);
		};

		xhr.open(isGet ? "GET" : "POST", url, isCors ? true : async);
		self.applyRequestHeaders(xhr, isGet, isCors, sendParam);
		xhr.send(isGet ? null : bodyToSend);
	}

	sendAttempt();

	return this.m_requestId;
};

ServConnector.prototype.preparePayload = function(params, enctype) {
	var finalEnctype = enctype || this.ENCTYPES.ENCODED;
	var parId;
	var fi;
	var key;
	var value;

	if (finalEnctype === this.ENCTYPES.ENCODED) {
		return this.queryParamsAsStr(params, true);
	}

	if (finalEnctype === this.ENCTYPES.MULTIPART) {
		if (typeof FormData !== "undefined") {
			var formData = new FormData();

			for (parId in params) {
				if (!Object.prototype.hasOwnProperty.call(params, parId)) {
					continue;
				}

				value = params[parId];

				if (value && typeof value === "object") {
					for (fi = 0; fi < value.length; fi++) {
						formData.append(parId + "[]", value[fi]);
					}
				}
				else {
					formData.append(parId, value);
				}
			}

			return formData;
		}
		else {
			var boundary = String(Math.random()).slice(2);
			var boundaryMiddle = "--" + boundary + "\r\n";
			var boundaryLast = "--" + boundary + "--\r\n";
			var parts = ["\r\n"];

			for (key in params) {
				if (!Object.prototype.hasOwnProperty.call(params, key)) {
					continue;
				}

				parts.push(
					'Content-Disposition: form-data; name="' + key + '"\r\n\r\n' + params[key] + '\r\n'
				);
			}

			return {
				__rawMultipart: true,
				body: parts.join(boundaryMiddle) + boundaryLast,
				contentType: "multipart/form-data; boundary=" + boundary
			};
		}
	}

	return null;
};

ServConnector.prototype.applyRequestHeaders = function(xhr, isGet, isCors, sendParam) {
	if (sendParam && sendParam.__rawMultipart) {
		xhr.setRequestHeader("Content-Type", sendParam.contentType);
	}
	else if (typeof sendParam === "string") {
		xhr.setRequestHeader("Content-Type", this.ENCTYPES.ENCODED);
	}

	if (!isCors && xhr.setRequestHeader) {
		xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
	}
	if (isGet){
		xhr.setRequestHeader(this.getLsnHeaderName(), this.getLsnPosition());
	}
};

ServConnector.prototype.parseResponse = function(xhr, retContentType) {
	var error_n = (xhr.status >= 200 && xhr.status < 300) ? 0 : xhr.status;
	var error_s = error_n ? xhr.statusText : undefined;
	var resp;
	var versError = false;
	var tr = xhr.getResponseHeader("content-type");

	if (retContentType === "arraybuffer" || retContentType === "blob") {
		resp = xhr.response;
	}
	else if (tr && tr.indexOf("xml") >= 0) {
		var respModelId;
		resp = new ResponseXML(xhr.responseXML);

		if (resp.modelExists("ModelServResponse")) {
			respModelId = "ModelServResponse";
		}
		else if (resp.modelExists("Response")) {
			respModelId = "Response";
		}

		if (respModelId) {
			var mx = new ModelServRespXML(resp.getModelData(respModelId));

			error_n = error_n ? error_n : mx.result;
			error_s = mx.descr;
			versError = (
				!error_n
				&& mx.app_version
				&& mx.app_version != window.getApp().getServVar("version")
				&& !window.getApp().getUpdateInstPostponed()
			);
		}
		else {
			resp = xhr.responseXML;
		}
	}
	else if (tr && tr.indexOf("json") >= 0) {
		var respObj = CommonHelper.unserialize(xhr.responseText);

		if (respObj.models) {
			resp = new ResponseJSON(respObj);

			var respModelIdJson = window.getApp().SERV_RESPONSE_MODEL_ID;

			if (resp.modelExists(respModelIdJson)) {
				var mj = new ModelServRespJSON(resp.getModelData(respModelIdJson));

				error_n = error_n ? error_n : mj.result;
				error_s = mj.descr;
				versError = (
					!error_n
					&& mj.app_version
					&& mj.app_version != window.getApp().getServVar("version")
					&& !window.getApp().getUpdateInstPostponed()
				);
			}
		}
		else {
			resp = respObj;
		}
	}
	else {
		if (retContentType !== undefined && tr && tr.indexOf(retContentType) < 0) {
			error_n = error_n ? error_n : -1;
			error_s = xhr.responseText;
		}
		else {
			resp = xhr.responseText;
		}
	}

	return {
		error_n: error_n,
		error_s: error_s,
		resp: resp,
		versError: versError
	};
};

ServConnector.prototype.processRequestResult = function(
	result,
	isGet,
	params,
	async,
	onReturn,
	retContentType,
	enctype,
	URLResource,
) {
	if (
		result.error_n === this.ERR_AUTH_NOT_LOGGED
		|| (result.error_n === this.ERR_AUTH_EXP && !this.m_refreshToken)
	) {
		throw new FatalException({
			code: result.error_n,
			message: result.error_s
		});
	}
	else if (result.error_n === this.ERR_AUTH_EXP) {
		this.refreshToken();

		this.execRequest(
			isGet,
			params,
			async,
			onReturn,
			retContentType,
			enctype,
			URLResource
		);
		return;
	}
	else if (result.error_n === this.ERR_SQL_SERVER || result.error_n === -1) {
		this.m_lastErrdbException = true;

		console.log('[ServConnector] request failed', {
			url: result.url,
			method: isGet ? 'GET' : 'POST',
			status: result.xhr ? result.xhr.status : null,
			readyState: result.xhr ? result.xhr.readyState : null,
			responseText: result.xhr && result.xhr.responseText
				? result.xhr.responseText.slice(0, 300)
				: null
		});

		if (!this.shouldSuppressConnectionError(result.xhr || { status: 0 }, result.timeout)) {
			throw new DbException({
				code: result.error_n,
				message: result.error_s
			});
		}
	}
	else if (result.versError) {
		throw new VersException();
	}

	if (result.error_n === 0 && this.m_lastErrdbException) {
		this.m_lastErrdbException = false;
		window.getApp().hideDbExceptionForm();
	}
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

//retry 
ServConnector.prototype.getRetryDelayMs = function(attemptNo){
	return Math.min(100 * Math.pow(2, attemptNo - 1), 5000);
};

ServConnector.prototype.shouldRetryRequest = function(isGet, status){
	return (isGet
			&& (
				status === "timeout" ||
				status === 0 ||
				status === 408 ||
				status === 425 ||
				status === 429 ||
				status === 502 ||
				status === 503 ||
				status === 504
			)
		);
};

//This function checks if there is an active service worker that controls the offline mode.
ServConnector.prototype.hasActiveServiceWorker = function() {
	return (
		typeof navigator !== 'undefined' &&
		'serviceWorker' in navigator &&
		!!navigator.serviceWorker.controller
	);
};

ServConnector.prototype.shouldSuppressConnectionError = function(xhr, timedOut) {
	var appOffline = false;

	try {
		appOffline = !!(window.getApp && window.getApp() && window.getApp().isOfflineMode && window.getApp().isOfflineMode());
	} catch (e) {}

	return (
		this.hasActiveServiceWorker() &&
		(
			timedOut ||
			(xhr && xhr.status === 0) ||
			!navigator.onLine ||
			appOffline
		)
	);
};

