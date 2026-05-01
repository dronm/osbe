/*
  PopUpMenu.js - simple JavaScript popup menu library.
  Copyright (C) 2009 Jiro Nishiguchi <jiro@cpan.org> All rights reserved.
  This is free software with ABSOLUTELY NO WARRANTY.
  You can redistribute it and/or modify it under the modified BSD license.
  Usage:
    var popup = new PopUpMenu();
	
*/
function PopUpMenu(options) {	
	options = options || {};
	
	this.items  = [];
	this.width  = 0;
	this.height = 0;
	
	this.m_caption = options.caption;
	
	var self = this;
	this.m_evShow = function(e){
		e = EventHelper.fixMouseEvent(e);
		self.show.call(self, e);
		if (e.preventDefault){
			e.preventDefault();
		}
		return false;	
	};
	
	if(options.elements && Array.isArray(options.elements)){
		for(var i=0;i<options.elements.length;i++){
			if (typeof(options.elements[i])=="string"){
				this.addSeparator();
			}
			else if (options.elements[i] instanceof Button){
				this.addButton(options.elements[i]);
			}
			else if(options.elements[i]){
				//action object
				this.add(options.elements[i]);
			}
		}
	}
	
	/*
	this.m_evHide = function(e){
		self.hide.call(self);
	};
	*/
	/*
	this.m_evClick = function(_callback){
                self.hide();
                _callback(self.target);
	};
	*/
}
PopUpMenu.prototype.SEPARATOR = 'PopUpMenu.SEPARATOR';
PopUpMenu.prototype.current = null;
/*
PopUpMenu.prototype.setSize = function(width, height) {
        this.width  = width;
        this.height = height;
        if (this.element) {
            var self = this;
            with (this.element.style) {
                if (self.width)  width  = self.width  + 'px';
                if (self.height) height = self.height + 'px';
            }
        }
}
*/
PopUpMenu.prototype.unbind = function(){
	//EventHelper.del(document,"click",this.m_evHide,true);
	EventHelper.del(this.target,"contextmenu",this.m_evShow,true);
	if (this.element) {
		this.element.delDOM();
	}	
}

PopUpMenu.prototype.bind = function(element) {
	if (!this.items.length){
		return;
	}
	
	var self = this;
	if (!element) {
	    element = document;
	} else if (typeof element == 'string') {
	    element = document.getElementById(element);
	}
	this.target = element;
	EventHelper.add(this.target,"contextmenu",this.m_evShow,true);
		
	//EventHelper.add(document,"click",this.m_evHide,true);
}

/**
 * @param{object} action
 *		id
 *		onClick
 * 		image
 * 		glyph
 * 		caption
 * 		disabled  
 */
PopUpMenu.prototype.add = function(action) {
	this.items.push(action);
}

/**
 * @param{Button} btn
 */
PopUpMenu.prototype.addButton = function(btn) {
	this.items.push({
		caption: btn.getCaption() || btn.getAttr("title"),
		"name": btn.getName(),
		//image:btn.getImage(),
		glyph:(btn.getGlyphPopUp())? btn.getGlyphPopUp():btn.getGlyph(),
		onClick:btn.getOnClick()
	});
}

PopUpMenu.prototype.addSeparator = function() {
        this.items.push(PopUpMenu.SEPARATOR);
}
/*
PopUpMenu.prototype.setPos = function(e) {
        if (!this.element) return;
        if (!e) e = window.event;
        var x, y;
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
        this.element.getNode().style.top  = y + 'px';
        this.element.getNode().style.left = x + 'px';
}
*/
PopUpMenu.prototype.show = function(e,fixToElement) {
        if (this.current && this.current != this) return;
        this.current = this;
        if (this.element&&document.getElementById(this.element.getId())) {
            //this.setPos(e);
            //this.element.style.display = "block";
            this.element.setPosition(e,fixToElement);
            this.element.setVisible(true);
        } else {
            this.element = this.createMenu(this.items);
            //this.setPos(e);
            this.element.toDOM(e,fixToElement);
            //document.body.appendChild(this.element);
        }
}

PopUpMenu.prototype.hide = function() {
        this.current = null;
        //if (this.element) this.element.style.display = 'none';
        if (this.element) this.element.setVisible(false);
}

PopUpMenu.prototype.getVisible = function() {
        if (this.element) return this.element.getVisible();
}

PopUpMenu.prototype.createMenu = function(items) {
        var self = this;
        
        var menu_cont = [];
        for (var i = 0; i < items.length; i++) {
            var item;
            if (items[i] == PopUpMenu.SEPARATOR) {
                item = this.createSeparator();
            } else {
                item = this.createItem(items[i]);
            }
            menu_cont.push(item);
        }
        
        var menu = new PopOver(CommonHelper.uniqid(),{
        	"fixToElement":this.fixToElement,
        	"zIndex":"2005",
        	"attrs":{
        		"style":
        			( (self.width)? ("width:"+self.width+"px;"):"")
        			+
        			((self.height)? ("height:"+self.height+"px;"):"")
        	},
        	"caption":this.m_caption,
        	"contentElements":[
        		new ControlContainer(CommonHelper.uniqid(),"ul",{"elements":menu_cont,"className":"nav"})
        	]
        });
        return menu;
        /*
        var menu = document.createElement("div");
	menu.className = "popover";
	menu.setAttribute("role","tooltip");
	//panel pop_up_menu
	var menu_t = document.createElement("div");
	menu_t.className = "tooltip-arrow";
	var menu_cont = document.createElement("div");
	menu_cont.className = "popover-content";
		
        var menu_cont2 = document.createElement("ul");
	menu_cont2.className = "nav";
		
        //with (menu.style) {
            if (self.width)  menu.style.width  = self.width  + "px";
            if (self.height) menu.style.height = self.height + "px";
            //position   = 'absolute';
            //display    = 'block';
        //}
        for (var i = 0; i < items.length; i++) {
            var item;
            if (items[i] == PopUpMenu.SEPARATOR) {
                item = this.createSeparator();
            } else {
                item = this.createItem(items[i]);
            }
            menu_cont2.appendChild(item);
        }
        
	menu_cont.appendChild(menu_t);
	menu_cont.appendChild(menu_cont2);
	menu.appendChild(menu_cont);
        return menu;
        */
}

/**
 * @param{object} action
 *		id
 *		onClick
 * 		image
 * 		glyph
 * 		caption
 * 		disabled 
 */
PopUpMenu.prototype.createItem = function(item) {
        var self = this;
        
	var callback = item.onClick;
	
        var elem = new Control(null,"a",{
        	"attrs":{"href":"#","item_id":item.id},
        	"enabled":!item.disabled,
        	"className":"nav-link",
        	"events":{
        		"click":function(_callback){
					return function(e) {
		      				self.hide();
		      				e = EventHelper.fixMouseEvent(e);
		      				if(!e.target.getAttribute("disabled")||e.target.getAttribute("disabled")!="disabled"){
			      				var id = e.target.getAttribute("item_id");
			        			_callback(self.target,id? id:e);
			        		}
		    			};
        		}(callback)
        	}
        });
	if (item.glyph){
		var i = document.createElement("span");
		i.className="glyphicon "+item.glyph;
		elem.m_node.appendChild(i);
	}
        elem.m_node.appendChild(document.createTextNode(" "+item.caption));
        return new ControlContainer(null,"li",{
        	"enabled":!item.disabled,
        	"className":"nav-item",
        	"elements":[elem]
        });
        
        /*
	var elem_cont = document.createElement("li");
	elem_cont.className = "nav-item";
		
        var elem = document.createElement("a");		
	elem.setAttribute("href","#");
	var cl = "nav-link";
	if (item.disabled){
		cl+=" disabled";
	}
	elem.className = cl;
		
        var callback = item.onClick;
        
        EventHelper.add(elem, "click", function(_callback) {
            return function() {
                self.hide();
                _callback(self.target);
            };
        }(callback), true);
        
	if (item.image){
		var img = createImgElement(item.image.src,
					item.image.alt,
					item.image.h,
					item.image.w
		);
		elem.appendChild(img);
	}
	else if (item.glyph){
		var i = document.createElement("span");
		i.className="glyphicon "+item.glyph;
		elem.appendChild(i);
	}
        elem.appendChild(document.createTextNode(" "+item.caption));
	elem_cont.appendChild(elem);
		
        return elem_cont;
        */
}

PopUpMenu.prototype.createSeparator = function() {
	return new Control(null,"div",{"attrs":{
		"style":"borderTop='1px dotted #CCCCCC';fontSize='0px';height='0px';"
	}})
	/*
        var sep = document.createElement("div");
        with (sep.style) {
            borderTop = '1px dotted #CCCCCC';
            fontSize  = '0px';
            height    = '0px';
        }
        return sep;
        */
}
