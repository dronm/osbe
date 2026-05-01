/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2016

 * @extends EditRef
 * @requires core/extend.js
 * @requires EditRef.js     

 * @class
 * @classdesc
 
 * @param {string} id - Object identifier
 * @param {object} options
 * @param {bool} [options.cmdUnprocess=true]
 * @param {bool} [options.cmdPrintDoc=true]
 * @param {bool} [options.cmdShowActs=true]
 * @param {Control} [options.controlShowActs=ButtonCtrl]
 * @param {Control} [options.controlPrintDoc=ButtonCtrl]
 * @param {Control} [options.controlUnprocess=ButtonCtrl]                               
 */
function GridCommandsDOC(id,options){
	options = options || {};	
	
	options.cmdUnprocess = (options.cmdUnprocess!=undefined)? options.cmdUnprocess:true;
	options.cmdPrintDoc = (options.cmdPrintDoc!=undefined)? options.cmdPrintDoc:true;
	options.cmdShowActs = (options.cmdShowActs!=undefined)? options.cmdShowActs:true;
	
	var self = this;
	//Export
	if (options.cmdUnprocess || options.controlUnprocess){
		this.setControlUnprocess(options.controlUnprocess || new ButtonCtrl(id+":cmdUnprocess",
			{"glyph":"glyphicon-unchecked",
			"onClick":function(){
				WindowQuestion.show({
					"cancel":false,
					"text":self.ACTS_DEL_CONF,
					"callBack":function(r){
						if (r==WindowQuestion.RES_YES){
							self.delActs();
						}			
					}
				});				
			},
			"attrs":{"title":this.BTN_UNPROCESS_TITLE}
			})
		);		
	}

	if (options.cmdShowActs || options.controlShowActs){
		this.setControlShowActs(options.controlShowActs || new ButtonCtrl(id+":cmdShowActs",
			{"glyph":"glyphicon-log-in",
			"onClick":function(){
				//self.m_grid.getReadPublicMethod().download("ViewExcel");
			},
			"attrs":{"title":this.BTN_SHOWACT_TITLE}
			})
		);		
	}
	
	GridCommandsDOC.superclass.constructor.call(this,id,options);
}
extend(GridCommandsDOC,GridCommandsAjx);

/* Constants */


/* private members */

GridCommandsDOC.prototype.m_controlUnprocess;
GridCommandsDOC.prototype.m_controlShowActs;

/* protected*/
GridCommandsDOC.prototype.addControls = function(){
	if (this.m_controlInsert) this.addElement(this.m_controlInsert);
	if (this.m_controlEdit) this.addElement(this.m_controlEdit);
	if (this.m_controlCopy) this.addElement(this.m_controlCopy);
	if (this.m_controlDelete) this.addElement(this.m_controlDelete);
	if (this.m_controlPrint) this.addElement(this.m_controlPrint);
	if (this.m_controlExport) this.addElement(this.m_controlExport);
	if (this.m_controlRefresh) this.addElement(this.m_controlRefresh);
	if (this.m_controlPrintObj) this.addElement(this.m_controlPrintObj);
	
	if (this.m_controlUnprocess) this.addElement(this.m_controlUnprocess);
	if (this.m_controlShowActs) this.addElement(this.m_controlShowActs);
	
	if (this.m_controlFilter){
		this.addElement(this.m_controlFilterToggle);
		this.addElement(this.m_controlFilter);
	}
		
	if (this.m_popUpMenu){
		this.toPopUp();
	}
	
}

GridCommandsDOC.prototype.toPopUp = function(){

	GridCommandsDOC.superclass.toPopUp.call(this);
	
	if (this.m_controlUnprocess||this.m_controlShowActs){
		this.m_popUpMenu.addSeparator();
		if (this.m_controlUnprocess) this.m_popUpMenu.addButton(this.m_controlUnprocess);
		if (this.m_controlShowActs) this.m_popUpMenu.addButton(this.m_controlShowActs);
	}
}


/* public methods */
GridCommandsDOC.prototype.setControlUnprocess = function(v){
	this.m_controlUnprocess = v;
}

GridCommandsDOC.prototype.getControlUnprocess = function(){
	return this.m_controlUnprocess;
}

GridCommandsDOC.prototype.setControlShowActs = function(v){
	this.m_controlShowActs = v;
}
GridCommandsDOC.prototype.getControlShowActs = function(){
	return this.m_controlShowActs;
}

GridCommandsDOC.prototype.delActs = function(){	
	var contr = this.m_grid.getReadPublicMethod().getController();
	if (contr.publicMethodExists("set_unprocessed")){
		var self = this;
		
		var keys = this.m_grid.getSelectedNodeKeys();
		var pm = contr.getPublicMethod("set_unprocessed");
		pm.setFieldValue("doc_id",keys["id"]);
		pm.run({
			"async":true,
			"ok":function(){
				self.m_grid.onRefresh();
				window.showNote(self.ACTS_DELETED);
			}
		})					
	}

}
