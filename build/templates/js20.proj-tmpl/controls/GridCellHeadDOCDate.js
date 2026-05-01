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
function GridCellHeadDOCDate(id,options){
	options = options || {};	
	
	options.value = "Дата",
	options.sortable = true;
	options.sort = "asc";
	options.columns = [
		new GridColumnDate({
			"field":options.model.getField("date_time"),
			"dateFormat":window.getApp().getJournalDateFormat(),
			"searchOptions":{
				"field":new FieldDate("date_time"),
				"searchType":"on_beg"
			}
		})
	];	
	
	GridCellHeadDOCDate.superclass.constructor.call(this,id,options);
}
extend(GridCellHeadDOCDate,GridCellHead);

/* Constants */


/* private members */

/* protected*/


/* public methods */

