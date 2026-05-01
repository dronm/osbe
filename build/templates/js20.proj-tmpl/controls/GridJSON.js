/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>,2019

 * @class
 * @classdesc grid object

 * @extends controls/GridAjx.js  
 * @requires controls/GridAjx.js

 * @param {string} id Object identifier
 * @param {namespace} options
*/
function GridJSON(id,options){
	options = options || {};	
	
	options.refreshAfterDelRow = true;//Or deletion wont work well!!
	options.refreshInterval = 0;
	options.pagination = null;
	options.autoRefresh = false;
	
	GridJSON.superclass.constructor.call(this,id,options);
}
extend(GridJSON,GridAjx);
