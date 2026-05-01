/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2016

 * @extends GridColumn
 * @requires controls/GridColumn.js
 * @requires core/AppWin.js 

 * @class
 * @classdesc
 
 * @param {Object} options
 * @param {string} [options.mask=App.getPhoneEditMask] 
 */
function GridColumnSNILS(options){
	options = options || {};	
	
	options.mask = options.mask || this.DEF_EDIT_MASK;
	options.ctrlClass = options.ctrlClass || (window["EditSNILS"]? EditSNILS : EditString);
	
	GridColumnSNILS.superclass.constructor.call(this,options);
}
extend(GridColumnSNILS, GridColumn);

/* Constants */
GridColumnSNILS.prototype.DEF_EDIT_MASK = "999-999-999 99";

/* private members */

/* protected*/


/* public methods */

