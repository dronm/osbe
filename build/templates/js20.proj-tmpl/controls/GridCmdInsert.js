/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>,2016

 * @class
 * @classdesc ajax based grid commands

 * @requires core/extend.js  
 * @requires controls/GridCmdContainer.js

 * @param {string} id Object identifier
 * @param {Object} options
*/

function GridCmdInsert(id,options){
	options = options || {};	
	
	options.glyphPopUp = "glyphicon-plus";
	options.caption = this.CAPTION;
	options.showCmdControl = (options.showCmdControl!=undefined)? options.showCmdControl:true;
	
	GridCmdInsert.superclass.constructor.call(this,id,options);
		
}
extend(GridCmdInsert,GridCmd);

/* Constants */


/* private members */

/* protected*/


/* public methods */
GridCmdInsert.prototype.onCommand = function(){
	this.m_grid.onInsert();
}
