/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2020
 
 * @class
 * @classdesc

 * @param {object} options
 * @param {string} options.appId 
 * @param {string} [options.protocol=this.DEF_PROTOCOL]
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
	
	this.m_protocol = options.protocol || this.DEF_PROTOCOL;
	this.m_host = options.host || this.DEF_HOST;
	this.m_port = options.port || this.DEF_PORT;
	
	this.m_appId = options.appId;
	this.m_token = options.token;
	this.m_tokenExpires = options.tokenExpires;
	
	this.m_onSetClientId = options.onSetClientId;
}

AppSrv.prototype.CON_TRY_WAIT_FACTOR = 2000;
AppSrv.prototype.CON_TRY_WAIT_MAX = 60000;
AppSrv.prototype.CHECK_INTERVAL = 10000;

AppSrv.prototype.MES_DEALY = 5000;

AppSrv.prototype.DEF_PROTOCOL = "ws";
AppSrv.prototype.DEF_HOST = "127.0.0.1";
AppSrv.prototype.DEF_PORT = "1337";

AppSrv.prototype.MES_TYPES = {
	"eventNotify":0
	,"error":1
	,"registered":2
}

AppSrv.prototype.m_conncetion;

AppSrv.prototype.m_protocol;
AppSrv.prototype.m_host;
AppSrv.prototype.m_port;

AppSrv.prototype.m_listenerCheckTimer;
AppSrv.prototype.m_connectTimer;

/**
 * current active subscribtions
 * [eventId] = {groups:{groupId:callBack},cnt:int}
 */
AppSrv.prototype.m_subscriptions;

AppSrv.prototype.m_conTries;

AppSrv.prototype.m_registeredClientId;

AppSrv.prototype.m_registered;//false - on sending for register/do_connect, true - on server TRUE answer
//***********************************

AppSrv.prototype.getState = function(){
	return this.m_connection.readyState;
}

AppSrv.prototype.connect = function(){
	if(this.m_connectTimer){
		clearTimeout(this.m_connectTimer);
	}
	this.m_conTries = 0;
	this.do_connect();	
}

AppSrv.prototype.do_connect = function(){

	//window.showTempNote(this.MES_CONNECTING,null,this.MES_DEALY);

	if(this.m_connection && (this.m_connection.readyState===WebSocket.OPEN||this.m_connection.readyState===WebSocket.CONNECTING) ){
		return;
	}

	this.m_registered = false;
	this.m_connection = new WebSocket(this.m_protocol+"://"+this.m_host+":"+this.m_port);
	var self = this;

	this.m_connection.onopen = function () {
		// connection is opened and ready to use
		if(self.m_connectTimer){
			clearTimeout(self.m_connectTimer);
		}
		if(window.showTempNote)window.showTempNote(self.MES_CONNECTED,null,self.MES_DEALY);			
		
		self.registerListener();
		
	};

	this.m_connection.onerror = function (error) {
		// an error occurred when sending/receiving data
		if(window.showTempError)window.showTempError(self.ER_NOT_CONNECTED,null,self.MES_DEALY);	
	};
		
	this.m_connection.onmessage = function (message) {
		self.onMessage(message);
	};						
	
	if( this.m_connection.readyState!==WebSocket.OPEN){
		this.m_conTries++;	
		this.m_connectTimer = setTimeout(
			function(){
				self.do_connect();
			}
			,Math.min(this.m_conTries*this.CON_TRY_WAIT_FACTOR,this.CON_TRY_WAIT_MAX)
		);
	}	
	
}

/**
 * @param {array} events 
 *	{string} events.id
 *	{funcion} events.onEvent
 *	{array} events.params  
 */
AppSrv.prototype.subscribe = function(events,callBack,id){

	if(this.m_connection.readyState!==WebSocket.OPEN || !this.m_registered){
		//may be later
		this.m_subscribeEvents = this.m_subscribeEvents || [];
		this.m_subscribeEvents.push({
			"events":events
			,"callBack":callBack
		});
		console.log("subscribe postponed")
		return;
	}
	
	if(!id){
		//new unique id for event group
		id = CommonHelper.ID();
	}
	
	console.log("AppSrv.prototype.subscribe")	
	
	//send to server unique  events only!!!
	var events_srv = [];
	this.m_subscriptions = this.m_subscriptions || {};
	for(var i=0;i<events.length;i++){
		if(!this.m_subscriptions[events[i].id]){
			events_srv.push({"id":events[i].id});
			this.m_subscriptions[events[i].id] = {"groups":{},"cnt":0};
		}
		this.m_subscriptions[events[i].id].groups[id] = callBack;
		this.m_subscriptions[events[i].id].cnt++;
	}
	
	if(events_srv.length){
		console.log("Events:")
		console.log(events_srv)
		this.m_connection.send(
			JSON.stringify({
				"cmd":"subscribe"
				,"events":events_srv
			})
		);
	}
		
	
	/*this.m_subscriptions[id] = {
		"events":events
		,"callBack":callBack
	};*/
	
	return id;
}

AppSrv.prototype.unsubscribe = function(id){

	if(this.m_connection.readyState!==WebSocket.OPEN || !this.m_registered){
		//may be later
		this.m_unsubscribeEvents = this.m_unsubscribeEvents || [];
		this.m_unsubscribeEvents.push(id);
		console.log("unsubscribe postponed")
		return;
	}

	console.log("AppSrv.prototype.unsubscribe")	
	
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
			this.m_connection.send(
				JSON.stringify({
					"cmd":"unsubscribe"
					,"events":events_srv
				})
			);
		}
		
	}
	/*if(this.m_subscriptions && this.m_subscriptions[id]){
		this.m_connection.send(
			JSON.stringify({
				"cmd":"unsubscribe"
				,"groupId":id
			})
		);
		this.m_subscriptions[id] = undefined;
		delete this.m_subscriptions[id];
	}*/
}

AppSrv.prototype.onMessage = function(message){
	console.log("AppSrv.prototype.onMessage json=")
	try {
		var json = JSON.parse(message.data);
		console.log(json)
		
		if(json.mesType==this.MES_TYPES.eventNotify && json.eventId
		&& this.m_subscriptions
		&& this.m_subscriptions[json.eventId]){
			//split eventId to Controller&method
			if(json.eventId){
				var sep = json.eventId.indexOf(".");
				json.controllerId = sep? json.eventId.substr(0,sep) : null;
				json.methodId = sep? json.eventId.substr(sep+1) : null;
			}			
		
			//send event to all subscribed groups
			for(gr_id in this.m_subscriptions[json.eventId].groups){
				if(typeof(this.m_subscriptions[json.eventId].groups[gr_id])==="function"){
					//calling function
					this.m_subscriptions[json.eventId].groups[gr_id](json);				
				}
			}
		}
		else if(json.mesType==this.MES_TYPES.registered){
			console.log("AppSrv.prototype.onMessage sysMessage registered")
			
			//this.setRegisteredClientId(json.id);
			this.m_registeredClientId = json.id;
			this.m_registered = true;
			
			//start timer for monitoring server fail			
			var self = this;
			this.m_listenerCheckTimer = setInterval(
				function(){
					console.log("On check timer")
					if(self.m_connection.readyState!==WebSocket.OPEN){
						console.log("Connection NOT active... reconnectin")
						clearInterval(self.m_listenerCheckTimer);
						self.connect();					
					}
					else{
						console.log("Connection OK")
					}
				}
				,this.CHECK_INTERVAL
			);
			
			//reregister events
			if(this.m_subscriptions){
				console.log("Reregestering events!")
				var groups = {};
				var cnt = 0;
				for(var ev_id in this.m_subscriptions){
					for(gr_id in this.m_subscriptions[ev_id].groups){
						groups[gr_id] =
							groups[gr_id] ||
							{"events":[],
							"callBack":this.m_subscriptions[ev_id].groups[gr_id]
							};
						groups[gr_id].events.push({"id":ev_id});
					}
					cnt++;					
				}
				if(cnt){
					this.m_subscriptions = {};
					for(var gr_id in groups){
						this.subscribe(groups[gr_id].events,groups[gr_id].callBack,gr_id);
					}
				}
			}
						
			//unregistered events
			if(this.m_subscribeEvents){
				for(var i=0;i<this.m_subscribeEvents.length;i++){
					if(this.m_subscribeEvents[i]){
						this.subscribe(this.m_subscribeEvents[i].events,this.m_subscribeEvents[i].callBack);
						this.m_subscribeEvents[i] = undefined;
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
			
			if(this.m_onSetClientId){
				this.m_onSetClientId(this.m_registeredClientId);
			}	
		}
		else if(json.mesType==this.MES_TYPES.error && json["name"]&&json["name"]==="ClientNotReg"){
			console.log("AppSrv.prototype.onMessage error ClientNotReg")
			//there could be Event Server restart the client not aware of
			//all events need to be reregistered
			
			this.registerListener();
		}
		else if(json.mesType==this.MES_TYPES.error && json["name"]){
			console.log("AppSrv.prototype.onMessage error:"+json["name"])
		}
		else{
			console.log('Unknown message from event server');
		}
	}
	catch (e) {
		console.log('AppSrv.onMessage error parsing message=',message.data+" Error:"+e.message);
	}
}

AppSrv.prototype.registerListener = function(){
console.log("AppSrv.prototype.registerListener")
	this.m_registered = false;
	
	this.m_connection.send(
		JSON.stringify({
			"cmd":"register"
			,"appId":this.m_appId
		})
	);	
}


AppSrv.prototype.getRegisteredClientId = function(){
	return this.m_registeredClientId;
}
/*
AppSrv.prototype.setRegisteredClientId = function(v){
	this.m_registeredClientId = v;
	if(this.m_onSetClientId){
		this.m_onSetClientId(this.m_registeredClientId);
	}	
}
*/


