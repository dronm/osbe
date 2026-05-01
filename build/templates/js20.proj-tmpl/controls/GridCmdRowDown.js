/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2017
 
 * @class
 * @classdesc grid head object
 
 * @requires GridCmd.js
 * @requires GridCmd.js 

 * @extends ControlContainer
  
 * @param {string} id Object identifier
 * @param {object} options
 */
function GridCmdRowDown(id,options){
	options = options || {};	

	options.glyph = "glyphicon-arrow-down";
	options.buttonClass = options.buttonClass || ButtonCmd;
	options.showCmdControl = (options.showCmdControl!=undefined)? options.showCmdControl:false;
	
	GridCmdRowDown.superclass.constructor.call(this,id,options);
		
}
extend(GridCmdRowDown,GridCmd);

/* Constants */


/* private members */

/* protected*/


/* public methods */
GridCmdRowDown.prototype.onCommand = function(){
	this.m_grid.onRowDown();
}
