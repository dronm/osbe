/**
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2016
 
 * @class
 * @classdesc Edit control clear value button

 * @extends ButtonCtrl 

 * @requires core/extend.js
 * @requires controls/ButtonCtrl.js     
  
 * @param {string} id - html tag id
 * @param {namespase} options
 * @param {Control} options.editControl
 
 * @param {function} options.onClear deprecated, not used, use Control.onReset instead
 */
function ButtonClear(id,options){
	options = options || {};
	options.glyph = "glyphicon-remove";
	
	this.m_onClear = options.onClear;
	
	var self = this;
	
	options.onClick = options.onClick || 
		function(event){
			self.getEditControl().reset();	
			
			if(this.m_onClear)this.m_onClear();
		};
			
	ButtonClear.superclass.constructor.call(this,id,options);
}
extend(ButtonClear,ButtonCtrl);
