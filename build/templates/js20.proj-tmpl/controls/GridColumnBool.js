/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2016

 * @extends GridColumn
 * @requires GridColumn

 * @class
 * @classdesc

 * @param {Object} options
 * @param {bool} [options.showFalse=TRUE]
 */
function GridColumnBool(options){
	options = options || {};	
	
	options.assocClassList = options.assocClassList||{"true":"glyphicon glyphicon-ok","false":( (options.showFalse==undefined||options.showFalse===true)? "glyphicon glyphicon-remove":null) };
	GridColumnBool.superclass.constructor.call(this,options);
}
extend(GridColumnBool,GridColumn);

/* Constants */


/* private members */

/* protected*/


/* public methods */

