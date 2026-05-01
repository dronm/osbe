/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>,2012

 * @class
 * @classdesc Bsic control button

 * @extends Button

 * @requires core/extend.js  
 * @requires controls/Button.js

 * @param {string} id Object identifier
 * @param {object} options
 * @param {Edit} options.editControl
*/
function ButtonCtrl(id,options){
	options = options || {};
	// options.className = (options.className!=undefined)? options.className : "btn btn-default";
	options.className = options.className || this.DEF_CLASS;
	
	this.setEditControl(options.editControl);
	
	ButtonCtrl.superclass.constructor.call(this,id,options);
}
extend(ButtonCtrl,Button);

ButtonCtrl.prototype.m_editControl;

ButtonCtrl.prototype.setEditControl = function(v){
	this.m_editControl = v;
}
ButtonCtrl.prototype.getEditControl = function(){
	return this.m_editControl;
}
