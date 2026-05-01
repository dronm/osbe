/* Copyright (c) 2012,2014,2016
	Andrey Mikhalevich, Katren ltd.
*/

/** Requirements
*/

/* constructor */
var WindowQuestion = {
	RES_YES:0,
	RES_NO:1,
	RES_CANCEL:2,
	
	/*
	@param object options{
		@param {bool} yes [true]
		@param {bool} no [true]
		@param {bool} cancel [true]
		@param {int} timeout [0]
		@param {function} callBack
		@param {function} callBackYes
		@param {string} text
		@param {Control} buttonClass [ButtonCmd]
	}
	*/
	show:function(options){
		options = options || {};
		
		var self = this;
		
		var yes = (options.yes!=undefined)? options.yes:true;
		var no = (options.no!=undefined)? options.no:true;
		var cancel = (options.cancel!=undefined)? options.cancel:true;
		var timeout = options.timeout || 0;
		
		if(options.callBackYes){
			this.m_callBack = (function(userCallBack){
				return function(res){
					if(res == WindowQuestion.RES_YES){
						userCallBack();
					}
				}
			})(options.callBackYes)
		}else{
			this.m_callBack = options.callBack;
		}
		
		this.m_modalId = "quest-modal";
		this.m_modal = new WindowFormModalBS(this.m_modalId,{
			content:new Control(this.m_modalId+":cont","div",{value:options.text})
		});
		
		this.m_modalOpenFunc = this.m_modal.open;
		this.m_modalCloseFunc = this.m_modal.close;
		this.m_modal.open = function(){
			self.addEvents();
			self.m_modalOpenFunc.call(self.m_modal);
			self.m_modal.m_footer.getElement("btn-yes").getNode().focus();
		}
		this.m_modal.close = function(res){
			self.delEvents();			
			self.m_modalCloseFunc.call(self.m_modal);
			self.m_callBack(res);
		}
		
		var btn_class = options.buttonClass || ButtonCmd;
		
		this.m_keyEvent = function(e){			
			e = EventHelper.fixKeyEvent(e);
			//console.log("this.m_keyEvent "+e.keyCode)
			if (self.keyPressEvent(e.keyCode,e)){
				e.preventDefault();
				return false;
			}
		};
		
		
		if (yes){
			this.m_modal.m_footer.addElement(new btn_class(this.m_modalId+":btn-yes",{
				"caption":this.BTN_YES_CAP,
				"focus":true,
				"attrs":{
					"title": this.YES_TITLE,
					"tabindex":0
				},
				"onClick":function(){
					//self.m_callBack(self.RES_YES);
					//self.m_modal.close();
					self.m_modal.close(self.RES_YES);
				}
				})
			);
		}

		if (no){
			this.m_modal.m_footer.addElement(new btn_class(this.m_modalId+":btn-no",{
				"caption":this.BTN_NO_CAP,
				"attrs":{
					"title": this.NO_TITLE,
					"tabindex":1
					},
				"onClick":function(){
					//self.m_callBack(self.RES_NO);
					//self.m_modal.close();
					self.m_modal.close(self.RES_NO);
				}
				})
			);
		}
		
		if (cancel){
			this.m_modal.m_footer.addElement(new btn_class(this.m_modalId+":btn-cancel",{
				"caption":this.BTN_CANCEL_CAP,
				"attrs":{
					"data-dismiss":"modal",
					"title":this.CANCEL_TITLE,
					"tabindex":2
				},
				"onClick":function(){
					self.m_modal.close(self.RES_CANCEL);
				}				
			})
			);
		}
		
		this.m_modal.open();
				
		return this.RES_NO;
	},
	
	addEvents:function(){
		EventHelper.add(window,'keydown',this.m_keyEvent,false);
	},
	
	delEvents:function(){
		EventHelper.del(window,'keydown',this.m_keyEvent,false);
	},
		
	keyPressEvent:function(keyCode,event){	
		var res=false;
		switch (keyCode){
			case 39: // arrow right
				break;
			case 37: // arrow left
				break;
			case 13: // return
				this.m_modal.close(this.RES_YES);
				res = true;
				break;
			case 27: // ESC
				this.m_modal.close(this.RES_CANCEL);
				res = true;
				break;												
		}		
		return res;
	}
	
}
