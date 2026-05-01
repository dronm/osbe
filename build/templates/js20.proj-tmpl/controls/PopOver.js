/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2017

 * @class
 * @classdesc
 
 * @param {string} id - Object identifier
 * @param {object} options
 * @param {string} options.caption
 * @param {array} options.contentElements 
 * @param {function} options.onHide 
 * @param {int} options.zIndex
 */
function PopOver(id,options){
	options = options || {};	
	
	options.template = window.getApp().getTemplate("PopOver");
	
	options.addElement = function(){
		this.addElement(new Control(id+":title","DIV",{
			"value":options.caption
		}));
		this.addElement(new ControlContainer(id+":content","DIV",{
			"elements":options.contentElements
		}));	
	}
	
	this.m_onHide = options.onHide;
	
	this.m_zIndex = options.zIndex || "2";
	
	PopOver.superclass.constructor.call(this,id,"TEMPLATE",options);
	
	var self = this;

	this.m_evHide = function(event){
	//console.log("PopOver.m_evHide")
		if (self.m_ieHack){
			self.m_ieHack--;
			return;
		}
		event = EventHelper.fixMouseEvent(event);				
		
		if (event.pageX<self.m_posMinX || event.pageX>self.m_posMaxX
		|| event.pageY<self.m_posMinY || event.pageY>self.m_posMaxY){
			
			var el = event.target;
			var other_popover = false;
			el = el.parentNode;
			while(el){
				if (DOMHelper.hasClass(el,"popover") || DOMHelper.hasClass(el,"datepicker")){
					other_popover = true;
					break;
				}
				el = el.parentNode;
			}
			//console.log("ID="+self.getId()+" other_popover="+other_popover)
			
			//out of bounds
			if (!other_popover && self.getVisible()){
			//console.log("PopOver.m_evHide setVisible(false)")
				self.setVisible(false);
				event.stopPropagation();					
			}
		}
	}
	
}
extend(PopOver,ControlContainer);

/* Constants */


/* private members */

/* protected*/


/**
 * @public
 * @param {Event} e
 * @param {DOMNode} fixToElement
 */
PopOver.prototype.setPosition = function(e,fixToElement){
        var x, y;
        if (fixToElement){
		var rect = fixToElement.getBoundingClientRect();
		y = rect.top+$(fixToElement).outerHeight();
		x = rect.left; 
	}
	else{
		x = e.pageX;
		y = e.pageY;	
	}        
        
        /*        
        if (fixToElement){
		var rect = fixToElement.getBoundingClientRect();
		y = rect.top+$(fixToElement).outerHeight();
		x = rect.left; 
	}
	else{        
		if (window.opera) {
		    x = e.clientX;
		    y = e.clientY;
		} else if (document.all) {
		    x = document.body.scrollLeft + event.clientX;
		    y = document.body.scrollTop + event.clientY;
		} else if (document.layers || document.getElementById) {
		    x = e.pageX;
		    y = e.pageY;
		}
	}
	*/
	var vp_w = DOMHelper.getViewportWidth();	
	var n = this.getNode();	
	if(n.clientWidth + x > vp_w){
		//adjust!
		x = vp_w - n.clientWidth - 10;
	}
	//console.log("WindowWidth="+vp_w+", clientWidth="+n.clientWidth+" left="+x)
	n.style.position = "absolute";
        n.style.top  = y + "px";
        n.style.left = x + "px";
        n.style.zIndex = this.m_zIndex;
        n.style.display = "block";        
}

PopOver.prototype.setVisible = function(v){
	PopOver.superclass.setVisible.call(this,v);
	if (v){
		this.addClick();
	}
	else{
		this.delClick();
		if (this.m_onHide){
			this.m_onHide();
		}
	}
}

PopOver.prototype.addClick = function(){
	this.m_ieHack = (CommonHelper.isIE())? 1:0;
	EventHelper.add(document,"click",this.m_evHide,true);
}

PopOver.prototype.delClick = function(){
	EventHelper.del(document,"click",this.m_evHide,true);
}

PopOver.prototype.toDOM = function(e,fixToElement){
	
	PopOver.superclass.toDOM.call(this,document.body);
	
	this.setPosition(e,fixToElement);

	var rect = this.m_node.getBoundingClientRect();
	this.m_posMinY = rect.top;
	this.m_posMaxY = rect.top + $(this.m_node).outerHeight();
	this.m_posMinX = rect.left;
	this.m_posMaxX = rect.left + $(this.m_node).outerWidth();	
	this.m_zIndex = parseInt($(this.m_node).css("z-index"),10);
		
	this.addClick();
	
}

PopOver.prototype.delDOM = function(){
	PopOver.superclass.delDOM.call(this);
	
	this.delClick();	
}
