/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2019

 * @extends GridCommands
 * @requires core/extend.js
 * @requires controls/GridCommands.js     

 * @class
 * @classdesc
 
 * @param {string} id - Object identifier
 * @param {object} options
 */
function RepFieldGridCommands(id,options){
	options = options || {};	
	
	var self = this;
	//Row up
	if (options.cmdRowUp!==false||){
		this.setControlRowUp(options.cmdRowUp || new GridCmdRowUp(id+":cmdRowUp"));		
	}
	if (options.cmdRowDown!==false||){
		this.setControlRowDown(options.cmdRowUp || new GridCmdRowDown(id+":cmdRowDown"));		
	}
	
	RepFieldGridCommands.superclass.constructor.call(this,id,options);
}
//ViewObjectAjx,ViewAjxList
extend(RepFieldGridCommands,GridCommands);

/* Constants */


/* private members */

/* protected*/


/* public methods */
RepFieldGridCommands.prototype.addControls = function(){
	if (this.m_controlRowUp) this.addElement(this.m_controlRowUp);
	if (this.m_controlRowDown) this.addElement(this.m_controlRowDown);
		
	if (this.m_popUpMenu){
		this.toPopUp();
	}
	
}

RepFieldGridCommands.prototype.toPopUp = function(){

	GridCommandsDOC.superclass.toPopUp.call(this);
	
	if (this.m_controlRowUp) this.m_popUpMenu.addButton(this.m_controlRowUp);
	if (this.m_controlRowDown) this.m_popUpMenu.addButton(this.m_controlRowDown);
}

RepFieldGridCommands.prototype.setControlRowUp = function(v){
	this.m_controlRowUp = v;
}

RepFieldGridCommands.prototype.getControlRowUp = function(){
	return this.m_controlRowUp;
}

RepFieldGridCommands.prototype.setControlRowDown = function(v){
	this.m_controlRowDown = v;
}

RepFieldGridCommands.prototype.getControlRowDown = function(){
	return this.m_controlRowDown;
}

