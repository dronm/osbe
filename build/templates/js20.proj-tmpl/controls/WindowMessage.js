/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2014,2018,2019

 * @requires core/CommonHelper.js
  
 * @class
 * @classdesc Message window
 
 */
function WindowMessage(options){
	options = options || {};
	
	this.m_messages = [];
	this.m_window = null;
	this.m_model = null;
	this.m_flashTime = options.flashTime || this.FLASH_TIME;
}

WindowMessage.prototype.ID = "windowMessage";
WindowMessage.prototype.FLASH_TIME = 1000;
WindowMessage.prototype.BS_COL = 2;

WindowMessage.prototype.TP_ER = "danger";
WindowMessage.prototype.TP_WARN = "warning";
WindowMessage.prototype.TP_INFO = "info";
WindowMessage.prototype.TP_OK = "success";
	
/*@param object{
	@param string id,
	@param string subject,
	@param string content,
	@param string user_descr,
	@param string date_time,
	@param string message_type,
	@param int importance_level,
	@param bool require_view,
}	
*/
WindowMessage.prototype.m_messages;

WindowMessage.prototype.m_window;
WindowMessage.prototype.m_model;
	
/*
@param {string|object} text if object is given it is treated as Control options!!!
@param {int} [type=TP_MESSAGE]
@param {int} [timeout=0]
*/
WindowMessage.prototype.show = function(options){
	options = options || {};
	var mes_id = CommonHelper.uniqid();
	
	options.type = options.type || this.TP_INFO;

	/*if(!this.m_messages.length
	|| (
		!this.m_messages[this.m_messages.length-1]
		||!this.m_messages[this.m_messages.length-1].content
		||!this.m_messages[this.m_messages.length-1].content.trim
		||!options.text
		||!options.text.trim
		||this.m_messages[this.m_messages.length-1].content.trim()!=options.text.trim()
		||this.m_messages[this.m_messages.length-1].message_type!=options.type
		)
	){	
		this.m_messages.push({
			id:mes_id,
			date_time:DateHelper.time(),
			subject:null,
			content:options.text,
			user_descr:null,			
			message_type:options.type,
			importance_level:null,
			require_view:null
		});	
		
	}else
	*/
	if(this.m_messages.length
	&& (
		this.m_messages[this.m_messages.length-1]
		&&this.m_messages[this.m_messages.length-1].content
		&&this.m_messages[this.m_messages.length-1].content.trim
		&&options.text
		&&options.text.trim
		&&this.m_messages[this.m_messages.length-1].content.trim()==options.text.trim()
		&&this.m_messages[this.m_messages.length-1].message_type==options.type
		)
	){
		this.m_messages[this.m_messages.length-1].date_time = DateHelper.time();
		
	}else{
		this.m_messages.push({
			id:mes_id,
			date_time:DateHelper.time(),
			subject:null,
			content:options.text,
			user_descr:null,			
			message_type:options.type,
			importance_level:null,
			require_view:null
		});	
	}
	
	
	/*
	this.m_messages.sort(function (a, b) {
		if (a.date_time > b.date_time) {
			return 1;
		}
		if (a.date_time < b.date_time) {
			return -1;
		}
		return 0;
	});		
	*/
	this.toDOM();
	
	if (options.callBack){
		options.callBack();
	}
	
	return mes_id;
};
	
WindowMessage.prototype.toDOM = function(){
	//if (!window.body)return;
	var self = this;
	
	var mw_st = window.getApp().getWinMessageStyle();
	var mw_overlap = (mw_st.win_position=="overlap");
	
	var mw_class = "",win_style = "";
	if(window.getWidthType()!="sm"){
		//mobile - no class
		mw_class = (mw_overlap? "windowMessageOverlap":"windowMessageStick");
		win_style = "left:"+(100-mw_st.win_width)+"%;width:"+mw_st.win_width+"%;";
	}
	else{
		mw_class = "windowMessageMobile";
	}
	/*else{
		win_style = "width:100%;";	
	}*/
	
	var mw_col;
	if(!mw_overlap){
		mw_col = this.getMessageWindowCol(mw_st);
		mw_class+= (mw_class=="")? "":" ";
		mw_class+= window.getBsCol(mw_col);
	}
	
	if (!this.m_window){
		var n = DOMHelper.getElementsByAttr("windowMessage", window.body, "class", true);
		if (!n.length){
			throw Error("Message window not found!");
		}
		if (!n[0].id){
			n[0].id = CommonHelper.uniqid();
		}
		
		this.m_window = new ControlContainer(n[0].id,"DIV",{
			"className":"panel panel-default windowMessage"+((mw_class!="")? " "+mw_class:""),
			"attrs":mw_overlap? {"style":win_style}:null
		});
		
		
		//,"value":"окно сообщений"
		var head = new ControlContainer(this.ID+":head","DIV",{});//"className":"panel-heading"
		var head_cont = new ControlContainer(this.ID+":head-cont","DIV");
		head_cont.addElement(new ButtonCtrl(this.ID+":close",{
			"title":"закрыть",
			//"caption":"Закрыть",
			"glyph":"glyphicon-remove",
			"onClick":function(){
				self.m_messages = [];
				self.delDOM();
			}
		}));
		/*
		head_cont.addElement(new ButtonCtrl(this.ID+":clear",{
			"title":"очистить",
			"caption":"Очистить",
			"onClick":function(){
				self.m_messages = [];
				self.toDOM();
			}
		}));
		*/
		head.addElement(head_cont);
		
		this.m_content = new ControlContainer(this.ID+":content","DIV");//ul
		var body = new ControlContainer(this.ID+":body","DIV",{});//"className":"panel-body"
		body.addElement(this.m_content);
		
		this.m_window.addElement(head);
		this.m_window.addElement(body);
	}
	else if(mw_overlap){
		this.m_window.getNode().style = win_style;
	}
	
	this.m_window.setVisible(true);
	if(!mw_overlap){
		this.setWinDataClass(mw_col);
	}
		
	this.m_content.delDOM();
	this.m_content.clear();		
	
	var t = 0;
	for (var i=this.m_messages.length-1;i>=0;i--){
		//console.log(i+"="+this.m_messages[i].date_time);
		//
		var item_class = "message-item alert alert-"+this.m_messages[i].message_type;
		item_class += (i==this.m_messages.length-1)? " flashit":"";
		
		var cont = new ControlContainer(this.m_messages[i].id,"P",{"className":item_class});
					
		if (i==this.m_messages.length-1){
			this.m_flashCont = cont;
			//NS_ERROR_NOT_INITIALIZED!!!			
			try{
				setTimeout(function(){
					DOMHelper.delClass(self.m_flashCont.getNode(),"flashit");
				}, this.m_flashTime);
			}
			catch(e){			
			}
		}
		
		cont.addElement(new Control(this.m_messages[i].id+":head","DIV",
			{"value":DateHelper.format(this.m_messages[i].date_time,"H:i:s")
			}));				
		//console.log("content=")
		//console.dir(this.m_messages[i].content)
		cont.addElement(new ControlContainer(
				this.m_messages[i].id+":title",
				"DIV",
				(typeof(this.m_messages[i].content) == "string")? {"value":this.m_messages[i].content} : this.m_messages[i].content
			));
		this.m_content.addElement(cont);
		t++;			
	}
	//this.m_window.setClassName("panel panel-default windowMessage"+ ( (dwin)? (" "+this.m_bsCol+this.BS_COL):"") );
	this.m_window.setClassName("panel panel-default windowMessage "+mw_class);
	this.m_window.toDOM();
	
};

WindowMessage.prototype.getMessageWindowCol = function(mesWindStyle){
	var col = parseInt(mesWindStyle.win_width,10);
	if(!col){
		col = 1;
	}
	return Math.ceil(col*12/100);
}

WindowMessage.prototype.setWinDataClass = function(mwCol){
	var dwin = document.getElementById("windowData");
	if (dwin){
		DOMHelper.setAttr(dwin,"class",window.getBsCol(12-mwCol));
	}				
}

WindowMessage.prototype.delDOM = function(){
	if (this.m_window){
		this.m_window.setVisible(false);
		
		var mw_st = window.getApp().getWinMessageStyle();
		if(mw_st.win_position=="stick"){
			this.setWinDataClass(0);
		}
	}
}

