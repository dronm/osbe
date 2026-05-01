/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2016

 * @extends GridCellHead
 * @requires core/extend.js
 * @requires GridCellHead.js     

 * @class
 * @classdesc
 
 * @param {string} id - Object identifier
 * @param {object} options
 * @param {bool} [options.cmdExport=true]
 * @param {Control} [options.controlExport=ButtonCtrl] 
 */
function GridCommandsAjx(id,options){
	options = options || {};
	
	options.cmdExport = (options.cmdExport!=undefined)? options.cmdExport:true;

	var self = this;
	//Export
	if (options.cmdExport){
		this.setControlExport(options.controlExport || new ButtonCtrl(id+":cmdExport",
			{"glyph":"glyphicon-file",
			"onClick":function(){
				//Always post request
				//ToDo customView?
				self.m_grid.getReadPublicMethod().download("ViewExcel");
			},
			"attrs":{"title":this.BTN_EXPORT_TITLE}
			})
		);		
	}
	
	GridCommandsAjx.superclass.constructor.call(this,id,options);
}
extend(GridCommandsAjx,GridCommands);

/* private */
GridCommandsAjx.prototype.m_controlExport;

GridCommandsAjx.prototype.addControls = function(){
	if (this.m_controlInsert) this.addElement(this.m_controlInsert);
	if (this.m_controlEdit) this.addElement(this.m_controlEdit);
	if (this.m_controlCopy) this.addElement(this.m_controlCopy);
	if (this.m_controlDelete) this.addElement(this.m_controlDelete);
	if (this.m_controlPrint) this.addElement(this.m_controlPrint);
	if (this.m_controlExport) this.addElement(this.m_controlExport);
	if (this.m_controlRefresh) this.addElement(this.m_controlRefresh);
	if (this.m_controlPrintObj) this.addElement(this.m_controlPrintObj);
	
	if (this.m_controlFilter){
		this.addElement(this.m_controlFilterToggle);
		this.addElement(this.m_controlFilter);
	}
	if (this.m_popUpMenu){
		this.toPopUp();
	}
	
}

GridCommandsAjx.prototype.toPopUp = function(){
	if(this.m_controlInsert) this.m_popUpMenu.addButton(this.m_controlInsert);
	if(this.m_controlEdit) this.m_popUpMenu.addButton(this.m_controlEdit);
	if(this.m_controlCopy) this.m_popUpMenu.addButton(this.m_controlCopy);
	if(this.m_controlDelete) this.m_popUpMenu.addButton(this.m_controlDelete);
	if(this.m_controlPrint) this.m_popUpMenu.addButton(this.m_controlPrint);
	if (this.m_controlExport) this.m_popUpMenu.addButton(this.m_controlExport);
	if(this.m_controlColumnManager) this.m_popUpMenu.addButton(this.m_controlColumnManager);
	if(this.m_controlRefresh) this.m_popUpMenu.addButton(this.m_controlRefresh);
	if (this.m_controlPrintObj) this.addElement(this.m_controlPrintObj);
	
	this.printObjToPopUp();	
}


/* public */
GridCommandsAjx.prototype.getControlExport = function(){
	return this.m_controlExport;
}
GridCommandsAjx.prototype.setControlExport = function(v){
	this.m_controlExport = v;
}

GridCommandsAjx.prototype.setEnabled = function(en){
	if(this.m_controlRefresh) this.m_controlRefresh.setEnabled(en);
	GridCommandsAjx.superclass.setEnabled.call(this,en);	
}

