 /**	
  * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2022
 
  * @extends 
  * @requires core/extend.js
  * @requires controls/.js     
 
  * @class
  * @classdesc
  
  * @param {string} id - Object identifier
  * @param {object} options
  */
 function EditFloatPeriodValue(id,options){
 	options = options || {};	
 	
	var self = this;
	options.inputEnabled = false;
	
	options.cmdClear = (options.cmdClear==undefined)? options.cmdClear:false;
	options.buttonEditPeriodValues = new ButtonEditPeriodValues(id+":btn_perVals",{
		"editControl":this,
		"enabled":true,
		"periodOptions":options.periodOptions
	});
	this.m_buttonEditPeriodValues = options.buttonEditPeriodValues;
	
 	EditFloatPeriodValue.superclass.constructor.call(this,id,options);
 }
 //ViewObjectAjx,ViewAjxList
 extend(EditFloatPeriodValue,EditFloat);
 
 /* Constants */
 
 
 /* private members */
 
 /* protected*/
 
 
 /* public methods */
/*
 EditFloatPeriodValue.prototype.setInputEnabled = function(en){
 	console.log(" EditFloatPeriodValue.prototype.setInputEnabled to "+en)
 	EditFloatPeriodValue.superclass.setInputEnabled.call(this, false);
 }

 EditFloatPeriodValue.prototype.setEnabled = function(en){
 	console.log(" EditFloatPeriodValue.prototype.setEnabled to "+en)
 	EditFloatPeriodValue.superclass.setEnabled.call(this,en);
 }
 */
 EditFloatPeriodValue.prototype.addButtonControls = function(){
	if (this.m_buttonOpen) this.m_buttons.addElement(this.m_buttonOpen);
	if (this.m_buttonSelect) this.m_buttons.addElement(this.m_buttonSelect);
	if (this.m_buttonClear) this.m_buttons.addElement(this.m_buttonClear);
	
	if (this.m_buttonEditPeriodValues) this.m_buttons.addElement(this.m_buttonEditPeriodValues);
}

