/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2012
 
 * @class
 * @classdesc ext form
 
 * @param {namespace} options
 * @param {string} [options.id=uniqid]
 * @param {int} [options.height=DEF_HEIGHT]
 * @param {int} [options.width=DEF_WIDTH] 
 * @param {int} [options.fullScreen=DEF_FULL_SCREEN]
 * @param {int} [options.directories=DEF_DIRECTORIES]   
 * @param {int} [options.channelMode=DEF_CHANNEL_MODE]      
 * @param {bool} [options.center=false]
 * @param {bool} [options.centerLeft=false]
 * @param {int} [options.location=DEF_LOCATION]
 * @param {int} [options.menuBar=DEF_MENU_BAR]
 * @param {int} [options.resizable=DEF_RESIZABLE]
 * @param {int} [options.status=DEF_STATUS]
 * @param {int} [options.titleBar=DEF_TITLE_BAR]
 * @param {int} [options.name=DEF_NAME]
 * @param {string} options.host
 * @param {string} [options.script=DEF_SCRIPT] 
 * @param {string} options.URLParams
 * @param {string} options.title||options.caption
 * @param {string} options.content
 * @param {function} options.onClose
 * @param {object} options.params
 */

//_blank - URL is loaded into a new WindowForm. This is default
//_parent - URL is loaded into the parent frame
//_self - URL replaces the current page
//_top URL replaces any framesets that may be loaded

function WindowForm(options){
	options = options || {};
	
	this.m_id = options.id || CommonHelper.uniqid();	
	options.height = options.height || this.DEF_HEIGHT;
	options.width = options.width || this.DEF_WIDTH;
	
	options.fullScreen = options.fullScreen|| this.DEF_FULL_SCREEN;
	if (options.fullScreen){
		options.width = DOMHelper.getViewportWidth();
		options.height = DOMHelper.getViewportHeight();
	}
	this.setFullScreen(options.fullScreen);
	
	this.setDirectories(options.directories || this.DEF_DIRECTORIES);
	this.setChannelMode(options.channelMode || this.DEF_CHANNEL_MODE);
	
	this.setHeight(options.height);
	if (options.center){
		this.m_center = true;
		this.setCenter(options.height || this.DEF_HEIGHT, options.width||this.DEF_WIDTH);
	}
	else{
		if (options.centerLeft){
			this.setLeftCenter(options.width || this.DEF_WIDTH);	
		}
		else{
			this.setLeft(options.left || this.DEF_LEFT);
		}
		if (options.centerTop){
			this.setTopCenter(options.height||this.DEF_HEIGHT);	
		}		
		else{
			this.setTop(options.top || this.DEF_TOP);		
		}
	}
	this.setLocation((options.location!=undefined)? options.location:this.DEF_LOCATION);
	this.setMenuBar((options.menuBar!=undefined)? options.menuBar:this.DEF_MENU_BAR);
	this.setResizable((options.resizable!=undefined)? options.resizable:this.DEF_RESIZABLE);
	this.setScrollBars((options.scrollBars!=undefined)? options.scrollBars:this.DEF_SCROLL_BARS);
	this.setStatus((options.status!=undefined)? options.status:this.DEF_STATUS);
	this.setTitleBar((options.titleBar!=undefined)? options.titleBar:this.DEF_TITLE_BAR);	
	this.setWidth(options.width);
//
	this.setName(options.name || this.DEF_WIN_NAME);
	
	this.setHost(options.host || "");
	this.setScript(options.script || (options.content==undefined)? this.DEF_SCRIPT:undefined);
	this.setURLParams(options.URLParams || "");
	
	this.setCaption(options.caption || options.title || "");
	
	this.m_content = options.content;
	
	this.setOnClose(options.onClose);
	
	this.setParams(options.params);
	
	//this.m_winObj = options.winObj;
	
}

/* constants */
WindowForm.prototype.DEF_DIRECTORIES = "0";
WindowForm.prototype.DEF_CHANNEL_MODE = "0";
WindowForm.prototype.DEF_FULL_SCREEN = 0;
WindowForm.prototype.DEF_HEIGHT = "500";
WindowForm.prototype.DEF_LEFT = "0";
WindowForm.prototype.DEF_LOCATION = "0";
WindowForm.prototype.DEF_MENU_BAR = 0;
WindowForm.prototype.DEF_RESIZABLE = "1";
WindowForm.prototype.DEF_SCROLL_BARS = "1";
WindowForm.prototype.DEF_STATUS = "0";
WindowForm.prototype.DEF_TITLE_BAR = "0";
WindowForm.prototype.DEF_TOP = "0";
WindowForm.prototype.DEF_WIDTH = "600";
WindowForm.prototype.DEF_WIN_NAME = "_blank";
WindowForm.prototype.DEF_SCRIPT = "";//index.php
WindowForm.prototype.DEF_CENTER_TOP_OFFSET = "20";

WindowForm.prototype.LEFT_STEP = 50;
WindowForm.prototype.LEFT_MAX = 500;
WindowForm.prototype.TOP_STEP = 50;
WindowForm.prototype.TOP_MAX = 500;

/* private members */
WindowForm.prototype.m_directories;
WindowForm.prototype.m_channelMode;
WindowForm.prototype.m_fullScreen;
WindowForm.prototype.m_height;
WindowForm.prototype.m_left;
WindowForm.prototype.m_location;
WindowForm.prototype.m_menuBar;
WindowForm.prototype.m_resizable;
WindowForm.prototype.m_scrollBars;
WindowForm.prototype.m_status;
WindowForm.prototype.m_titleBar;
WindowForm.prototype.m_top;
WindowForm.prototype.m_width;
//
WindowForm.prototype.m_name;
WindowForm.prototype.m_host;
WindowForm.prototype.m_script;
WindowForm.prototype.m_URLParams;
WindowForm.prototype.m_WindowForm;
WindowForm.prototype.m_onClose;

WindowForm.prototype.m_params;

/* public methods */
WindowForm.prototype.open = function(){
	/*
	var forms = this.m_app.getOpenedForms();
	if ( (!this.m_top || this.m_top==0)
	&&(!this.m_left || this.m_left==0)
	&&(!this.m_center || this.m_center==0)
	){		
		var last_form;
		for (var id in forms){
			if (forms[id]){
				last_form = forms[id];
			}
		}
		if (last_form){
			this.m_top = parseInt(last_form.top) + this.TOP_STEP;
			this.m_top = (this.m_top>this.TOP_MAX)? 0:this.m_top;
			this.m_left = parseInt(last_form.left) + this.LEFT_STEP;
			this.m_left = (this.m_left>this.LEFT_MAX)? 0:this.m_left;
		}
	}
	this.m_app.addOpenedForm(this.m_id,{top:this.m_top, left:this.m_left});
	*/
	var win_opts = 
		"directories="+this.m_directories+","+
		"channelMode="+this.m_channelMode+","+
		"fullScreen="+this.m_fullScreen+","+
		"height="+this.m_height+","+
		"left="+this.m_left+","+
		"location="+this.m_location+","+
		"menubar="+this.m_menuBar+","+
		"resizable="+this.m_resizable+","+
		"scrollbars="+this.m_scrollBars+","+
		"status="+this.m_status+","+
		"titlebar="+this.m_titleBar+","+
		"top="+this.m_top+","+
		"width="+this.m_width;
		
	var url = this.getURL();
	// ,win_opts
	
	if (CommonHelper.isIE() && CommonHelper.getIEVersion()<=9){
		this.m_WindowForm = window.open("","",(this.m_name=="_blank")? "":win_opts);
		if (this.m_WindowForm)this.m_WindowForm.location = url;
	}
	else{
	/*console.log("this.m_WindowForm = window.open")
	console.log("url="+url)
	console.log("m_name="+this.m_name)
	console.log("win_opts="+win_opts)
	*/
		this.m_WindowForm = window.open(
			url,
			this.m_name,
			(this.m_name=="_blank")? "":win_opts
		);	
	}
	
	window.getApp().m_openedWindows[this.m_name] = this.m_WindowForm;
	
	if (!this.m_WindowForm){
		throw new Error(this.ER_OPEN);
	}
	
	if (url=="" && this.m_content){
		if(typeof this.m_content=="object"){
			this.m_content.toDOM(this.m_WindowForm.document);
		}
		else{
			this.m_WindowForm.document.write(this.m_content);
		}
		
	}	
	
	this.initForm();
	
	return this.m_WindowForm;
}

WindowForm.prototype.initForm = function(){

	var self = this;
	this.m_WindowForm["onClose"] = function(res){
		if (self.m_onClose){
			self.m_onClose.call(self,self.m_WindowForm.closeResult);
			self.m_WindowForm.onClose = undefined;
		}
	}

	this.m_WindowForm["getParam"] = function(id){
		return self.getParam(id);
	}
	
	this.m_WindowForm["getApp"] = function(){
		return window.getApp();
	}
	
	//window.m_childForms = window.m_childForms || {};
	//window.m_childForms[this.m_id] = this.m_WindowForm;	
	//ie hack
	window["paramsSet"] = true;
	window["getChildParam"] = this.m_WindowForm["getParam"];
	
}

WindowForm.prototype.close = function(){
	window.getApp().m_openedWindows[this.m_name] = undefined;
	if (this.m_WindowForm){
		this.m_WindowForm.close();
	}
	
}

WindowForm.prototype.setDirectories = function(directories){
	this.m_directories = directories;
}
WindowForm.prototype.setChannelMode = function(channelMode){
	this.m_channelMode = channelMode;
}
WindowForm.prototype.setFullScreen = function(fullScreen){
	this.m_fullScreen = fullScreen;
}
WindowForm.prototype.setHeight = function(height){
	if (height){
		this.m_height = height;
	}
}
WindowForm.prototype.setLeft = function(left){
	this.m_left = left;
}
WindowForm.prototype.setLocation = function(location){
	this.m_location = location;
}
WindowForm.prototype.setMenuBar = function(menuBar){
	this.m_menuBar = menuBar;
}
WindowForm.prototype.setResizable = function(resizable){
	this.m_resizable = resizable;
}
WindowForm.prototype.setScrollBars = function(scrollBars){
	this.m_scrollBars = scrollBars;
}
WindowForm.prototype.setStatus = function(status){
	this.m_status = status;
}
WindowForm.prototype.setTitleBar = function(titleBar){
	this.m_titleBar = titleBar;
}
WindowForm.prototype.setTop = function(top){
	if (top){
		this.m_top = top;
	}
}
WindowForm.prototype.setWidth = function(width){
	if (width){
		this.m_width = width;
	}
}
WindowForm.prototype.setSize = function(w,h){
	this.m_w = width;
	this.m_h = h;
}

//
WindowForm.prototype.setName = function(name){
	this.m_name = name;
}
WindowForm.prototype.getScript = function(){
	return this.m_script;
}
WindowForm.prototype.setScript = function(script){
	this.m_script = script;
}
WindowForm.prototype.getHost = function(){
	var host = this.m_host||"";
	if (host && host.length && host.substring(host.length-1,host.length)!="/"){
		host+="/";
	}
	return host;
}
WindowForm.prototype.setHost = function(host){
	this.m_host = host;
}
WindowForm.prototype.getURL = function(){	
	var s = this.getScript();
	var p = this.getURLParams();
	if (!s&&!p){
		return "";
	}	
	var h = this.getHost();
	
	if (p){
		p = "?"+p;
	}
	else{
		p = "";
	}
	return (h+s+p);
}
WindowForm.prototype.setURLParams = function(URLParams){
	this.m_URLParams = URLParams;
}
WindowForm.prototype.getURLParams = function(){
	return this.m_URLParams;
}
WindowForm.prototype.setLeftCenter = function(width){
	var l = Math.floor(DOMHelper.getViewportWidth()/2) - Math.floor(width/2);
	this.setLeft(l);
}
WindowForm.prototype.setTopCenter = function(height){
	var t = Math.floor(DOMHelper.getViewportHeight()/2) - Math.floor(height/2);
	this.setTop(t+this.DEF_CENTER_TOP_OFFSET);
}
WindowForm.prototype.setCenter = function(height,width){
	this.setLeftCenter(width);
	this.setTopCenter(height);
}

WindowForm.prototype.getWindowForm = function(){
	return this.m_WindowForm;
}
WindowForm.prototype.getContentParent = function(){
	return this.m_WindowForm.document.body;
}
WindowForm.prototype.setFocus = function(){
	return this.m_WindowForm.focus();
}
WindowForm.prototype.setTitle = function(title){
	this.m_title=title;
}
WindowForm.prototype.setCaption = function(caption){
	this.setTitle(caption);
}
WindowForm.prototype.setOnClose = function(f){
	this.m_onClose = f;
}

WindowForm.prototype.setParams = function(params){
	this.m_params = params || {};
}

WindowForm.prototype.setParam = function(id,val){
	this.m_params[id] = val;
}

WindowForm.prototype.getParam = function(id){
	return this.m_params[id];
}

WindowForm.prototype.getId = function(){
	return this.m_id;
}


