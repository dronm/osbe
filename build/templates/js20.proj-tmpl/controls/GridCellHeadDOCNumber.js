/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2016

 * @extends GridCellHead
 * @requires core/extend.js
 * @requires GridCellHead.js     

 * @class
 * @classdesc
 
 * @param {string} id - Object identifier
 * @param {object} options
 */
function GridCellHeadDOCNumber(id,options){
	options = options || {};	
	
	options.value = "Номер",
	options.sortable = true;
	options.columns = [
		new GridColumn({"field":options.model.getField("number")})
	];	
	
	GridCellHeadDOCNumber.superclass.constructor.call(this,id,options);
}
extend(GridCellHeadDOCNumber,GridCellHead);

/* Constants */


/* private members */

/* protected*/


/* public methods */

