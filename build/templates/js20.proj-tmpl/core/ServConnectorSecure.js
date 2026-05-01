/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2016
 
 * @class
 * @classdesc Basic Controller
 
 * @requires core/extend.js
 * @requires core/ServConnector.js 

 * @param {namespace} options
 * @param {string} options.host - Model identifier
 * @param {string} [options.script=this.DEF_SCRIPT]
 * @param {string} options.accessToken
 * @param {string} options.refreshToken
 * @param {boolean} [options.autoRefreshSession=false]  - TRUE if autorefresh is needed
 * @param {array} options.noTokenFuncs  - TRUE if autorefresh is needed
 */
function ServConnectorSecure(options){
	options = options || {};
	
	this.m_accessToken = options.accessToken;
	this.m_refreshToken = options.refreshToken;
	this.m_autoRefreshSession = (options.autoRefreshSession!=undefined)? options.autoRefreshSession:false;
	this.m_tokenParam = options.tokenParam ||this.TOK_PAR; 
	document.cookie = options.tokenParam."="+this.m_accessToken+"; expires="++"; path=/";
	 
	ServConnectorSecure.superclass.constructor.call(this,options);
}
extend(ServConnectorSecure,ServConnector);

ServConnectorSecure.prototype.REFRESH_FUNC = "login_refresh";
ServConnectorSecure.prototype.TOK_PAR = "token";
ServConnectorSecure.prototype.REFRESH_TOK_PAR = "refresh_token";

//Private
ServConnectorSecure.prototype.m_accessToken;
ServConnectorSecure.prototype.m_refreshToken;
ServConnectorSecure.prototype.m_autoRefreshSession;

ServConnectorSecure.prototype.openHref = function(params,winParams){
	params[this.m_tokenParam] = this.m_accessToken;
	ServConnectorSecure.superclass.openHref.call(this,params,winParams);
}

ServConnectorSecure.prototype.getAccessToken = function(){
	return this.m_accessToken;
}
ServConnectorSecure.prototype.getAccessTokenParam = function(){
	return this.m_tokenParam;
}

ServConnectorSecure.prototype.refreshSession = function(callBackOk,callBackFail){
	var req_opts = {
		"c":"User_Controller",
		"f":this.REFRESH_FUNC,
		"v":"ViewXML"
	};
	req_opts[this.m_tokenParam] = this.m_accessToken;	
	req_opts[this.REFRESH_TOK_PAR] = this.m_refreshToken;
	
	var self = this;
	this.sendRequest(true,
		req_opts,
		false,//sync!!!
		function(errorN,errorS,resp,requestId){
			if (errorN==0){
				var m = new ModelServAuthXML(resp.getModelData("Auth_Model"));
				self.m_accessToken = m.access_token;
				self.m_refreshToken = m.refresh_token;
				callBackOk();
			}
			else{
				//there is an error
				callBackFail(errorN,errorS,resp,requestId);
			}
		}
	);

}

/**
 *	принимает Get/Post запросы и проверяет ответ на ошибку 101 - сессия истекла
 *	
 *	если есть такая ошибка - отправляем запрос get на refresh с ключом для обновления сессии
 *	при удаче, повторяем первоначальный запрос
 * 	при ошибке - выходим на клиентскую функцию
 *	Если ошибки авторизации нет - выходим на клиентскую функцию
 */
ServConnectorSecure.prototype.sendRequest = function(isGet,params,async,onReturn,retContentType,enctype){
	/*
	if(!params[this.m_tokenParam]){
		params[this.m_tokenParam] = this.m_accessToken;
	}
	
	*/
		
	if (this.m_autoRefreshSession){
		/*
		var self = this;
		var orig_onReturn = onReturn;
		//измененная функция возврата, при истечении сессии посылаем запрос на продление
		//если сессия продлилась - отправляем оригинальный запрос еще раз
		//если не продлилась - исключение
		onReturn = function(errorN,errorS,resp,requestId,errorVersion){
			if(errorN==self.ERR_AUTH_EXP){
				self.refreshSession();//sync query!
				//resend initial query
				ServConnectorSecure.superclass.sendRequest.call(self,isGet,params,async,orig_onReturn,retContentType,enctype);
			}
			else{
				self.errorException(errorN,errorS,errorVersion);
			}
		}
		try{
			ServConnectorSecure.superclass.sendRequest.call(this,isGet,params,async,onReturn,retContentType,enctype);
		}
		catch(e){		
		}
		*/
		ServConnectorSecure.superclass.sendRequest.call(this,isGet,params,async,onReturn,retContentType,enctype);
	}
	else{
		//обычная обработка, если сессия истекла - исключение
		ServConnectorSecure.superclass.sendRequest.call(this,isGet,params,async,onReturn,retContentType,enctype);
	}
}

