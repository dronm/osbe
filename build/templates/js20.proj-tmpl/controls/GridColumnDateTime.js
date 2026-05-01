/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2016
 
 * @class
 * @classdesc
 
 * @extends GridColumnDate
 * @requires controls/GridColumnDate.js
 
 * @param {string} id - html tag id
 * @param {string} [options.dateFormat]
 */

function GridColumnDateTime(options){
	options = options || {};	
	
	options.ctrlClass = options.ctrlClass || EditDateTime;
	options.ctrlOptions = options.ctrlOptions || {};
	
	options.ctrlOptions.editMask = options.ctrlOptions.editMask || options.editMask || window.getApp().getDateTimeEditMask() || this.DEF_EDIT_MASK;
	
	options.dateFormat = options.dateFormat ||
		window.getApp().getDateTimeFormat() ||
		this.DEF_FORMAT;
	//console.log("GridColumnDateTime dateFormat="+options.dateFormat)	
	GridColumnDateTime.superclass.constructor.call(this,options);
}
extend(GridColumnDateTime,GridColumnDate);

/* Constants */

GridColumnDateTime.prototype.DEF_FORMAT = "d/m/Y H:i:s";
GridColumnDateTime.prototype.DEF_EDIT_MASK = "99/99/9999 99:99:99";

/* private members */

/* protected*/

