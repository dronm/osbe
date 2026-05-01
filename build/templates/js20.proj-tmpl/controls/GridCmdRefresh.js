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
function GridCmdRefresh(id,options){
	options = options || {};	

	options.glyph = "glyphicon-refresh";
	options.showCmdControl = (options.showCmdControl!=undefined)? options.showCmdControl:false;
	
	GridCmdRefresh.superclass.constructor.call(this,id,options);
		
}
extend(GridCmdRefresh,GridCmd);

/* Constants */


/* private members */

/* protected*/


/* public methods */
GridCmdRefresh.prototype.onCommand = function(){
	this.m_grid.onRefresh();
}
