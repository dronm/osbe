/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>,2016

 * @class
 * @classdesc
 
 * @requires core/extend.js  
 * @requires controls/GridCmd.js

 * @param {string} id Object identifier
 * @param {namespace} options
*/
function GridCmdDOCShowActs(id,options){
	options = options || {};	

	options.showCmdControl = (options.showCmdControl!=undefined)? options.showCmdControl:false;
	options.glyph = "glyphicon-log-in";

	GridCmdDOCShowActs.superclass.constructor.call(this,id,options);
		
}
extend(GridCmdDOCShowActs,GridCmd);

/* Constants */


/* private members */

/* protected*/


/* public methods */
GridCmdDOCShowActs.prototype.onCommand = function(){
	alert("GridCmdDOCShowActs.prototype.onCommand");
}

