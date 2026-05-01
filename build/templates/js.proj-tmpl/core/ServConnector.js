/* Copyright (c) 2012 
	Andrey Mikhalevich, Katren ltd.
*/
/*	
	ServConnector class
	Connects client with server
*/

/** Requirements
 * @requires common/functions.js
 * @requires core/ServResponse.js 
*/


/*
	Constructor
	host String - host Name
*/
function ServConnector(host,script){
	this.setHost(host);
	this.setScript(script || this.DEF_SCRIPT);
}
/* constants */
ServConnector.prototype.DEF_SCRIPT='index.php';
ServConnector.prototype.ER_NO_RET_FUNC='Return function is not defined.';

ServConnector.prototype.ENCTYPES = {
	ENCODED:"application/x-www-form-urlencoded",
	MULTIPART:"multipart/form-data",
	TEXT:"text-plain"
};

/* private members*/
ServConnector.prototype.m_host;
ServConnector.prototype.m_script;
ServConnector.prototype.m_http;

/* private fucntions*/

/* public functions*/
ServConnector.prototype.getHost = function(){
	return this.m_host;
}
ServConnector.prototype.setHost = function(host){
	this.m_host = host;
}
ServConnector.prototype.getScript = function(){
	return this.m_script;
}
ServConnector.prototype.setScript = function(script){
	this.m_script = script;
}
/**
 * @public
 * @returns {string}
 * @param {Object} params 
 */
ServConnector.prototype.queryParamsAsStr = function(params,encode){
	var paramStr = "";
	for (var par_id in params){
		paramStr+= (paramStr=="")? "":"&";
		paramStr+= par_id+"=";
		paramStr+= (encode)? encodeURIComponent(params[par_id]) : params[par_id];
	}
	return paramStr;
}

ServConnector.prototype.sendRequest = function(isGet,paramStr,async,onReturn,retContext,xmlResponse,enctype){
	xmlResponse = (xmlResponse==undefined)? true:xmlResponse;
	var request_id = uuid();
	async = (async==undefined)? true : async;
	if (onReturn==undefined){
		throw new Error(this.ER_NO_RET_FUNC);
	}
	//console.log(paramStr);
	//alert("ServConnector params="+paramStr);
	
	var self = this;
	this.m_http = createRequestObject();	
	
	var ready_func =
	function(){
		if (self.m_http.readyState == 4){
			var status = self.m_http.status;
			var error_n = (status>=200 && status<300)? 0:status;
			var error_s;
			var resp;
			
			if (error_n==0){
				//OK
				try{
					//alert("responseText="+self.m_http.responseText);
					if (xmlResponse){
						resp = new ServResponse();
						resp.parse(self.m_http.responseXML);
						error_n = resp.getRespResult();
						if (error_n!=0){
							error_s=resp.getRespDescr();
						}
					}
					else{
						resp = self.m_http.responseText;
						//alert(resp);
					}
				}
				catch(e){
					error_n = -1;
					error_s = e.message;
				}
			}
			else{
				error_s=self.m_http.statusText;
			}
			onReturn.call(retContext,
					error_n,error_s,resp,request_id);
		}	
	};
	
	if (async){
		this.m_http.onreadystatechange = ready_func;
	}
	
	var url = this.getHost() + this.getScript();
	var send_param = null;
	if (isGet){
		//GET		
		if (paramStr&&paramStr.length)				
			url = url +"?"+ paramStr;
			//this.queryParamsAsStr(paramStr,true);
		
	}
	
	this.m_http.open(isGet? "GET":"POST", url, async);
	
	if(!isGet){
		enctype = enctype || this.ENCTYPES.ENCODED;		
		if (enctype==this.ENCTYPES.ENCODED){
			this.m_http.setRequestHeader("Content-Type", enctype);
			//encoded!!!
			send_param = this.queryParamsAsStr(paramStr,false);
			
		}else if (enctype==this.ENCTYPES.MULTIPART){
			if (typeof FormData !== 'undefined'){
				send_param = new FormData();
				for (var par_id in paramStr){
					if (paramStr[par_id] && typeof paramStr[par_id]=="object"){						
						//files
						for (var fi=0;fi<paramStr[par_id].length;fi++){
							send_param.append(par_id+"[]",paramStr[par_id][fi]);
						}
					}
					else{
						send_param.append(par_id,paramStr[par_id]);
					}
				}
			}
			else{
				//no FormData
				var boundary = String(Math.random()).slice(2);
				var boundaryMiddle = '--' + boundary + '\r\n';
				var boundaryLast = '--' + boundary + '--\r\n';
				send_param = ['\r\n'];
				for (var key in paramStr) {
					send_param.push('Content-Disposition: form-data; name="' + key + '"\r\n\r\n' + paramStr[key] + '\r\n');
				}
				send_param = send_param.join(boundaryMiddle) + boundaryLast;
				this.m_http.setRequestHeader('Content-Type', 'multipart/form-data; boundary=' + boundary);				
			}
		}		
	
		//orig
		//send_param = this.queryParamsAsStr(paramStr,false);
		//this.m_http.open("POST",url,async);
		//this.m_http.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	}
	this.m_http.send(send_param);
	
	if (!async){
		ready_func.call(this);
	}	
	
	return request_id;
}
/* in case of Post is a structure of parameters!*/
ServConnector.prototype.sendPost = function(paramStr,async,onReturn,retContext,xmlResponse,enctype){
	return this.sendRequest(false,paramStr,async,onReturn,retContext,xmlResponse,enctype);
}
ServConnector.prototype.sendGet = function(paramStr,async,onReturn,retContext,xmlResponse,enctype){
	return this.sendRequest(true,paramStr,async,onReturn,retContext,xmlResponse,enctype);
}

ServConnector.prototype.openHref = function(params,winParams){
	window.open(
		this.getHost() + this.getScript() +"?"+ this.queryParamsAsStr(params,true),
		"_blank",
		winParams? winParams:"location=0,menubar=0,status=0,titlebar=0"
	); 
}

