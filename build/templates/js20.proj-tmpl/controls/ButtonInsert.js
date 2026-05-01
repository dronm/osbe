/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>
 
 * @class
 * @classdesc Button for controls for inserting new element
 
 * @extends Control
  
 * @requires core/DOMHelper.js
 * @requires core/EventHelper.js
 * @requires controls/Control.js

 * @param {string} id Object identifier
 * @param {namespace} options  
*/
function ButtonInsert(id,options){
	options = options || {};
	
	options.glyph = "glyphicon-plus";
	
	var self = this;
	
	this.m_editWinClass = options.editWinClass;
	this.m_editViewOptions = options.editViewOptions;
	
	options.onClick = options.onClick || 
			function(event){
				self.doInsert(EventHelper.fixMouseEvent(event));
			};

	ButtonInsert.superclass.constructor.call(this,id,options);
}
extend(ButtonInsert, ButtonCtrl);

ButtonInsert.prototype.m_editForm;

ButtonInsert.prototype.doInsert = function(e){
	if(!this.m_editWinClass){
		throw new Error("editWinClass is not defined");
	}
	this.m_editForm = new this.m_editWinClass({
		"id":CommonHelper.uniqid(),
		"params":{
			"cmd":"insert"
			,"editViewOptions": this.m_editViewOptions
		}
	});
	this.m_editForm.open();
}
