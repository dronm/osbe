/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2016

 * @extends GridColumn
 * @requires controls/GridColumn.js
 * @requires core/AppWin.js 

 * @class
 * @classdesc

 * @param {object} options
 * @param {string} options.dateFormat
 * @param {string} options.editMask 
 */
function GridColumnDate(options){
	options = options || {};	

	options.ctrlClass = options.ctrlClass || EditDate;
	options.ctrlOptions = options.ctrlOptions || {};
	
	this.m_dateFormat = options.dateFormat || options.ctrlOptions.dateFormat ||
		window.getApp().getDateFormat() || this.DEF_FORMAT;
	
	options.ctrlOptions.dateFormat = options.ctrlOptions.dateFormat || this.m_dateFormat;
	options.ctrlOptions.editMask = options.ctrlOptions.editMask || options.editMask || window.getApp().getDateEditMask() || this.DEF_EDIT_MASK;
	
	GridColumnDate.superclass.constructor.call(this,options);
	
	//console.log("GridColumnDate dateFormat="+this.m_dateFormat)
	//console.log(options.ctrlOptions.dateFormat)
	//console.log(options.ctrlOptions.editMask)
}
extend(GridColumnDate,GridColumn);

/* Constants */

GridColumnDate.prototype.DEF_FORMAT = "d/m/Y";
GridColumnDate.prototype.DEF_EDIT_MASK = "99/99/9999";

/* private members */

/* protected*/


/* public methods */
GridColumnDate.prototype.formatVal = function(v){
	var r = "";
	if(v&&typeof(v)=="string"){
		v = DateHelper.strtotime(v);
		//console.log("GridColumnDate.prototype.formatVal string given");
	}
	
	if(v&&typeof(v)=="object"){
		//console.log("GridColumnDate.prototype.formatVal this.m_dateFormat="+this.m_dateFormat)
		//console.log(v)
		r = DateHelper.format(v, this.m_dateFormat);
		//console.log("Res="+r)
	}
	
	return r;
}
