/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2023

 * @extends Control
 * @requires core/extend.js
 * @requires controls/Control.js     

 * @class
 * @classdesc
 
 * @param {string} id - Object identifier
 * @param {object} options
 * 
 * <span class="help-block hidden">
 *	<i class="position-left">
 *	</i>
 * </span>
 * 
 *	text-danger
 *	text-info
 *	text-muted
 *	text-primary
 *	text-success
 *	text-warning
 *
 */
function EditInfo(id,options){
	options = options || {};	
	
	options.visible = false;
	options.template = options.template || window.getApp().getTemplate("EditInfo");
	options.templateOptions = options.templateOptions || {};	
	
	options.templateOptions.TEXT_CLASS = options.templateOptions.TEXT_CLASS || "";	
	this.m_textClass = options.templateOptions.TEXT_CLASS;
	
	options.templateOptions.PICT_CLASS = options.templateOptions.PICT_CLASS || "";
	this.m_pictClass = options.templateOptions.PICT_CLASS;
	
	EditInfo.superclass.constructor.call(this, id, options.tagName || this.DEF_TAG, options);
}
//ViewObjectAjx,ViewAjxList
extend(EditInfo, Control);

/* Constants */
EditInfo.prototype.DEF_TAG = "SPAN";

/* private members */
EditInfo.prototype.m_textClass;
EditInfo.prototype.m_pictClass;

/* protected*/


/* public methods */

EditInfo.prototype.clear = function(){
	this.setValue("");
}

EditInfo.prototype.setValue = function(t){
	this.setText(t);
}

EditInfo.prototype.setText = function(val){
	if (!val || val.trim()==""){
		DOMHelper.hide(this.getNode());
	}else{
		DOMHelper.show(this.getNode());
	}
	var node;
	if (this.m_node.childNodes){
		for (var i=0;i<this.m_node.childNodes.length;i++){
			if (this.m_node.childNodes[i].nodeType==3){
				this.m_node.childNodes[i].parentNode.removeChild(this.m_node.childNodes[i]);
				break;
			}
		}
	}
	if (!node){
		node = document.createTextNode(val);
		DOMHelper.insertAfter(node, DOMHelper.firstChildElement(this.m_node));		
	}
	node.nodeValue = val;	
}

EditInfo.prototype.setTextClass = function(newClass){
	DOMHelper.swapClasses(this.m_node, newClass, this.m_textClass);
	this.m_textClass = newClass;
}
EditInfo.prototype.setPictClass = function(newClass){
	var pict = this.m_node.getElementsByTagName(this.DEF_PICT_TAG);
	if(!pict || !pict.length){
		return;
	}
	DOMHelper.swapClasses(pict[0], newClass, this.m_pictClass);
	this.m_pictClass = newClass;
}


