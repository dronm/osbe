/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>
 
 * @class
 * @classdesc Vasic button visual control
 
 * @extends Control
  
 * @requires core/DOMHelper.js
 * @requires core/EventHelper.js
 * @requires controls/Control.js

 * @param {string} id Object identifier
 * @param {object} options  
 * @param {string} [options.tagName=this.DEF_TAG_NAME] 
 * @param {string} [options.className=this.DEF_CLASS]
 * @param {string} options.caption
 * @param {string} options.glyph alias of options.imageClass
 * @param {string} options.glyphPopUp    
 * @param {function} options.onClick 
 * @param {string} options.imageClass alias of  options.glyph
 * @param {string} [options.imageFontName=this.DEF_IMG_FONT_NAME]
 * @param {string} [options.imagePosition="before"]
 * @param {string} [options.imageTag=this.IMAGE_TAG]
*/
function Button(id,options){	
	options = options || {};
	
	this.m_colorClass = options.colorClass || this.DEF_COLOR_CLASS; 
	options.className = options.className || this.DEF_CLASS;

	options.attrs = options.attrs || {};
	
	options.title = options.title || options.attrs.title || options.hint || this.DEF_TITLE;
	
	this.m_imageTag = options.imageTag || this.IMAGE_TAG;
	this.m_imagePosition = options.imagePosition || this.IMAGE_POS;
	
	Button.superclass.constructor.call(this,id, (options.tagName || this.DEF_TAG_NAME), options);
	
	this.setCaption(options.caption);
	this.setImageFontName(options.imageFontName || this.DEF_IMG_FONT_NAME);
	this.setImageClass(options.imageClass || options.glyph || options.attrs.glyph);
	this.setGlyphPopUp(options.glyphPopUp);
	
	var self = this;
	this.m_clickFunc = function(e){
		if (self.getEnabled() && self.m_onClick){
			e = EventHelper.fixMouseEvent(e);
			self.m_onClick.call(self,e);
		}
	}
	
	if (options.onClick!=undefined){
		this.setOnClick(options.onClick);
	}		
}
extend(Button,Control);

/* constants */
Button.prototype.DEF_TAG_NAME = "DIV";
Button.prototype.DEF_CLASS = "btn btn-default";
Button.prototype.DEF_COLOR_CLASS = "btn-default";
Button.prototype.DEF_TITLE;
Button.prototype.DEF_IMG_FONT_NAME = "glyphicon";

Button.prototype.IMAGE_TAG = "I";
Button.prototype.IMAGE_POS = "before";

/* private members */
Button.prototype.m_imageClass;
Button.prototype.m_glyphPopUp;
Button.prototype.m_colorClass;
Button.prototype.m_imageFontName;


/* public methods */
Button.prototype.setCaption = function(caption){
	if (caption){
		if (this.m_node.childNodes.length==0){
			this.m_node.appendChild(document.createTextNode(caption));
		}
		else{
			//this.m_node.childNodes[0].nodeValue = caption;
			DOMHelper.setText(this.m_node,caption);
		}
	}
}
Button.prototype.getCaption = function(){
	return DOMHelper.getText(this.m_node);
	//(this.m_node && this.m_node.childNodes && this.m_node.childNodes[0])? this.m_node.childNodes[0].nodeValue:"";
}

Button.prototype.getGlyph = function(){
	return this.m_imageClass;
}
Button.prototype.setGlyph = function(v){
	this.setImageClass(v);
}

Button.prototype.getImageFontName = function(){
	return this.m_imageFontName;
}
Button.prototype.setImageFontName = function(v){
	this.m_imageFontName = v;
}

Button.prototype.getImageClass = function(){
	return this.m_imageClass;
}
Button.prototype.setImageClass = function(v){
	this.m_imageClass = v;
	if (v){
		var fn = this.getImageFontName();
		var n;
		if (this.m_node){
			var ar = DOMHelper.getElementsByAttr(fn,this.m_node,"class",true,this.m_imageTag);
			if (ar && ar.length){
				n = ar[0];
				n.className = fn+" "+v;
			}
		}
		if (!n){
			n = document.createElement(this.m_imageTag);
			n.className = (v.indexOf(fn+"-")>=0)? (fn+" "+v) : v;
			if(this.m_imagePosition=="after"){
				this.m_node.appendChild(n);
				//n.style = "margin-right: 3px;";
			}
			else{
				var tn = DOMHelper.firstChildElement(this.m_node,3);
				if(tn){
					tn.parentNode.insertBefore(n,tn);
				}
				else{
					this.m_node.appendChild(n);
				}
				//n.style = "margin-left: 3px;";
			}
			//
			//
			//this.m_node.parentNode.insertBefore(n,DOMHelper.firstChildElement(this.m_node,3));
		}		
	}
}

Button.prototype.getGlyphPopUp = function(){
	return this.m_glyphPopUp;
}
Button.prototype.setGlyphPopUp = function(v){
	this.m_glyphPopUp = v;
}

Button.prototype.setOnClick = function(onClick){
	var self = this;
	this.m_onClick = function(e){
		//e = EventHelper.fixMouseEvent(e);
		onClick.call(self,e);
	}
	this.addClick();
}
Button.prototype.getOnClick = function(){
	return this.m_onClick;
}
Button.prototype.addClick = function(){
	var self = this;
	EventHelper.add(this.m_node,"click", this.m_clickFunc,false);
}
Button.prototype.removeClick = function(){
	var self = this;
	EventHelper.del(this.m_node,"click", this.m_clickFunc,false);
}
Button.prototype.click = function(){
	this.m_clickFunc.call(this,null);
}

Button.prototype.getColorClass = function(){
	return this.m_colorClass;
}


