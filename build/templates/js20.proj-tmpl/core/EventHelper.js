/* Copyright (c) 2010 
	Andrey Mikhalevich, Katren ltd.
*/
/*
	class	
	EventHelper
*/
/**
*/

var EventHelper = {
	add:function(obj, evType, fn, capture){
		if (!fn)return;
		if(typeof(obj)=="string"){
			obj = document.getElementById(obj);
		}		
		if (CommonHelper.isIE()){
			$(obj).on(evType,fn);
		}
		else{
			if (obj && obj.addEventListener){
				obj.addEventListener(evType, fn, capture);
				return true;
			} else if (obj && obj.attachEvent){
				var r = obj.attachEvent("on"+evType, fn);
				return r;
			} else {
				return false;
			}
		}
	},
	del:function(obj, evType, fn, useCapture){
		if(typeof(obj)=="string"){
			obj = document.getElementById(obj);
		}		
		if (CommonHelper.isIE()){
			$(obj).off(evType,fn);
		}
		else{
			if (obj && obj.removeEventListener){
				obj.removeEventListener(evType, fn, useCapture);
				return true;
			} else if (obj && obj.detachEvent){
				var r = obj.detachEvent("on"+evType, fn);
				return r;
			} else {
				throw new Error(this.DEL_ERR);
			}
		}
	},
	/*
		Mouse Event fixing
	*/
	fixMouseEvent:function(e){
		e = e || window.event;
		if (e.target===undefined) {
			  e.target = e.srcElement;
		}
		// добавить pageX/pageY для IE
		if ( e.pageX == null && e.clientX != null ) {
			var html = document.documentElement;
			var body = document.body;
			e.pageX = e.clientX + (html && html.scrollLeft || body && body.scrollLeft || 0) - (html.clientLeft || 0);
			e.pageY = e.clientY + (html && html.scrollTop || body && body.scrollTop || 0) - (html.clientTop || 0);
		}

		// добавить which для IE
		if (!e.which && e.button) {
			e.which = e.button & 1 ? 1 : ( e.button & 2 ? 3 : ( e.button & 4 ? 2 : 0 ) );
		}
		
		return (e);
	},
	fixKeyEvent:function(e){
		e = e || window.event;
		if (e.target===undefined) {
			  e.target = e.srcElement;
		}
		if (e.which == null && e.keyCode >= 32) { // IE
		    	e.char = String.fromCharCode(event.keyCode);
		}
		else if (e.which != 0 && e.charCode != 0 && e.which>=32){//others
			e.char = String.fromCharCode(e.which);
		}		
		/*
		var kc = (e.charCode) ? e.charCode:
			( (e.keyCode)? e.keyCode:e.which);
		if (e.keyCode!=kc && kc!=0){
			e.keyCode = kc;
		}
		if (kc >= 32){
			e.char = String.fromCharCode(kc);
		}
		*/
		return (e);
	},
	
	fixWheelEvent:function(e){
		e.delta = e.deltaY || e.detail || e.wheelDelta;
		return (e);
	},
	
	getWheelEventName:function(){
		var res;
		if ("onwheel" in document) {
			// IE9+, FF17+, Ch31+
			res = "wheel";
		} else if ("onmousewheel" in document) {
			// устаревший вариант события
			res = "mousewheel";
		} else {
			// Firefox < 17
			res = "MozMousePixelScroll";
		}	
		return (res);
	},
	
	addWheelEvent:function(obj, fn, capture){
		this.add(obj, this.getWheelEventName(), fn, capture);
	},
	delWheelEvent:function(obj, fn, capture){
		this.del(obj, this.getWheelEventName(), fn, capture);
	}
	,stopPropagation:function(e){
		if (e.preventDefault){
			e.preventDefault();
		}
		else if (e.stopPropagation){
			e.stopPropagation();
		}
		else {
			e.cancelBubble = true;
		}		
		return false;	
	}
	,fireEvent:function(element,eventStr){
		if ("createEvent" in document) {
		    var evt = document.createEvent("HTMLEvents");
		    evt.initEvent(eventStr, false, true);
		    element.dispatchEvent(evt);
		}
		else{
		    element.fireEvent("on"+eventStr);		
		}	
	}
};
