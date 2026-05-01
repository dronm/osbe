/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>,2016

 * @class
 * @classdesc

 * @requires core/extend.js  
 * @requires controls/ControlContainer.js

 * @param {string} id Object identifier
 * @param {namespace} options
*/
function ViewGridColParam(id,options){
	options = options || {};	

	ViewGridColParam.superclass.constructor.call(this,id,"DIV",options);
	
	this.m_paramId = options.paramId;
	this.m_variantStorageName = options.variantStorageName;
	this.m_dataGrid = options.grid;
	
	var head = new GridHead();
	var row = new GridRow(id+":row1");	
	
	this.addHeadCells(row);
		
	head.addElement(row);
	
	//body
	var body = new GridBody();
	
	this.m_onAfterSave = options.onAfterSave;
	
	this.m_initVal = options.colStruc;
	for (var col_ind=0; col_ind<this.m_initVal.length;col_ind++){
		var row = new GridRow(this.getId()+":grid:row-"+this.m_initVal[col_ind].colId,{
			"attrs":{"colId":this.m_initVal[col_ind].colId}});
			
		this.addCells(row,this.m_initVal[col_ind]);
		
		body.addElement(row);
	}
	
	var popup_menu = new PopUpMenu();
	
	this.m_grid = new Grid(id+":grid",
		{"head":head,
		"body":body,
		"commands":new GridCmdContainer(id+":grid:cmd",{
			"cmdInsert":false,
			"cmdRefresh":false,
			"cmdPrint":false,
			"cmdSearch":false,
			"cmdColManager":false,
			"cmdAllCommands":false,		
			"addCustomCommands":function(commands){
				commands.push(new GridCmdRowUp(id+":grid:cmd:rowUp",{"showCmdControl":true}));
				commands.push(new GridCmdRowDown(id+":grid:cmd:rowDown",{"showCmdControl":true}));
			},
			"popUpMenu":popup_menu
		}),
		"popUpMenu":popup_menu,
		"rowCommandPanelClass":null,
		"filter":null,
		"refreshInterval":0
		}
	);
	
	this.addElement(this.m_grid);
	
}
extend(ViewGridColParam,ControlContainer);

/* Constants */
ViewGridColParam.prototype.COL_CHECK_ID = "check";
ViewGridColParam.prototype.COL_NAME_ID = "name";


/* private members */

/* protected*/


/* public methods */
ViewGridColParam.prototype.refresh = function(){
	this.getElement("grid").onRefresh();
}

ViewGridColParam.prototype.save = function(){
	/*
	var b = this.m_grid.getBody();
	var param_val = [];
	for (var row_id in b.m_elements){				
		this.getRowData(b.m_elements[row_id],param_val);
	}

	var param_val_str = CommonHelper.serialize(param_val);	
	if (param_val_str!=CommonHelper.serialize(this.m_initVal)){
		//value changed!
		var self = this;
		var contr = new TemplateParam_Controller(this.getApp());
		var pm = contr.getPublicMethod("set_value");
		pm.setFieldValue("template",this.m_variantStorageName);
		pm.setFieldValue("param",this.m_paramId);
		pm.setFieldValue("val",param_val_str);		
		pm.run({
			"ok":function(resp){
				for (var i=0;i<self.m_initVal.length;i++){
					param_val[i].colRef = self.m_initVal[i].colRef;
				}
				self.m_initVal = param_val;
				self.onAfterSave();
				window.showNote(self.NOTE_SAVED);
			}
		});
	}
	*/
}

/*should be overriden*/
ViewGridColParam.prototype.onAfterSave = function(){	
	window.getApp().setTemplateParam(this.m_variantStorageName,this.m_paramId,this.m_initVal);
}

