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
function GridCmdEdit(id,options){
	options = options || {};	

	options.glyph = "glyphicon-pencil";
	options.showCmdControl = false;
	
	GridCmdEdit.superclass.constructor.call(this,id,options);
		
}
extend(GridCmdEdit,GridCmd);

/* Constants */


/* private members */

/* protected*/


/* public methods */
GridCmdEdit.prototype.onCommand = function(){
	this.m_grid.onEdit();
}
