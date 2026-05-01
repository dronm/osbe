/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2017
 
 * @class
 * @classdesc grid head object
 
 * @requires GridCmd.js
 * @requires GridCmd.js 

 * @extends ControlContainer
  
 * @param {string} id Object identifier
 * @param {object} options
 * @param {Control} [options.buttonClass=ButtonCtrl]
 */
function GridCmdRowUp(id,options){
	options = options || {};	

	options.glyph = "glyphicon-arrow-up";
	options.buttonClass = options.buttonClass || ButtonCmd;
	options.showCmdControl = (options.showCmdControl!=undefined)? options.showCmdControl:false;
	
	GridCmdRowUp.superclass.constructor.call(this,id,options);
		
}
extend(GridCmdRowUp,GridCmd);

/* Constants */


/* private members */

/* protected*/


/* public methods */
GridCmdRowUp.prototype.onCommand = function(){
	this.m_grid.onRowUp();
}
