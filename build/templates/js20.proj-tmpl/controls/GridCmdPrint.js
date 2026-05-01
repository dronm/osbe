/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>,2016

 * @class
 * @classdesc ajax based grid commands

 * @requires core/extend.js  
 * @requires controls/GridCmdContainer.js

 * @param {string} id Object identifier
 * @param {Object} options
*/
function GridCmdPrint(id,options){
	options = options || {};	

	options.glyph = "glyphicon-print";
	options.showCmdControl = (options.showCmdControl!=undefined)? options.showCmdControl:false;
	
	GridCmdPrint.superclass.constructor.call(this,id,options);
		
}
extend(GridCmdPrint,GridCmd);

/* Constants */


/* private members */

/* protected*/


/* public methods */
GridCmdPrint.prototype.onCommand = function(){
	this.m_grid.onPrint();
}
