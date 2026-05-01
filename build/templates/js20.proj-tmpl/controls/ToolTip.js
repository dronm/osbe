/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2012,2018
 
 * @class
 * @classdesc Basic visual control, maps html tag 
 
 * @requires core/DOMHelper.js
 * @requires core/EventHelper.js
 * @requires core/CommonHelper.js    
  
 * @param {object} options
 * @param {function} options.onHover
 * @param {DOMNode} options.node
 * @param {int} [options.wait=this.DEF_WAIT] ms to wait before show
 */

function ToolTip(options){
	this.m_onHover = options.onHover;
	this.m_node = options.node;
	
	var self = this;
	this.m_wait = options.wait || this.DEF_WAIT;
	/*
	this.m_selector = $(this.m_node);	
	this.m_selector.tooltip({
		"animation":true,
		"html":true,
		"placement":"auto",
		"title":content,
		"trigger":"manual"
	});
	*/
	this.m_evMouseOver = function(event){		
		event = EventHelper.fixMouseEvent(event);
		self.m_timeout = setTimeout(
		function(){
			self.m_out = false;
			self.m_onHover.call(self,event);
		},self.m_wait);
	};
	
	this.m_evMouseOut = function(event){
		self.m_out = true;
		if (self.m_timeout){
			clearTimeout(self.m_timeout);
			self.m_timeout = null;		
		}
		self.remove();			
	}

	this.addEvent();	
}

ToolTip.prototype.DEF_WAIT = 3000;

ToolTip.prototype.popup = function(content,options){
	options = options||{};
	this.m_active = true;
	tooltip.show(content,options.width,options.title,
		options.className,options.event);
	//this.m_selector.tooltip("show");
	if (this.m_out){
		this.remove();
	}
}

ToolTip.prototype.remove = function(){	
	tooltip.hide();
	//this.m_selector.tooltip("hide");
	this.m_active = false;
}
ToolTip.prototype.getWait = function(){	
	return this.m_wait;
}
ToolTip.prototype.setWait = function(wait){	
	this.m_wait = wait;
	this.removeEvent();	
	if (wait>0){
		this.addEvent();	
	}
}
ToolTip.prototype.addEvent = function(){	
	EventHelper.add(this.m_node,"mouseover",
		this.m_evMouseOver,false);
	EventHelper.add(this.m_node,"mouseout",
		this.m_evMouseOut,false);		
}
ToolTip.prototype.removeEvent = function(){	
	EventHelper.del(this.m_node,"mouseover",
		this.m_evMouseOver,false);
	EventHelper.del(this.m_node,"mouseout",
		this.m_evMouseOut,false);		
}

var tooltip=function(){
	var id = 'tt';
	var top = 3;
	var left = 3;
	var maxw = 300;
	var speed = 10;
	var timer = 20;
	var endalpha = 95;
	var alpha = 0;
	var tt,c,b,h,te;
	var ie = document.all ? true : false;
	return{
		show:function(v,w,title,cl,event){			
			tt = document.getElementById(id);
			if(tt == null){
				tt = document.createElement("div");
				tt.setAttribute("id",id);				
				tt.className = "popover popover-tip top"+((cl)? " "+cl:"");
				tt.setAttribute("role","tooltip");
				tt.style.display = "none";
				//tt.setAttribute('style',"width:500px;");
				
				/*
				var t = document.createElement('div');
				t.className = "arrow";
				tt.appendChild(t);
				*/
				
				//title
				te = document.createElement('h3');
				te.className = "popover-title";					
				if (title){
					tt.appendChild(te);
				}	
				
				c = document.createElement('div');
				c.setAttribute('id',id + 'cont');				
				c.className = "popover-content";				
				tt.appendChild(c);
				
				document.body.appendChild(tt);
				tt.style.opacity = 0;
				tt.style.filter = 'alpha(opacity=0)';				
			}
			
			if (title){
				te.innerHTML = title;
			}
			if(tt.offsetWidth > maxw){
				tt.style.width = maxw + "px";
			}
			h = parseInt(tt.offsetHeight) + top;
			if (event){
				this.pos(event);
			}
						
			//document.onmousemove = this.pos;
			EventHelper.add(document,"mousemove",this.pos);
			tt.style.display = "block";
			c.innerHTML = v;
			tt.style.width = w ? w + "px" : "auto";
			
			clearInterval(tt.timer);
			tt.timer = setInterval(function(){
				tooltip.fade(1);
			},timer);
		},
		pos:function(e){
			var u = ie ? e.clientY + document.documentElement.scrollTop : e.pageY;
			var l = ie ? e.clientX + document.documentElement.scrollLeft : e.pageX;
			
			tt.style.top = (u - h) + "px";
			tt.style.left = (l + left) + "px";
			//console.log("y="+tt.style.top+" x="+tt.style.left);
		},
		fade:function(d){
			if (!tt){
				return;
			}
			var a = alpha;
			if((a != endalpha && d == 1) || (a != 0 && d == -1)){
				var i = speed;
				if(endalpha - a < speed && d == 1){
					i = endalpha - a;
				}else if(alpha < speed && d == -1){
					i = a;
				}
				alpha = a + (i * d);
				tt.style.opacity = alpha * .01;
				tt.style.filter = 'alpha(opacity=' + alpha + ')';
			}else{
				clearInterval(tt.timer);
				if(d == -1){
					tt.style.display = "none";
					//tt.parentNode.removeChild(tt);
					EventHelper.del(document,"mousemove",this.pos);
				}
			}
		},
		hide:function(){
			if (tt){
				clearInterval(tt.timer);
				tt.timer = setInterval(function(){
					tooltip.fade(-1);
				},timer);
			}
		}
	};
}();
