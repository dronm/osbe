/* Copyright (c) 2012 
	Andrey Mikhalevich, Katren ltd.
*/
/*	
	Description
*/
//ф
/** Requirements
  * @requires common/functions.js
  * @requires common/EventHandler.js
  * @requires controls/ButtonClear.js
*/

/* constructor */
function ButtonClearObject(id,options){
	options = options || {};
	options.attrs = options.attrs||{};
	options.attrs.title = options.attrs.title||"очистить";	
	options.onClick = options.onClick ||
		function(event){
			event = EventHandler.fixMouseEvent(event);
			//var node = event.target.parentNode.parentNode.previousSibling;
			//var node = DOMHandler.getParentByTagName(event.target,"input");
			var node = nd(options.controlId);
			node.value="";
			node.focus();
			for (var i=0;i<options.keyFieldIds.length;i++){
				DOMHandler.setAttr(node,"fkey_"+options.keyFieldIds[i],"null");
				DOMHandler.setAttr(node,"last_fkey_"+options.keyFieldIds[i],"null");
			}
	};
	options.attrs = options.attrs || {};
	options.attrs.title = options.attrs.title||options.attrs.hint||
		this.DEF_HINT;

	ButtonClearObject.superclass.constructor.call(
		this,id,options);
}
extend(ButtonClearObject,ButtonClear);

ButtonClearObject.prototype.DEF_HINT = "очистить";
