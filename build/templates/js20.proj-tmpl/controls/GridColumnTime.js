/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2019
 
 * @class
 * @classdesc
 
 * @extends GridColumnDate
 * @requires controls/GridColumnDate.js
 
 * @param {string} id - html tag id
 * @param {string} [options.dateFormat]
 */

function GridColumnTime(options){
	options = options || {};	
	
	this.m_dateFormat = options.dateFormat ||
		window.getApp().getTimeFormat() ||
		this.DEF_FORMAT;
	
	GridColumnTime.superclass.constructor.call(this,options);
}
extend(GridColumnTime,GridColumnDate);

/* Constants */

GridColumnDateTime.prototype.DEF_FORMAT = "H:i:s";

/* private members */

/* protected*/

