/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2014
 
 * @class
 * @classdesc Basic visual control, maps html tag 
 
 * @requires core/DOMHelper.js
 * @requires core/EventHelper.js
 * @requires core/CommonHelper.js    
  
 * @param {string} id - html tag id
 * @param {string} tagName - html tag name
 * @param {object} options
 * @param {string} options.templateId custom template ID or class name 
 * @param {string} options.template
 * @param {Object} options.templateOptions
 * @param {string} options.html
 * @param {string} options.className
 * @param {string} options.value
 * @param {object} options.attrs
 * @param {int} options.maxLength
 * @param {string} options.placeholder
 * @param {string} options.title - sysonym of attrs.title
 * @param {bool} options.focus
 * @param {int} options.tabIndex
 * @param {bool} options.required
 * @param {function} options.onValueChange
 * @param {object} options.events - structure of events  eventName:function. eventName can be with or without "on"
 * 
 * @param {object} options.srvEvents {events:[],onOpen:function,onEvent:function,onSubscribed:function.onError:function,onClose:function}
 *  
 */
function Control(id,tagName,options){
	options = options || {};
	tagName = tagName || this.DEF_TAG_NAME;	
	
	//!!! this.constructor.name is always undefined!!!
	//this.m_template = options.template || window.getApp().getTemplate(this.constructor.name||CommonHelper.functionName(this.constructor));
	this.m_template = options.template || window.getApp().getTemplate(options.templateId || CommonHelper.constructorName(this));
	this.setTemplateOptions(options.templateOptions);
	
	options.attrs = options.attrs || {};
		
	//var n
	this.m_node = options.node;
	if(!this.m_node && id){
		this.m_node = CommonHelper.nd(id,this.getWinObjDocument());
	}
	if (this.m_node){
		/**
		 * Node exists in DOM
		 */
		for (var i=0;i<this.m_node.attributes.length;i++){
			if (this.m_node.attributes[i].name.toLowerCase()=="options"){
				var html_opts = JSON.parse(this.m_node.attributes[i].value.replace(new RegExp("'", 'g'), '"'));
				for (var html_opt_id in html_opts){
					options[html_opt_id] = html_opts[html_opt_id];
				}
			}
			else{
				options.attrs[this.m_node.attributes[i].name] = this.m_node.attributes[i].value;
			}
		}
		/*
		if (this.m_node.nodeName!=tagName && tagName.toUpperCase()!="DIV"){
			DOMHelper.setTagName(this.m_node,tagName);
		}		
		this.setTemplate(this.m_template);
		this.setHtml(options.html);
		*/
		
		if (this.m_template || options.html){
			
			var _html = (options.html!=undefined)? options.html : this.getTemplateHTML(this.m_template, id);
			var tempDiv = document.createElement("TEMPLATE");//DIV
			tempDiv.className = this.CLASS_INVISIBLE;
			if(!tempDiv.insertAdjacentHTML){
				tempDiv.innerHTML = (options.html!=undefined)? options.html : this.getTemplateHTML(this.m_template, id);
			} else{
				tempDiv.insertAdjacentHTML("afterbegin", (options.html!=undefined)? options.html : this.getTemplateHTML(this.m_template, id));
			}
			var new_node = DOMHelper.firstChildElement(tempDiv);			
			if(!new_node){
				throw new Error("Control "+id+" template head node not found!");
			}
			//var new_node = (new DOMParser()).parseFromString((options.html!=undefined)? options.html : this.getTemplateHTML(this.m_template,id), "text/html");
			
			//this.m_node.parentNode.insertBefore(new_node,this.m_node);
			//this.m_node.parentNode.removeChild(this.m_node);
			var par = this.m_node.parentNode;
			var sib = this.m_node.nextSibling;
			this.m_node.parentNode.removeChild(this.m_node);
			if(sib){
				par.insertBefore(new_node,sib);
			}
			else{
				par.appendChild(new_node);
			}
			this.m_node = new_node;
		}				
	}
	else if (this.m_template==undefined && options.html==undefined){
		/**
		 * Node does not exist in DOM
		 * no template no html
		 */
		try{
			this.m_node = document.createElement(tagName);
		}
		catch(e){
			this.m_node = document.createElement("DIV");
		}
		this.setId(id);	
	} else{
		/**
		 * Node DOES NOT exist in DOM && there is a template|html, so node is the first template node
		 */
		this.m_tempDiv = document.createElement("DIV");
		this.m_tempDiv.className = this.CLASS_INVISIBLE;		
		this.m_tempDiv.innerHTML = (options.html!=undefined)? options.html : this.getTemplateHTML(this.m_template,id);	
		this.m_node = DOMHelper.lastChildElement(this.m_tempDiv);
//if(tagName!="TEMPLATE" && tagName!=this.m_node.tagName){
//	console.log("tagName="+tagName, "this.m_node.tagName=" + this.m_node.tagName)		
//}
		document.body.appendChild(this.m_tempDiv);
	}
	
	this.setClassName(options.className);

	if (options.value!=undefined){
		this.setValue(options.value);
	}
	
	if (options.name){
		options.attrs.name = options.name;
	}	
	
	if (!options.attrs.name && id){
		if(typeof(id)!="string"){
			console.log("Control ID is not a string!")
		}
		var id_ar = id.split(this.NAMESPACE_SEP);
		if (id_ar.length){
			options.attrs.name = id_ar[id_ar.length-1];
		}
		else{
			options.attrs.name = id;
		}
	}
	
	//predefind attributes
	options.attrs.maxlength = options.attrs.maxlength || options.maxLength||options.maxlength;
	options.attrs.placeholder = options.attrs.placeholder || options.placeholder;
	options.attrs.title = options.attrs.title || options.title;
	options.attrs.autofocus = options.attrs.autofocus || ( (options.focus || options.autofocus || options.focused)? "autofocus":undefined );
	options.attrs.tabIndex = options.attrs.tabIndex || options.tabIndex;
		
	/*
	if (options.maxLength || options.maxlength){
		options.attrs.maxlength = options.attrs.maxlength || options.maxLength||options.maxlength;
	}	
	if (options.placeholder){
		options.attrs.placeholder = options.placeholder;
	}	
	if (options.title){
		options.attrs.title = options.title;
	}	
	if (options.focus || options.autofocus){
		options.attrs.autofocus = "autofocus";
	}	
	
	if (options.tabIndex || options.attrs.tabindex){
		this.setTabIndex(options.tabIndex || options.attrs.tabindex);
	}	
	*/
	//disabled can be an attribute
	if (options.attrs.disabled && options.attrs.disabled==this.ATTR_DISABLED){
		options.enabled = false;
	}
	
	this.setEnabled((options.enabled!=undefined)? options.enabled:true);
	this.setVisible((options.visible!=undefined)? options.visible:true);
	
	if(options.hidden===true){
		this.hide();
	}
	
	if (options.required!=undefined){
		this.setRequired(options.required);
	}
	
	//extra DOM attributes
	for (var attr in options.attrs) {
		if (attr!="disabled"){
			var av;
			if (attr=="class"){
				av = DOMHelper.getAttr("class") || "";
				av = av+ ((av=="")? "":" ")+ options.attrs[attr];			
				if(options.visible===false){
					av+= " "+this.CLASS_INVISIBLE;
				}
			}
			else if (attr=="style"){
				av = DOMHelper.getAttr("style") || "";
				av = av+options.attrs[attr];
			}		
			else{
				av = options.attrs[attr];
			}	
			this.setAttr(attr,av);
		}
	}
	
	this.setOnValueChange(options.onValueChange);
	this.setEvents(options.events);
	
	this.setSrvEvents(options.srvEvents);
}	

/* constants */

/** @constant {string} */
Control.prototype.DEF_TAG_NAME = "DIV";

/** @constant {string} attribute value*/
Control.prototype.ATTR_DISABLED = "disabled";//

/** @constant {string} attribute value*/
Control.prototype.ATTR_REQ = "required";

/** @constant {string} html class value*/
Control.prototype.CLASS_INVISIBLE = "hidden";

/** @constant {string} namespace separator*/
Control.prototype.NAMESPACE_SEP = ":";

/* private members */
/** @private */
Control.prototype.m_node;

/** @private */
Control.prototype.m_events;

/** @private */
Control.prototype.m_eventFuncs;

/** @private */
Control.prototype.m_onValueChange;

/** @private */
Control.prototype.m_locked;

/**
 * Control's state before lock
 * @private
 */
Control.prototype.m_beforeLockEnabled;

Control.prototype.m_html;

//Server events
//{events:[],onEvent:function,onOpen:function.onError:function,onClose:function,onSubscribed:function}
Control.prototype.m_srvEvents;

//reference to event group id for unvalidating
Control.prototype.m_srvEventsId;

Control.prototype.m_enableLock;

/**
 * Corrcets id of a events,adds on if needded
 * @protected
 * @param {string} ev - event name to correct
 */
Control.prototype.correctEvId = function(ev){
	var id = ev.toLowerCase();
	if (id.substring(0,2)=="on"){
		id = id.substring(2);
	}
	return id;
}

/**
 * All events from m_events to DOM
 * @protected
 */
Control.prototype.eventsToDOM = function(){
	for (var ev in this.m_events){
		var id = this.correctEvId(ev);
		
		var self = this;
		
		if (this.m_eventFuncs[id]){
			EventHelper.del(this.m_node,id,this.m_eventFuncs[id],false);
		}
		this.m_eventFuncs[id] = (function(self,ev){
			return function(e){
				self.m_events[ev].call(self,e);
			}
		})(self,ev);
		EventHelper.add(this.m_node,id,this.m_eventFuncs[id],false);
	}	
}

/**
 * @protected
 */
Control.prototype.eventsFromDOM = function(){
	for (var ev in this.m_events){
	
		var id = this.correctEvId(ev);
		
		if (this.m_eventFuncs[id]){		
			EventHelper.del(this.m_node,id,this.m_eventFuncs[id],false);
		}
	}	
}

/**
 * @protected
 * @param {DOMNode} parent - node to attach to
 * @param {DOMNode} beforeNode - sibling before which to insert or null
 */
Control.prototype.nodeToDOM = function(parent,beforeNode){
	
	if (this.m_tempDiv){
		DOMHelper.setParent(this.m_node,parent);
		DOMHelper.delNode(this.m_tempDiv);
	}
	else{
		var n = CommonHelper.nd(this.getId(),this.getWinObjDocument());
		if (!n && !parent){
			throw new Error("Neither node nor parent found! ID="+this.getId());
		}
		else if (!n){
			if (beforeNode){
				parent.insertBefore(this.m_node,beforeNode);
			}
			else{
				parent.appendChild(this.m_node);
			}			
		}
		/*
		if ( (!n && parent) || (n && !parent)){
			if (!n){
				parent.appendChild(this.m_node);
			}
			else if (this.m_node != n){
				this.m_node = n;	
			}		
		}
		*/
		/*
		else if ( (n && parent) && (n.parentNode!=parent)){
			DOMHelper.setParent(n,parent);
		}
		*/
		
	}
	if (this.getAttr("autofocus")){
		this.focus();
	}
}

/**
 * @protected
 * @param {string} val - Sets text value of the node
 */
Control.prototype.setText = function(val){
	if (this.m_node.childNodes!=undefined && 
	this.m_node.childNodes.length){
		this.m_node.childNodes[0].nodeValue = val;
	}
	else{
		//this.appendToNode(document.createTextNode(val));
		var tn = document.createTextNode(val);
		if (this.m_node.nodeName=="IMG"){		
		}
		else{
			this.m_node.appendChild(tn);
		}
	}
}

/**
 * @protected
 * @returns {string} - Text value of a node
 */
Control.prototype.getText = function(){
	if (this.m_node.childNodes && this.m_node.childNodes.length){
		return this.m_node.childNodes[0].nodeValue;
	}
}


/**
 * Fired when value is changed, calls onValueChange
 * @protected
 */
Control.prototype.valueChanged = function(){
	if (this.m_onValueChange){
		this.m_onValueChange.call(this);
	}
}

/* *********************** public methods ***************** */

/**
 * @public
 */
Control.prototype.setId = function(id){
	if (id)this.m_node.id = id;
}

/**
 * @public
 */
Control.prototype.getId = function(){
	return DOMHelper.getAttr(this.getNode(),"id");
}

/**
 * @public
 * @param {string} v 
 */
Control.prototype.setTagName = function(v){
	if (this.m_node.nodeName != v){
		this.m_node.nodeName = v;
	}
}

/**
 * @public
 * @param {string} v 
 */
Control.prototype.setName = function(v){
	DOMHelper.setAttr(this.getNode(),"name",v);
}

/**
 * @public
 */

Control.prototype.getName = function(){
	return DOMHelper.getAttr(this.getNode(),"name");
}

/**
 * @public
 * @param {string} v 
 */
Control.prototype.setTabIndex = function(v){
	DOMHelper.setAttr(this.getNode(),"tabindex",v);
}
/**
 * @public
 */
Control.prototype.getTabIndex = function(){
	return DOMHelper.getAttr(this.getNode(),"tabindex");
}

/**
 * @public
 * @param {boolean} v 
 */
Control.prototype.setEnabled = function(v){
	if(!this.getEnableLock()){
		if (v){
			DOMHelper.delAttr(this.getNode(),this.ATTR_DISABLED);
		}
		else{
			DOMHelper.setAttr(this.getNode(),this.ATTR_DISABLED,this.ATTR_DISABLED);
		}
		
		return true;
		
	}else{
		return false;
	}
}

/**
 * locks agains setEnabled
 * @public
 * @param {boolean} v 
 */
Control.prototype.setEnableLock = function(v){
	this.m_enableLock = v;
}

Control.prototype.getEnableLock = function(){
	return this.m_enableLock;
}	

/**
 * @public
 * @returns {boolean} v 
 */
Control.prototype.getEnabled = function(){
	return !(DOMHelper.getAttr(this.getNode(),this.ATTR_DISABLED));
}

/**
 * @public
 * @param {boolean} v 
 */
Control.prototype.setVisible = function(v){
	if (v){
		DOMHelper.delClass(this.m_node,this.CLASS_INVISIBLE);
	}
	else{
		DOMHelper.addClass(this.m_node,this.CLASS_INVISIBLE);
	}
}

/**
 * @public
 * @param {boolean} v 
 */
Control.prototype.setRequired = function(v){
	if (!v){
		DOMHelper.delAttr(this.m_node,this.ATTR_REQ);
	}
	else{
		DOMHelper.addAttr(this.m_node,this.ATTR_REQ,this.ATTR_REQ);
	}
}

/**
 * @public
 * @returns {boolean}
 */
Control.prototype.getRequired = function(){
	return (DOMHelper.getAttr(this.m_node,this.ATTR_REQ)!=undefined);
}
/**
 * @public
 * @returns {boolean}
 */
Control.prototype.getVisible = function(){
	return !DOMHelper.hasClass(this.m_node,this.CLASS_INVISIBLE);
}

/**
 * @public
 * @returns {DOMNode}
 */
Control.prototype.getNode = function(){
	return this.m_node;
}

Control.prototype.appendToNode = function(parent){
	parent.appendChild(this.m_node);
}

/**
 * @public
 * @param {string} val - Sets text value of the node or adds child if it is an HTML object
 */
Control.prototype.setValue = function(val){
	if(val instanceof HTMLDocument){
	console.log(val)
		this.m_node.parentNode.appendChild(val.body)
	}else{
		this.setText(val);
	}
	this.valueChanged();
}

Control.prototype.getValue = function(){
	return this.getText();
}

Control.prototype.toDOMBefore = function(node){
	this.nodeToDOM(node.parentNode,node);
	this.eventsToDOM();		
}

Control.prototype.toDOMAfter = function(node){
	this.nodeToDOM(node.parentNode,node.nextSibling);
	/*
	var sibl = node.nextSibling;
	var p = node.parentNode;
	if (p && sibl){
		p.insertBefore(this.m_node,sibl);
	}
	else if (p){
		p.appendChild(this.m_node);
	}
	*/	
	this.eventsToDOM();
}
Control.prototype.toDOMInstead = function(node){
	node.parentNode.replaceChild(this.m_node,node);
	this.eventsToDOM();
}

Control.prototype.toDOM = function(parent){
	this.nodeToDOM(parent);
	this.eventsToDOM();	
	this.subscribeToSrvEvents(this.m_srvEvents);
}

Control.prototype.setAttr = function(name,value){
	if (value!=undefined){
		DOMHelper.setAttr(this.m_node,name,value);
	}	
}

Control.prototype.getAttr = function(name){
	return DOMHelper.getAttr(this.m_node,name);
}
Control.prototype.delAttr = function(name){
	DOMHelper.delAttr(this.m_node,name);
}
Control.prototype.setClassName = function(className){
	if (className && className.length>0){
		//var cl = this.m_node.className || "";
		//this.m_node.className = cl + ((cl=="")? "":" ")+ className;
		DOMHelper.addClass(this.m_node,className);
		//this.setAttr("class",className);
	}
}
Control.prototype.getClassName = function(){
	return this.m_node.className;
}
Control.prototype.delDOM = function(){
	DOMHelper.delNode(this.m_node);
	this.unsubscribeFromSrvEvents();
}
Control.prototype.setWinObj = function(winObj){
	this.m_winObj = winObj;
}
Control.prototype.getWinObj = function(winObj){
	return this.m_winObj;
}

Control.prototype.getWinObjDocument = function(){
	if (this.m_winObj && this.m_winObj.getWindowForm){
		return this.m_winObj.getWindowForm().document;
	}
	else{
		return window.document;
	}
}

Control.prototype.setEvents = function(e){
	this.m_events = e;
	this.m_eventFuncs = {};
}
Control.prototype.getEvents = function(){
	return this.m_events;
}
Control.prototype.getEvent = function(id){
	return this.m_events? this.m_events[id]:null;
}
Control.prototype.fireEvent = function(id,e){
	if(this.m_events[id]){
		this.m_events[id](e);
	}
}



Control.prototype.focus = function(){
	if (this.m_node.focus && this.getEnabled()){
		this.m_node.focus();
	}
}

Control.prototype.serialize= function(o){
	var o = o||{};
	o.value = this.getValue();
	for (var a in this.m_node.attributes){
		if (typeof this.m_node.attributes[a]!="object"
		&&typeof this.m_node.attributes[a]!="function"){
			o[a] = this.m_node.attributes[a];
		}
	}
	return CommonHelper.serialize(o);
}

Control.prototype.unserialize= function(str){
	var o = CommonHelper.unserialize(str);
	for (var a in o){
		if (a=="value")continue;
		this.m_node.attributes[a] = o[a];
	}	
	if (o.value){
		this.setValue(o.value);
	}
	return o;
}

Control.prototype.getHtml = function(){
	return this.m_node.innerHTML;
}
Control.prototype.setHtml = function(v){
	if (v){
		this.m_node.innerHTML = v;
		this.m_html = v;
	}
}

Control.prototype.getTemplateHTML = function(t, nId){
	//var v_opts = (this.m_templateOptions)? CommonHelper.clone(this.m_templateOptions):{};
	var v_opts = {};
	CommonHelper.merge(v_opts, this.m_templateOptions);
	v_opts.id = ( (nId)? nId:this.getId() );
	v_opts.bsCol = window.getBsCol();
	v_opts.widthType = window.getWidthType();
	
	Mustache.parse(t);
	return Mustache.render(t,v_opts);
	
	/*var tm = Mustache.render(t,v_opts);
	console.log("Control.prototype.getTemplateHTML ID="+this.getId())
	console.log(tm)
	return tm;
	*/
	//return DOMHelper.parseTemplate.call(this,t,(nId)? nId:this.getId());
}

Control.prototype.setTemplate = function(v){
	if (v){
		this.m_template = v;
		this.setHtml(this.getTemplateHTML(v));
	}
}

Control.prototype.updateHTML = function(){
	this.setTemplate(this.m_template);
}

Control.prototype.getTemplateOptions = function(){
	return this.m_templateOptions;
}
Control.prototype.setTemplateOptions = function(v){
	this.m_templateOptions = v;
}

Control.prototype.getOnValueChange = function(){
	return this.m_onValueChange;
}
Control.prototype.setOnValueChange = function(v){
	this.m_onValueChange = v;
}

Control.prototype.setLocked = function(v){
	if (v){
		this.m_beforeLockEnabled = this.getEnabled();
	}
	/*
	if (v){
		this.m_beforeLockEnabled = this.getEnabled();
		if (this.m_beforeLockEnabled){
			this.setEnabled(false);
		}
	}
	else if (this.m_beforeLockEnabled){
		this.setEnabled(true);
	}
	*/
	if ( (v && this.m_beforeLockEnabled) || (!v && this.m_beforeLockEnabled) ){
		//this.setEnabled(!v);
		if (!v){
			DOMHelper.delAttr(this.getNode(),this.ATTR_DISABLED);
		}
		else{
			DOMHelper.setAttr(this.getNode(),this.ATTR_DISABLED,this.ATTR_DISABLED);
		}
	}
	
	
	this.m_locked = v;
}

Control.prototype.getLocked = function(){
	return this.m_locked;
}


Control.prototype.setHidden = function(v){
	if(v){
		this.hide();
	}
	else{
		this.show();
	}
}

Control.prototype.hide = function(){
	this.m_oldStyleDisplay = this.m_node.style.display;
	this.m_node.style.display = "none";
}
Control.prototype.show = function(display){
	if(display){
		this.m_node.style.display = display;
	}
	else if(this.m_oldStyleDisplay){
		this.m_node.style.display = this.m_oldStyleDisplay;	
	}
	else{
		this.m_node.style.display = "";
	}
}

Control.prototype.setSrvEvents = function(v){	
	this.m_srvEvents = v;
}

Control.prototype.getSrvEvents = function(){
	return this.m_srvEvents;
}


Control.prototype.getSrvEventsId = function(){
	return this.m_srvEventsId;
}

Control.prototype.unsubscribeFromSrvEvents = function(){
	if(this.m_srvEventsId && window.getApp().getAppSrv()){
		console.log("Control.prototype.unsubscribeFromSrvEvents")
		window.getApp().getAppSrv().unsubscribe(this.m_srvEventsId);
		this.m_srvEventsId = undefined;
	}
}

/**
 * @param {object} srvEvents {
 *		events:[
 *			onOpen:function,
 *			onEvent:function,
 *			onSubscribed:function,
 *			onError:function,
 *			onClose:function
 *		]
 *	}
 */
Control.prototype.subscribeToSrvEvents = function(srvEvents){
	if(srvEvents && srvEvents.events && srvEvents.events.length && srvEvents.onEvent && window.getApp().getAppSrv()){
		//console.log("Control.prototype.subscribeToSrvEvents")
		this.m_srvEventsId = window.getApp().getAppSrv().subscribe(srvEvents);
	}
}

