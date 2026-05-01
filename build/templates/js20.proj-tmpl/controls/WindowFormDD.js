/* Copyright (c) 2012 
	Andrey Mikhalevich, Katren ltd.
*/
/*	
	Description
*/
//ф
/** Requirements
 * @requires common/functions.js
*/
var OPENED_FORMS={};
/* constructor */
function WindowFormDD(id,options){
	if (typeof id==="object"){
		options = id;
		id=options.id
	}
	options = options || {};	
	WindowFormDD.superclass.constructor.call(this,options);	
	
	this.m_noMinimize = (options.noMinimize!=undefined&&options.noMinimize);
	this.m_noClose = (options.noClose!=undefined&&options.noClose);
	this.m_resizable = (options.resizable==undefined)? true:options.resizable;
	
	this.m_formClass = dhtmlwindow;
}
extend(WindowFormDD,WindowForm);

WindowFormDD.prototype.m_divWin;
WindowFormDD.prototype.m_divId;

WindowFormDD.prototype.getWindowForm = function(){
	return window;
}

WindowFormDD.prototype.open = function(){
	this.m_divId = (this.m_id)? this.m_id:uuid();
	var cap = (this.m_caption)? this.m_caption:"     ";
	var opts = "";
	if ((!this.m_top||this.m_top==0)&&(!this.m_left||this.m_left==0)&&(!this.m_center||this.m_center==0)){		
		for (var id in OPENED_FORMS){
			if (OPENED_FORMS[id]){
				var v = parseInt(OPENED_FORMS[id].top,10)+30;
				v = (v>150)? 0:v;
				this.m_top = v;
				v = parseInt(OPENED_FORMS[id].left,10)+30;
				v = (v>150)? 0:v;
				this.m_left = v;
			}
		}
	}
	
	if (this.m_scrollBars){
		opts+=(opts=="")? "":",";
		opts+="scrolling=1";
	}
	if (this.m_resizable){
		opts+=(opts=="")? "":",";
		opts+="resize=1";
	}
	if (this.m_left){
		opts+=(opts=="")? "":",";
		opts+="left="+this.m_left+"px";
	}
	if (this.m_top){
		opts+=(opts=="")? "":",";
		opts+="top="+this.m_top+"px";
	}
	if (this.m_width){
		opts+=(opts=="")? "":",";
		opts+="width="+this.m_width+"px";
	}
	if (this.m_height){
		opts+=(opts=="")? "":",";
		opts+="height="+this.m_height+"px";
	}
	if (this.m_center){
		opts+=(opts=="")? "":",";
		opts+="center=1";
	}
	OPENED_FORMS[this.m_divId]={};
	OPENED_FORMS[this.m_divId].top = this.m_top;
	OPENED_FORMS[this.m_divId].left = this.m_left;
	
	//this.m_divWin=dhtmlwindow.open("broadcastbox", "inline", "This is some inline content. <a href='http://dynamicdrive.com'>Dynamic Drive</a>", "#2: Broadcast Title", "width=300px,height=120px,left=150px,top=10px,resize=1,scrolling=0");
	
	this.m_divWin=this.m_formClass.open(this.m_divId,
		"inline", "", cap, opts, "recal");
	if (this.m_center){
		this.m_divWin.moveTo("middle", "middle");
	}
	if (this.m_onBeforeClose){		
		var self = this;
		this.m_divWin.onclose=function(){
			//console.log("this.m_divWin.onclose");
			var r = self.m_onBeforeClose();
			r = (r==undefined)? true:r;
			if (r){
				delete OPENED_FORMS[self.m_divId];
			}
			return r;
		}
	}
	
	if (this.m_noClose){
		var n = DOMHandler.getElementsByAttr("Close",this.m_divWin,"title",true,"img");
		if (n&&n.length){
			n[0].style.display="none";
		}
	}
	if (this.m_noMinimize){
		var n = DOMHandler.getElementsByAttr("Minimize",this.m_divWin,"title",true,"img");
		if (n&&n.length){
			n[0].style.display="none";
		}		
	}	
}

WindowFormDD.prototype.close = function(){	
	//console.log("WindowFormDD.prototype.close");
	if (this.m_divWin){
		this.m_formClass.close(this.m_divWin);
		//this.m_divWin.close();
		delete this.m_divWin;
	}	
}
WindowFormDD.prototype.getContentParent = function(){
	var n = DOMHandler.getElementsByAttr("drag-contentarea",nd(this.m_divId),"class");
	if (n && n.length){
		return n[0];
	}
}
WindowFormDD.prototype.setCaption = function(caption){
	this.m_caption = caption;
}
WindowForm.prototype.setFocus = function(){}

WindowFormDD.prototype.setSize = function(w,h){
	this.m_formClass.setSize(this.m_divWin,w,h);
}
