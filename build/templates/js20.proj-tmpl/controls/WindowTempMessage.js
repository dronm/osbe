/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2019

 * @requires jquery           

 * @class
 * @classdesc
 
 */
function WindowTempMessage(options){
	options = options || {}
	this.m_messages = [];	
	
	this.m_flashTime = options.flashTime || this.FLASH_TIME;
	this.m_timeout = options.timeout || this.TIMEOUT;
	this.m_margin = options.margin || this.MARGIN;
	this.m_width = options.width || this.WIDTH;
	this.m_interval = options.interval || this.INTERVAL;
}

/* Constants */
WindowTempMessage.prototype.TP_ER = "danger";
WindowTempMessage.prototype.TP_WARN = "warning";
WindowTempMessage.prototype.TP_INFO = "info";
WindowTempMessage.prototype.TP_OK = "success";
WindowTempMessage.prototype.FLASH_TIME = 1000;
WindowTempMessage.prototype.TIMEOUT = 1000*10;
WindowTempMessage.prototype.MARGIN = "50";
WindowTempMessage.prototype.WIDTH = "300px";
WindowTempMessage.prototype.INTERVAL = "10";
/* private members */

/* protected*/


/* public methods */
/*
@param {string|object} text if object is given it is treated as Control options
@param {int} [type=TP_MESSAGE]
@param {int} [timeout=0]
@param {int} [flashTime=0]
@param {int} [margin=0]
*/
WindowTempMessage.prototype.show = function(options){
	options = options || {};
	
	options.type = options.type || this.TP_INFO;

	var item_class = "hidden message-item alert flashit alert-"+options.type;
	var mes_id;
	var self = this;
	var last_top,last_left,deleted_top,deleted_left,last_height,last_width;
	
	for(id in this.m_messages){
		if(this.m_messages[id]){
			last_top = this.m_messages[id].top;
			last_left = this.m_messages[id].left;
			last_height = this.m_messages[id].height;
			last_width = this.m_messages[id].width;
		}
		else if(!mes_id){
			mes_id = this.m_messages[id].control.getId();
			deleted_top = this.m_messages[id].top;
			deleted_left = this.m_messages[id].left;
		}
	}
	mes_id = mes_id? mes_id:CommonHelper.uniqid();
	this.m_messages[mes_id] = {
		"callBack":options.callBack		
	};
	
	
	this.m_messages[mes_id].control = new ControlContainer(mes_id,"DIV",{
			"className":item_class,
			"attrs":{
				"style":"position:fixed;display:block;z-index:9999;width:"+(options.width||this.m_width)
			},
			"elements":[
				new Control(
					mes_id+":head",
					"DIV",
					{"attrs":{
						"type":"button",
						"class":"close",
						"aria-hidden":"true",
						"messageid":mes_id
					},
					"value":"×",
					"events":{
						"click":options.onClickCancel || function(e){
							self.close(e.target.getAttribute("messageid"));
						}
					}
					}
				)
				,new ControlContainer(
					mes_id+":title",
					"DIV",
					(typeof(options.content) == "string")? {"value":options.content} : options.content
				)					
			]
	});
	this.m_messages[mes_id].control.toDOM(document.body);
	var n = this.m_messages[mes_id].control.getNode();
	var top,left;
	if(!last_top){
		left = document.documentElement.clientWidth - n.offsetWidth - (options.margin||this.m_margin);
		top = document.documentElement.clientHeight - n.offsetHeight - (options.margin||this.m_margin);	
	}
	else{
		var top = last_top - this.m_interval - last_height;
		var left = last_left;
		if(top<document.documentElement.clientHeight/2){
			top = document.documentElement.clientHeight - n.offsetHeight - (options.margin||this.m_margin);
			left = last_left - this.m_interval - last_width;
			if(!left){
				top = deleted_top;
				left = deleted_left;
			}
		}
	}
	n.style.top = top + "px";
	n.style.left = left + "px";	
	this.m_messages[mes_id].top = top;
	this.m_messages[mes_id].height = n.offsetHeight;
	this.m_messages[mes_id].left = left;
	this.m_messages[mes_id].width = n.offsetWidth;
	
	//NS_ERROR_NOT_INITIALIZED!!!
	try{
		this.m_messages[mes_id].flashTmerId = setTimeout(function(mesId){
			self.stopFlash(mesId);
		}, (options.flashTime||this.m_flashTime),mes_id);

		this.m_messages[mes_id].timerId = setTimeout(function(mesId){
			self.close(mesId);
		}, (options.timeout||this.m_timeout),mes_id);
	}
	catch(e){	
	}
	
	//$(n).fadeIn( "slow");
	DOMHelper.show(n);
}

WindowTempMessage.prototype.stopFlash = function(mesId){
	if(this.m_messages[mesId]){
		DOMHelper.delClass(this.m_messages[mesId].control.getNode(),"flashit");
	}
}

WindowTempMessage.prototype.close = function(mesId){
	if(this.m_messages[mesId]){
		if(this.m_messages[mesId].flashTmerId)clearTimeout(this.m_messages[mesId].flashTmerId);
		if(this.m_messages[mesId].timerId)clearTimeout(this.m_messages[mesId].timerId);
	
		if(this.m_messages[mesId].control){		
			//this.m_messages[mesId].control.delDOM();
			var self = this;
			$(this.m_messages[mesId].control.getNode()).fadeOut( "slow", function() {
				self.deleteObj(mesId);
			});						
		}
	}
}

WindowTempMessage.prototype.deleteObj = function(mesId){
	if(this.m_messages && this.m_messages[mesId]){
		if(this.m_messages[mesId].control){
			this.m_messages[mesId].control.delDOM();
			delete this.m_messages[mesId].control;			
		}
		if(this.m_messages[mesId].callBack)this.m_messages[mesId].callBack();
		delete this.m_messages[mesId];
	}
}
