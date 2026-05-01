/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2022

 * @extends GridColumn
 * @requires controls/GridColumn.js
 * @requires core/AppWin.js 

 * @class
 * @classdesc

 * @param {object} options
 * @param {string} options.dateFormat
 */
function GridColumnPassword(options){
	options = options || {};	
	
	this.m_intervalFormat = options.intervalFormat ||this.DEF_FORMAT;
	
	GridColumnPassword.superclass.constructor.call(this,options);
}
extend(GridColumnPassword,GridColumn);

/* Constants */

/* private members */

/* protected*/


/* public methods */
GridColumnPassword.prototype.formatVal = function(v){
	return "******";
}
