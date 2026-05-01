/* Copyright (c) 2012 
	Andrey Mikhalevich, Katren ltd.
*/
/*	
	Description
*/
//ф
/** Requirements
* @requires controls/ControlContainer.js 
*/

/* constructor */
function GridCommands(id,options){
	options = options || {};
	options.className = options.className || this.DEF_CLASS_NAME;
	var tagName = options.tagName || this.DEF_TAG_NAME;
	GridCommands.superclass.constructor.call(this,
		id,tagName,options);

	this.m_btnClass = options.btnClass || ButtonCtrl;

	//for export
	this.m_publicMethodId = options.publicMethodId;
	this.m_controller = options.controller;
	
	var self = this;
	if (options.onClickInsert){
		this.setOnClickInsert(options.onClickInsert);
	}
	if (options.noInsert==undefined || options.noInsert==false){
		this.addInsert();
	}
	if (options.noEdit==undefined || options.noEdit==false){
		this.addEdit();
	}	
	//copy	
	if(options.noCopy==undefined||options.noCopy==false){
		this.addCopy();
	}	
	
	if (options.noDelete==undefined || options.noDelete==false){
		this.addDelete();
	}		
	if (options.noPrint==undefined || options.noPrint==false){
		this.addPrint();
	}
	
	if (options.controller &&
	(options.noExport==undefined || options.noExport==false) ){
		this.addExport();
	}
	
	if (options.onClickRefresh){
		this.setOnClickRefresh(options.onClickRefresh);
	}	
	if (options.noRefresh==undefined || options.noRefresh==false){
		this.addRefresh();
	}
	if (options.cmdColumnManager){
		this.addColumnManager();
	}
	
}
extend(GridCommands,ControlContainer);

GridCommands.prototype.DEF_TAG_NAME = "div";
GridCommands.prototype.DEF_CLASS_NAME = "grid_commands";

GridCommands.prototype.m_onClickInsert;
GridCommands.prototype.m_onClickRefresh;
GridCommands.prototype.m_onClickExport;
GridCommands.prototype.m_clickContext;

GridCommands.prototype.setOnClickInsert = function(onClickInsert){
	this.m_onClickInsert = onClickInsert;
}
GridCommands.prototype.setOnClickEdit = function(onClickEdit){
	this.m_onClickEdit = onClickEdit;
}
GridCommands.prototype.setOnClickCopy = function(onClickCopy){
	this.m_onClickCopy = onClickCopy;
}
GridCommands.prototype.setOnClickDelete = function(onClickDelete){
	this.m_onClickDelete = onClickDelete;
}
GridCommands.prototype.setOnClickExport = function(onClickExport){
	this.m_onClickExport = onClickExport;
}
GridCommands.prototype.setOnClickRefresh = function(onClickRefresh){
	this.m_onClickRefresh = onClickRefresh;
}
GridCommands.prototype.setClickContext = function(clickContext){
	this.m_clickContext = clickContext;
}
GridCommands.prototype.addInsert = function(){
	var self = this;
	this.m_btnInsert = new this.m_btnClass(null,
	{"glyph":"glyphicon-plus",
	"onClick":function(){
		if (self.getEnabled()){
			self.m_onClickInsert.call(self.m_clickContext);
		}
		},
	"attrs":{"title":"Добавить"}
	});	
	this.setElementById(this.getId()+"_insert",this.m_btnInsert);
	
	/*Используется в Grid!!! onKeyInsert*/
	this.m_cmdInsert=true;
}
GridCommands.prototype.addEdit = function(){
	var self = this;
	this.m_btnEdit = new this.m_btnClass(null,
	{"glyph":"glyphicon-pencil",
	"onClick":function(event){
		if (self.m_clickContext.m_selectedRowId
		&&self.m_clickContext.m_selectedRowKeys
		&&self.getEnabled()){
			self.m_onClickEdit.call(self.m_clickContext,self.m_clickContext.m_selectedRowId,
			json2obj(self.m_clickContext.m_selectedRowKeys));
		}
		},
	"attrs":{"title":"Изменить"}
	});	
	this.setElementById(this.getId()+"_edit",this.m_btnEdit);
	this.m_cmdEdit=true;	
}
GridCommands.prototype.addCopy = function(){
	var self = this;
	this.m_btnCopy = new this.m_btnClass(null,
	{"glyph":"glyphicon-copy",
	"onClick":function(event){
		if (self.m_clickContext.m_selectedRowId
		&&self.m_clickContext.m_selectedRowKeys
		&&self.getEnabled()){
			self.m_onClickCopy.call(self.m_clickContext,self.m_clickContext.m_selectedRowId,
			json2obj(self.m_clickContext.m_selectedRowKeys));
		}
		},
	"attrs":{"title":"Копировать"}
	});	
	this.setElementById(this.getId()+"_copy",this.m_btnCopy);
	this.m_cmdCopy=true;	
}
GridCommands.prototype.addDelete = function(){
	var self = this;
	this.m_btnDelete = new this.m_btnClass(null,
	{"glyph":"glyphicon-remove",
	"onClick":function(){
		if (self.m_clickContext.m_selectedRowId
		&&self.getEnabled()){
			self.m_onClickDelete.call(self.m_clickContext,self.m_clickContext.m_selectedRowId,
			json2obj(self.m_clickContext.m_selectedRowKeys));
		}
		},
	"attrs":{"title":"Удалить"}
	});	
	this.setElementById(this.getId()+"_delete",this.m_btnDelete);
	this.m_cmdDelete=true;
}

GridCommands.prototype.addColumnManager = function(){
	var self = this;
	this.m_btnColumnManager = new this.m_btnClass(null,
		{"glyph":"glyphicon-th-list",
		"onClick":function(){
			var btnCont = this;
			this.m_form = new WindowFormModalBS(uuid(),{
				"content":new ViewGridColumnManager(uuid(),{
					"grid":self.m_clickContext,
					"onClose":function(){
						btnCont.m_form.close();
						self.m_clickContext.onRefresh.call(self.m_clickContext);
					}
				})
			});
	
			this.m_form.open();
	
		},
		"attrs":{"title":"Открыть настройку колонок"}
	});	
	this.setElementById(this.getId()+"_btnColManager",this.m_btnColumnManager);
	this.m_cmdColumnManager=true;
}

GridCommands.prototype.addPrint = function(){
	var self = this;
	this.m_btnPrint = new this.m_btnClass(null,
	{"glyph":"glyphicon-print",
	"onClick":function(e){
		if (self.getEnabled()){
			/*
			if (options.tableId){
				table=nd(options.tableId);
				if (table==undefined)return;
			}
			else{
				e = EventHandler.fixMouseEvent(e);
				var table = DOMHandler.getParentByTagName(e.target,"table");//e.target.parentNode.parentNode.parentNode;
				if (table==undefined)return;
			
				//var tables=parent.getElementsByTagName("table");
				//if (tables==undefined || !tables.length)return;
				//table=tables[0];
			}
			*/				
			WindowPrint.show({content:self.m_clickContext.getNode().outerHTML});
		}},
	"attrs":{"title":"Печать"}
	});	
	this.setElementById(this.getId()+"_print",this.m_btnPrint);
	this.m_cmdPrint=true;	
}
GridCommands.prototype.addExport = function(){
	var self = this;
	this.m_btnExport = new this.m_btnClass(null,
	{"glyph":"glyphicon-download-alt",
	"onClick":function(){
		if (self.getEnabled()){
			var methId = self.m_publicMethodId || "get_list";
			var meth = self.m_controller.getPublicMethodById(methId);
			meth.setParamValue(self.m_controller.PARAM_VIEW,'ViewExcel');
			if (meth.paramExists(self.m_controller.PARAM_FROM)){
				meth.removeParam(self.m_controller.PARAM_FROM);
			}
			if (meth.paramExists(self.m_controller.PARAM_COUNT)){
				meth.removeParam(self.m_controller.PARAM_COUNT);
			}				
			var params = self.m_controller.getQueryString(meth);
			meth.setParamValue(self.m_controller.PARAM_VIEW,'ViewXML');
			top.location.href = HOST_NAME+"index.php?"+params;
			//"http://localhost/beton/index.php?c=Client_Controller&f=get_list&v=ViewExcel";
		}
		},
	"attrs":{"title":"Экспорт в Excel"}
	});	
	this.setElementById(this.getId()+"_export",this.m_btnExport);
	this.m_cmdExcel=true;	
}
GridCommands.prototype.addRefresh = function(){
	var self = this;
	this.m_btnRefresh = new this.m_btnClass(null,
	{"glyph":"glyphicon-refresh",
	"onClick":function(){
		if (self.getEnabled()){
			self.m_onClickRefresh.call(self.m_clickContext);
		}
		},
	"attrs":{"title":"Обновить"}
	});	
	this.setElementById(this.getId()+"_refresh",this.m_btnRefresh);	
}
GridCommands.prototype.commandsToPopUp = function(popUp){
	if (this.m_btnInsert){
		popUp.addButton(this.m_btnInsert);
	}
	if (this.m_btnEdit){
		popUp.addButton(this.m_btnEdit);
	}
	if (this.m_btnCopy){
		popUp.addButton(this.m_btnCopy);
	}
	if (this.m_btnDelete){
		popUp.addButton(this.m_btnDelete);
	}
	if (this.m_btnPrint){
		popUp.addButton(this.m_btnPrint);
	}	
	if (this.m_btnExport){
		popUp.addButton(this.m_btnExport);
	}	
	if (this.m_btnRefresh){
		popUp.addButton(this.m_btnRefresh);
	}
	if (this.m_btnColumnManager){
		popUp.addButton(this.m_btnColumnManager);
	}	
		
}

