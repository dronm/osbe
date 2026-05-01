/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>
 
 * @class
 * @classdesc grid head object
 
 * @requires GridCmd.js
 * @requires GridCmd.js 

 * @extends ControlContainer
  
 * @param {string} id Object identifier
 * @param {object} options
 */
function GridCmdDelete(id,options){
	options = options || {};	
	
	options.glyph = "glyphicon-remove";
	options.showCmdControl = (options.showCmdControl!=undefined)? options.showCmdControl:false;
	
	GridCmdDelete.superclass.constructor.call(this,id,options);
		
}
extend(GridCmdDelete,GridCmd);

/* Constants */


/* private members */

/* protected*/


/* public methods */
GridCmdDelete.prototype.onCommand = function(){
	this.m_grid.onDelete();
}
