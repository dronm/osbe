/**
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2016
 
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
function ButtonCalc(id,options){
	options = options || {};
	
	options.glyph = options.glyph || this.DEF_GLYPH;
	
	var self = this;
	
	options.onClick = options.onClick || 
			function(event){
				(new Calculator({"editControl":self.getEditControl()}).show());
			};
	ButtonCalc.superclass.constructor.call(this,id,options);
}
extend(ButtonCalc,ButtonCtrl);

ButtonCalc.prototype.DEF_GLYPH = "glyphicon-th";

