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
function GridColumnPhone(options){
	options = options || {};	
	
	options.mask = options.mask || window.getApp().getPhoneEditMask();
	options.ctrlClass = options.ctrlClass || EditPhone;
	
	if(window.Caller_Controller){
		options.cellClass = options.cellClass || GridCellPhone;
		options.cellOptions = options.cellOptions || {};
		options.cellOptions.telExt = options.cellOptions.telExt||options.telExt;
		options.cellOptions.onConnected = options.cellOptions.onConnected||options.onConnected;
	}
	else{
		options.cellClass = options.cellClass || GridCell;
	}
		
	GridColumnPhone.superclass.constructor.call(this,options);
}
extend(GridColumnPhone,GridColumn);

/* Constants */


/* private members */

/* protected*/


/* public methods */

