/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2020
 
 * @class
 * @classdesc

 * @param {object} options
 * @param {string} options.appId 
 * @param {string} [options.host=this.DEF_HOST]
 * @param {int} [options.port=this.DEF_PORT]
 * @param {string} options.token
 * @param {string} options.tokenExpires
 
 * @param {function} options.onSetClientId     
 */
function AppSrv(options){
	options = options ||{};
	
	window.WebSocket = window.WebSocket || window.MozWebSocket;
	
	if (!window.WebSocket) {
		throw Error(this.NOT_SUPPOERTED);
	}
	
	/*if(navigator.cookieEnabled){
		CookieManager.set("token",options.token,{"expires":options.tokenExpires})
	}*/

	this.m_host = options.host || this.DEF_HOST;
	this.m_port = options.port || this.DEF_PORT;
//console.log("AppSrv options.host:"+options.host+", options.port="+options.port)
//console.log("AppSrv this.m_host:"+this.m_host+", this.m_port="+this.m_port)				
	this.m_appId = options.appId;
	this.m_token = options.token;
	this.m_tokenExpires = options.tokenExpires;
	
	if(Worker in window){
		var self = this;
		var myWorker = new Worker("DetectWakeup.js");
		myWorker.onmessage = function (ev) {
			if (ev && ev.data === 'wakeup') {
				self.notifyOnConnEvent("onWakeup");			
			}
		}
	}
}

AppSrv.prototype.DEF_HOST = "127.0.0.1";
AppSrv.prototype.DEF_PORT = "1337";

AppSrv.prototype.METH_STATUS = {
	"end":0
	,"progress":1
}

AppSrv.prototype.m_connection;

AppSrv.prototype.m_host;
AppSrv.prototype.m_port;

/**
	{events,onEvent,onOpen,onClose,onSubscribed}
 */
AppSrv.prototype.m_subscribeEvents;

/**
 * current active subscribtions
 * [eventId] = {groups: {groupId:callBack}, cnt:int}
 */
AppSrv.prototype.m_subscriptions;

//***********************************

AppSrv.prototype.getState = function(){
	return this.m_connection.readyState;
}

AppSrv.prototype.connActive = function(){
	return (this.m_connection&&this.m_connection.readyState==WebSocket.OPEN);
}


AppSrv.prototype.connect = function(){
	this.m_lastConnErrTime = undefined;
	this.m_doNotReconnect = false;
	this.do_connect();	
}

AppSrv.prototype.disconnect = function(doNotReconnect){
	if(this.connActive()){
		this.m_doNotReconnect = doNotReconnect;
		this.m_connection.close();
	}
	this.clear();
}

AppSrv.prototype.notifyOnConnEvent = function(conEvnt,par){
console.log("AppSrv.prototype.notifyOnConnEvent evnt="+conEvnt)
	var called = {};
	for(var ev_id in this.m_subscriptions){
		if(!this.m_subscriptions[ev_id]){
			continue;
		}
		var groups = this.m_subscriptions[ev_id].groups;
		for(gr_id in groups){
			if(!called[gr_id] && groups[gr_id][conEvnt] && typeof(groups[gr_id][conEvnt])==="function"){
				console.log("Calling m_subscriptions event ")
				groups[gr_id][conEvnt].call(this,par);
				called[gr_id] = true;
			}
		}
	}
	if(this.m_subscribeEvents && conEvnt=="onClose"){
		for(var ev_id in this.m_subscribeEvents){
			if(this.m_subscribeEvents[ev_id]&&this.m_subscribeEvents[ev_id][conEvnt]&&typeof(this.m_subscribeEvents[ev_id][conEvnt])==="function"){
				console.log("Calling m_subscribeEvents event ")
				this.m_subscribeEvents[ev_id][conEvnt].call(this,par);
			}
		}
	}
}

AppSrv.prototype.do_connect = function(){
	if (!this.shouldConnect()){
		return;
	}

	console.log("AppSrv.prototype.do_connect")
	if(this.m_connection && (this.m_connection.readyState===WebSocket.OPEN||this.m_connection.readyState===WebSocket.CONNECTING) ){
		return;
	}
	//alert(location.protocol)	
	var protocol = (location.protocol !== "https:")? "ws":"wss";
	var self = this;
	
	this.m_connection = new WebSocket(protocol+"://"+this.m_host+":"+this.m_port+"/"+this.m_appId + (this.m_token? "/"+this.m_token : "") );

	this.m_connection.onopen = function () {
		// connection is opened and ready to use
		console.log("this.m_connection.onopen")
		self.onOpen();
		self.notifyOnConnEvent("onOpen");		
	};

	this.m_connection.onerror = function (error) {
		// an error occurred when sending/receiving data
		console.log("WSConn.onerror error=",error)
		//console.log(error)
		self.notifyOnConnEvent("onError", error);
	};
		
	this.m_connection.onmessage = function (message) {
		self.onMessage(message);
	};						

	this.m_connection.onclose = function (message) {
		console.log("onclose message=", message)
		//console.log(message)
		
		self.notifyOnConnEvent("onClose", message);		
		
		if(message.code!=undefined && message.code>1000 && !self.m_doNotReconnect){
			self.do_connect();
		}
	};						
	
}

/**
 * @param {object} srvEvents 
 *	{array}events
 *		{string} events.id
 *		{function} events.onEvent
 *		{array} events.params  
 *	{function}onOpen
 *	{function}onClose
 *	{function}onEvent
 *	{function}onError
 */
AppSrv.prototype.subscribe = function(srvEvents,id){

	if(!id){
		//new unique id for event group
		id = CommonHelper.ID();
	}
	
	if(!this.m_connection || this.m_connection.readyState!==WebSocket.OPEN){
		//may be later
		this.m_subscribeEvents = this.m_subscribeEvents || {};
		this.m_subscribeEvents[id] = srvEvents;
		console.log("subscribe postponed")
		return id;
	}
	
	console.log("AppSrv.prototype.subscribe")	
	
	//send to server unique  events only!!!
	var events_srv = [];
	this.m_subscriptions = this.m_subscriptions || {};
	for(var i=0;i<srvEvents.events.length;i++){
		if (!srvEvents.events[i]){
			continue;
		}
		if(!this.m_subscriptions[srvEvents.events[i].id]){
			events_srv.push({"id":srvEvents.events[i].id});
			this.m_subscriptions[srvEvents.events[i].id] = {"groups":{},"cnt":0};
		}
		this.m_subscriptions[srvEvents.events[i].id].groups[id] = srvEvents;
		this.m_subscriptions[srvEvents.events[i].id].cnt++;		
	}
	
	if(events_srv.length){
		console.log("Events:",events_srv)
		//console.trace()
		this.send("Event.subscribe",{"events":events_srv});
		
		if(srvEvents.onSubscribed && typeof(srvEvents.onSubscribed)==="function"){
			console.log("Calling onSubscribed function")
			srvEvents.onSubscribed.call(this);
		}		
	}
	
	return id;
}

AppSrv.prototype.clear = function(){
	if(this.m_subscriptions){
		this.m_subscriptions = {};
	}
}

AppSrv.prototype.unsubscribe = function(id){

	console.log("AppSrv.prototype.unsubscribe")	
	if(this.m_subscribeEvents && this.m_subscribeEvents[id]){
		//postponed subscription
		this.m_subscribeEvents[id] = undefined;
		delete this.m_subscribeEvents[id];
		console.log("AppSrv.prototype.unsubscribe cleared postponed subscription")	
		
	}else if(this.m_connection.readyState!==WebSocket.OPEN){
		//may be later
		this.m_unsubscribeEvents = this.m_unsubscribeEvents || [];
		this.m_unsubscribeEvents.push(id);
		console.log("unsubscribe postponed")
		return;
	}

	if(this.m_subscriptions){
		//send to server only null-ref events
		var events_srv = [];
		for(var ev_id in this.m_subscriptions){
			if(this.m_subscriptions[ev_id].groups[id]){
				this.m_subscriptions[ev_id].groups[id] = undefined;
				delete this.m_subscriptions[ev_id].groups[id];
				this.m_subscriptions[ev_id].cnt--;
				if (!this.m_subscriptions[ev_id].cnt){
					events_srv.push({"id":ev_id});
					this.m_subscriptions[ev_id] = undefined;
					delete this.m_subscriptions[ev_id];
				}
			}
		}
		
		if(events_srv.length){
			this.send("Event.unsubscribe",{"events":events_srv});
		}
		
	}
}

AppSrv.prototype.onOpen = function(){
console.log("AppSrv.prototype.onOpen")

	this.m_lastConnErrTime = undefined;
	
	//reregister events
	if(this.m_subscriptions){
		console.log("Reregistering events!")
		var groups = {};
		var cnt = 0;
		for(var ev_id in this.m_subscriptions){
			for(gr_id in this.m_subscriptions[ev_id].groups){
				groups[gr_id] =
					groups[gr_id] ||
					{"events":[],
					"onEvent":this.m_subscriptions[ev_id].groups[gr_id].onEvent,
					"onOpen":this.m_subscriptions[ev_id].groups[gr_id].onOpen,
					"onClose":this.m_subscriptions[ev_id].groups[gr_id].onClose,
					"onError":this.m_subscriptions[ev_id].groups[gr_id].onError,
					"onSubscribed":this.m_subscriptions[ev_id].groups[gr_id].onSubscribed
					};
				groups[gr_id].events.push({"id":ev_id});
			}
			cnt++;					
		}
		if(cnt){
			this.m_subscriptions = {};
			for(var gr_id in groups){
				this.subscribe(
					groups[gr_id],
					gr_id
				);				
			}
		}
	}
				
	if(this.m_subscribeEvents){
		for(var ev_id in this.m_subscribeEvents){
			if(this.m_subscribeEvents[ev_id]){
				this.subscribe(this.m_subscribeEvents[ev_id],ev_id);
				this.m_subscribeEvents[ev_id] = undefined;
			}
		}
		delete this.m_subscribeEvents;
	}
	if(this.m_unsubscribeEvents){
		if(this.m_unsubscribeEvents[i]){
			for(var i=0;i<this.m_unsubscribeEvents.length;i++){
				this.unsubscribe(this.m_unsubscribeEvents[i]);
				this.m_unsubscribeEvents[i] = undefined;
			}
		}
		delete this.m_unsubscribeEvents;
		
	}
	
}

AppSrv.prototype.send = function(func, argv, queryId, viewId){
	var struct = {"func":func}
	if(argv){
		struct.argv = argv;
	}
	if(queryId){
		struct.query_id = queryId;
	}
	if(viewId){
		struct.view_id = viewId;
	}	
	this.m_connection.send(
		JSON.stringify(struct)
	);
}

/**
 * response structure:
 *	{"models":
 *		"_Model":{
 *			"id":"_Model" 	
 *			,"rows":[
 *				"fields":{
 *					"field_id1":1
 *					,"field_id2":"2"
 *					,"field_id3":"2020-01-01"
 *				}
 *			]
 *		}
 *	}
 */
AppSrv.prototype.onMessage = function(message){
	console.log("AppSrv.prototype.onMessage RawJson="+message.data)
	//same as in ServConnector
	
	//message.data can be json/html/plain text:
	if(!message.data || !message.data.length){
		return;
	}
	
	var resp; //response object ResponseJSON/ResponseXML/plain text
	var query_id, error_n, error_s, vers_error;
	var app = window.getApp();
	
	var resp_o;//unserialized json, Event can only come in json, so we use siplified approach to get Event_Model

	if(message.data[0]=="{" && message.data[message.data.length-1]=="}"
	|| message.data[0]=="[" && message.data[message.data.length-1]=="]"){

		resp_o = CommonHelper.unserialize(message.data);
		if(resp_o.models){
			resp = new ResponseJSON(resp_o);
			var resp_model_id = app.SERV_RESPONSE_MODEL_ID;
			if(resp.modelExists(resp_model_id)){
				var m = new ModelServRespJSON(resp.getModelData(resp_model_id));
				error_n = error_n? error_n:m.result;
				error_s = m.descr;
				vers_error = (!error_n && m.app_version && m.app_version != app.getServVar("version") && !app.getUpdateInstPostponed());
				query_id = m.query_id;
			}
		}
		else{
			//simplified version - pure JSON
			resp = resp_o;
		}
		
		
	}else if(message.data[0]=="<" && message.data[message.data.length-1]==">"){
		if(!window["ResponseXML"]){
			throw new Error("AppSrv: message.data is of type XML, but ResponseXML is not defined");
		}
		if(!window["DOMParser"]){
			throw new Error("AppSrv: message.data is of type XML, but DOMParser is not defined");
		}		
		var xml = (new DOMParser()).parseFromString(message.data,"text/xml")
		resp = new ResponseXML(xml);
		var resp_model_id;//two variants
		if (resp.modelExists("ModelServResponse")){
			resp_model_id = "ModelServResponse";
		}else if (resp.modelExists("Response")){
			resp_model_id = "Response";
		}
		if(resp_model_id){
			var m = new ModelServRespXML(resp.getModelData(resp_model_id));
			error_n = error_n? error_n:m.result;
			error_s = m.descr;
			vers_error = (!error_n && m.app_version && m.app_version!=app.getServVar("version") && !app.getUpdateInstPostponed());
			query_id = m.query_id;
		}else{
			//pure XML
			resp = xml.documentElement;
		}
		
	}else{
		//plain text
		resp = message.data;
	}
	
	if (error_n == ServConnector.prototype.ERR_AUTH_NOT_LOGGED
	|| error_n == ServConnector.prototype.ERR_AUTH
	|| (error_n==ServConnector.prototype.ERR_AUTH_EXP && !ServConnector.prototype.m_refreshToken) ){
		//fatal errors
		app.initPage();
		//this.disconnect(true);
		/*throw new FatalException({
			"code":error_n
			,"message":error_s
		});*/
	}
	else if(error_n == ServConnector.prototype.ERR_AUTH_EXP){
		//this.refreshToken();
		//resend same query
		//this.execRequest(isGet,params,async,onReturn,retContentType,enctype);
	}
	else if (error_n == ServConnector.prototype.ERR_SQL_SERVER){
		//fatal errors				
		throw new DbException({
			"code":error_n
			,"message":error_s
		});
	}
	else if (vers_error){
		throw new VersException();
	}

	//events
	var ev_model_id = app.EVENT_MODEL_ID;//!!!!"Event_Model";	
	if(resp_o
	&&resp_o.models
	&&resp_o.models[ev_model_id]
	&&resp_o.models[ev_model_id].rows
	&&resp_o.models[ev_model_id].rows.length
	&&resp_o.models[ev_model_id].rows[0].id){
		var ev_id = resp_o.models[ev_model_id].rows[0].id;
		var json = {
			"eventId":ev_id
			,"params":resp_o.models[ev_model_id].rows[0].params
		};
		var sep = ev_id.indexOf(".");
		if(sep){
			json.controllerId = json.eventId.substr(0,sep);
			json.methodId = json.eventId.substr(sep+1);
		}			
		//send event to all subscribed groups
		if(this.m_subscriptions[json.eventId] && this.m_subscriptions[json.eventId].groups){
			for(gr_id in this.m_subscriptions[json.eventId].groups){
				if(this.m_subscriptions[json.eventId].groups[gr_id].onEvent
				&&typeof(this.m_subscriptions[json.eventId].groups[gr_id].onEvent)==="function"){
					//calling function
					this.m_subscriptions[json.eventId].groups[gr_id].onEvent(json);				
				}
			}				
		}
	//dada models
	}else if(query_id
	&& this.m_subscriptions[query_id]
	&& this.m_subscriptions[query_id].groups
	&& this.m_subscriptions[query_id].groups.callBack){
		//data response
		this.m_subscriptions[query_id].groups.callBack(error_n, error_s, resp, query_id);
	}
}


/**
 * @argv{string} WebSocket structure: {"func":"Controller.meth","argv":{key:value},"tmpl":""}
 * callBack: errCode,errStr,resp,requestId
 */
AppSrv.prototype.runPublicMethod = function(func, argv, viewId, progressCallBack, callBack){	
	//callback event on unique id
	var d = new Date();
	var query_id = func+"_"+d.getHours().toString()+d.getMinutes().toString()+d.getMilliseconds().toString();
//console.time('request_'+query_id)
	this.m_subscriptions[query_id] = {"groups":{
		"callBack": (function(self, progressCallBack, callBack){
			return function(errCode, errStr, resp, queryId){			
				self.m_subscriptions[queryId] = undefined;
				delete self.m_subscriptions[queryId];
				if(callBack){
					callBack(errCode, errStr, resp, queryId)
				}
//console.timeEnd('request_'+queryId)		
				/*
				if(!respObject.status || respObject.status==self.METH_STATUS.end){
					self.m_subscriptions[queryId] = undefined;
					if(callBack){
						callBack(errCode, errStr, json,queryId)
					}
					
				}else if(respObject.status && respObject.status==self.METH_STATUS.progress && progressCallBack){
					//new format
					progressCallBack(respObject.models);
				}
				*/
			}
		})(this, progressCallBack, callBack)
	},"cnt":0};	
	
	this.send(func, argv, query_id, viewId);
}

//This function checks if there is an active service worker that controls the offline mode.
AppSrv.prototype.shouldConnect = function(){	
	const hasSW = (
		typeof navigator !== 'undefined' &&
		'serviceWorker' in navigator &&
		!!navigator.serviceWorker.controller
	);
	return !hasSW || navigator.onLine;
};
