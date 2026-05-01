/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2016
 
 * @class
 * @classdesc
 
 * @param string id 
 * @param {namespace} options
 * @param {Grid} options.grid
 * @param {bool} [options.showCmdControl=true]
 * @param {bool} [options.showCmdControlInPopup=true]
 * @param {Control} [options.buttonClass=ButtonCmd] 
 * @param {string} options.glyph
 * @param {string} options.glyphPopUp  
 * @param {string} options.caption
 * @param {string} options.title 
 * @param {function} options.onCommand
 */
function GridCmd(id,options){
	options = options || {};	
	
	this.m_id = id;
	this.m_grid = options.grid;
	
	this.setShowCmdControl((options.showCmdControl!=undefined)? options.showCmdControl:true);
	this.setShowCmdControlInPopup((options.showCmdControlInPopup!=undefined)? options.showCmdControlInPopup:true);
	var btn_class = options.buttonClass || ButtonCmd;
	
	var self = this;
	
	this.m_onCommand = options.onCommand || this.onCommand;
	
	this.m_controls = options.controls || 
		//default control
		[
			new btn_class(id,
				{"glyph":options.glyph,
				"glyphPopUp":options.glyphPopUp,
				"caption":options.caption,
				"onClick":function(e){
					self.m_onCommand.call(self,e);
				},
				"attrs":{"title":options.title || this.TITLE}
				}
			)
		];
}

/* Constants */

GridCmd.prototype.m_id;
GridCmd.prototype.m_controls;
GridCmd.prototype.m_grid;
GridCmd.prototype.m_showCmdControl;
GridCmd.prototype.m_showCmdControlInPopup;

/* private members */

/* protected*/


/* public methods */
GridCmd.prototype.getShowCmdControl = function(){
	return this.m_showCmdControl;
}

GridCmd.prototype.setShowCmdControl = function(v){
	this.m_showCmdControl = v;
}

GridCmd.prototype.getShowCmdControlInPopup = function(){
	return this.m_showCmdControlInPopup;
}

GridCmd.prototype.setShowCmdControlInPopup = function(v){
	this.m_showCmdControlInPopup = v;
}

GridCmd.prototype.setGrid = function(v){
	this.m_grid = v;
}
GridCmd.prototype.getGrid = function(){
	return this.m_grid;
}

GridCmd.prototype.setId = function(v){
	this.m_id = v;
}
GridCmd.prototype.getId = function(){
	return this.m_id;
}


GridCmd.prototype.addControl = function(control){
	this.m_controls.push(control);
}

GridCmd.prototype.getControl = function(ind){
	ind = (ind!=undefined)? ind:0;
	return (ind>=0 && ind<this.m_controls.length)? this.m_controls[ind]:undefined;
}

GridCmd.prototype.controlsToContainer = function(container){
	this.m_container = container;
	for (var i=0;i<this.m_controls.length;i++){
		//name should be unique!!!		
		//all commands!!!
		var n = this.m_controls[i].getName();
		//if(this.m_controls[i].getName&&container.getElement(n)){
			//throw new Error("Already exists control with the same name '"+this.m_controls[i].getName()+"'");
			//continue;
		//}		
		container.addElement(this.m_controls[i]);
	}
}

GridCmd.prototype.controlsToPopUp = function(popUp){
	for (var i=0;i<this.m_controls.length;i++){
		if(!this.m_controls[i].getCaption){
			continue;
		}
		popUp.addButton(this.m_controls[i]);
	}
}

//abstract function MUST be overriden
GridCmd.prototype.onCommand = function(e){
}

GridCmd.prototype.onDelDOM = function(){
}

