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
function GridCmdCopy(id,options){
	options = options || {};	

	options.glyph = "glyphicon-copy";
	options.showCmdControl = (options.showCmdControl!=undefined)? options.showCmdControl:false;
	
	GridCmdCopy.superclass.constructor.call(this,id,options);
		
}
extend(GridCmdCopy,GridCmd);

/* Constants */


/* private members */

/* protected*/


/* public methods */
GridCmdCopy.prototype.onCommand = function(){
	this.m_grid.onCopy();
}
