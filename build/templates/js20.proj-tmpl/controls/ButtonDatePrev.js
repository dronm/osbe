/**
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2024
 
 * @class
 * @classdesc button with calculator

 * @extends ButtonCtrl 

 * @requires core/extend.js
 * @requires controls/ButtonCtrl.js     
  
 * @param {string} id - html tag id
 * @param {namespase} options
 * @param {string} [options.glyph=this.DEF_GLYPH]
 * @param {Edit} options.editControl input control
 */
function ButtonDatePrev(id,options){
	options = options || {};
	
	options.glyph = options.glyph || this.DEF_GLYPH;
	options.title = options.title || this.DEF_HINT;
	
	var self = this;
	
	options.onClick = options.onClick || 
			function(e){
				self.onClick(e);
			};
	ButtonDatePrev.superclass.constructor.call(this,id,options);
}
extend(ButtonDatePrev,ButtonCtrl);

ButtonDatePrev.prototype.DEF_GLYPH = "glyphicon-chevron-left";

ButtonDatePrev.prototype.onClick = function(e){
	let ctrl = this.getEditControl();
	if(!ctrl){
		return;
	}
	let val = ctrl.getValue();
	if(!val || !DateHelper.isValidDate(val)){
		return;
	}
	val.setDate(val.getDate() - 1);
	ctrl.setValue(val);
	ctrl.onSelectValue();
}
