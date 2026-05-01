/* Copyright (c) 2012 
	Andrey Mikhalevich, Katren ltd.
*/
/*	
	Description
*/

/** Requirements
 * @requires common/functions.js
*/

/* constructor */
function GridDb(id,options){
	options = options || {};
	
	GridDb.superclass.constructor.call(this,
		id,options);
	if (options.controller){
		this.setController(options.controller);
	}
	
	if (options.asyncEditRead!=undefined){
		this.m_asyncEditRead = options.asyncEditRead;
	}	
	this.m_asyncRefresh = (options.asyncRefresh!=undefined)? options.asyncRefresh:true;
	
	if (options.readModelId){
		this.setReadModelId(options.readModelId);
	}
	if 	(options.methParams){
		this.m_methParams = options.methParams;
	}
	this.setReadMethodId(options.readMethodId || this.DEF_READ_METH_ID);
	this.setDeleteMethodId(options.DeleteMethodId || this.DEF_DELETE_METH_ID);
	
}
extend(GridDb,Grid);

GridDb.prototype.m_controller;
GridDb.prototype.m_readModelId;
GridDb.prototype.m_readMethodId;
GridDb.prototype.m_deleteMethodId;
GridDb.prototype.m_lastWriteResult;
GridDb.prototype.m_editViewObj;
GridDb.prototype.m_methParams;
GridDb.prototype.m_asyncEditRead;

GridDb.prototype.DEF_READ_METH_ID = "get_list";
GridDb.prototype.DEF_DELETE_METH_ID = "delete";
GridDb.prototype.DEF_TITLE = "<>";

GridDb.prototype.setController = function(controller){
	this.m_controller = controller;
}
GridDb.prototype.getController = function(){
	return this.m_controller;
}

GridDb.prototype.setReadMethodId = function(readMethodId){
	this.m_readMethodId = readMethodId;
}
GridDb.prototype.getReadMethodId = function(){
	return this.m_readMethodId;
}
GridDb.prototype.setDeleteMethodId = function(deleteMethodId){
	this.m_deleteMethodId = deleteMethodId;
}
GridDb.prototype.getDeleteMethodId = function(){
	return this.m_deleteMethodId;
}
GridDb.prototype.setReadModelId = function(readModelId){
	this.m_readModelId = readModelId;
}
GridDb.prototype.getReadModelId = function(){
	return this.m_readModelId;
}

GridDb.prototype.onError = function(resp,erCode,erStr){		
	this.m_lastWriteResult = false;
	if (this.m_errorControl){
		this.m_errorControl.setValue(erStr);
	}
	else{
		alert("AJAX error: "+erStr);
	}
}
GridDb.prototype.onRefresh = function(callBack){	
//console.log("GridDb.prototype.onRefresh callBack="+callBack)
	var self = this;
	var contr = this.getController();
	var meth = this.getReadMethodId();1000	
	if (contr==undefined||meth==undefined){
		if (callBack){
			callBack.call(this);
		}	
		return;
	}		
	var pm = contr.getPublicMethodById(meth);
	
	//pagination
	var pag = this.getPagination();
	if (pag){
		pm.setParamValue(contr.PARAM_FROM,pag.getFrom());
		pm.setParamValue(contr.PARAM_COUNT,pag.getCountPerPage());
	}
	
	//filter
	var filter = this.getFilter();	
	if (filter || this.m_filterComplete){
		var struc = {"fields":null,"signs":null,"vals":null,"icase":null,"field_sep":","};
		
		if (filter)filter.getParams(struc);
		
		if (this.m_filterComplete)this.m_filterComplete(struc);
		//console.log("struc="+array2json( struc));
		//if (struc.fields){
			pm.setParamValue(contr.PARAM_COND_FIELDS,struc.fields);
			pm.setParamValue(contr.PARAM_COND_SGNS,struc.signs);
			pm.setParamValue(contr.PARAM_COND_VALS,struc.vals);
			pm.setParamValue(contr.PARAM_COND_ICASE,struc.icase);
			pm.setParamValue(contr.PARAM_FIELD_SEP,struc.field_sep);
		//}
	}
	//ordering
	for (var col in this.m_sortCols){
		var sort = this.m_sortCols[col].getAttr("sort");
		if (sort=="asc"||sort=="desc"){			
			var sort_col = this.m_sortCols[col].getAttr("sortCol");
			pm.setParamValue(contr.PARAM_ORD_FIELDS,
				(sort_col)? sort_col:this.m_sortCols[col].getAttr("field_id"));
			pm.setParamValue(contr.PARAM_ORD_DIRECTS,sort);
		}
	}
	
	this.m_lastWriteResult = true;
	this.m_errorControl.setValue("");
	var self = this;
	contr.runPublicMethod(
		meth,
		{},
		this.m_asyncRefresh,
		function(resp){
			//console.log("Got Answer callBack="+callBack)
			self.onGetData(resp);
			if (callBack){
				//console.log("Calling callBack")
				callBack.call(self);
			}
		},
		this,
		function(resp, erCode, erStr){
			console.log("Got ERROR callBack="+callBack, "error:", erStr)
			// self.onError(erCode, erStr);
			window.showTempError(erStr, null, 5000);
			if (callBack){
				callBack.call(self);
			}			
		}
	);	
}
GridDb.prototype.toDOM = function(parent){
	GridDb.superclass.toDOM.call(this,parent);	
}
GridDb.prototype.onDelete = function(rowId,keys,callback){	
	var self = this;
	WindowQuestion.show({
		"text":"Запись будет удалена, продолжить?",
		"winObj":this.m_winObj,
		"timeout":30000,
		"callBack":function(res){
			if (res==WindowQuestion.RES_YES){
				var contr_id = self.getController().getId();
				var contr = new window[contr_id](self.getController().getServConnector());
				var meth = self.getDeleteMethodId();
				
				var pm = contr.getPublicMethodById(meth);
				//default params
				self.paramsToMethod(pm);
				for (var key_id in keys){
					pm.setParamValue(key_id,keys[key_id]);
				}	
				contr.run(meth,{
					"func":function(resp){
						/*ДЛЯ ДОКУМЕНТОВ*/
						self.m_modified = true;						
						self.onRefresh(callback);
						}
					}
				);				
			}
		}		
	});
	//GridDb.superclass.onDelete.call(this);	
}

GridDb.prototype.destroyEditViewObj = function(){
	if (this.m_editViewObj){
		if (this.m_editViewObj.m_objModified!=undefined)
			this.m_modified = this.m_editViewObj.m_objModified;//this.m_editViewObj.m_modified;
		this.m_editViewObj.removeDOM();
		delete this.m_editViewObj;
	}
}

GridDb.prototype.initEditViewObj = function(controller){
	var edit_class = this.getEditViewClass();	
	var interval = this.getRefreshInterval();
	this.setRefreshInterval(0);
	
	var self = this;
	this.m_editViewObj = new edit_class(
		this.getId()+"EditView",
		{"onClose":function(res){
			//console.log("GridDb.initEditViewObj onClose");
			
			self.destroyEditViewObj();
			
			//self.onRefresh();
			var ext_w = self.m_editWinClass && self.m_editWin;
			if (ext_w){
				//external window
				self.m_editWin.m_closeMode = res;
				self.m_editWin.close();
				delete self.m_editWin;
			}
			//Если еще живой...
			if (!ext_w || (ext_w && self.m_rendered)){
				self.removeDOM();
				self.toDOM(self.m_parent);										
				self.setRefreshInterval(interval);				
				
				//positioning
				if (self.m_editRowId){
					var w = $(window);
					var row = $("#"+self.m_editRowId);

					if (row.length){
					    w.scrollTop( row.offset().top - (w.height()/2) );
					    //$('html,body').animate({scrollTop: row.offset().top - (w.height()/2)}, 1000 );
					}
				}
			}			
			/*НУЖНО ДЛЯ ДОКУМЕНТОВ
			чтобы определить модиф т.ч.
			*/
			self.m_modified = (res==1);
			//console.log("m_modified="+self.m_modified);				
			
		},
		"readController":controller,
		"readModelId":this.getReadModelId(),
		"connect":this.m_controller.getServConnector(),
		"errorControl":(this.m_editWinClass)? null:this.getErrorControl(),
		"winObj":(this.m_editWinClass)? self.m_editWin:this.m_winObj,
		"methParams":this.m_methParams,
		"params":this.m_editViewParams
		}
	);
}
GridDb.prototype.setDefFilterValues = function(){
	//default filter values
	var filter = this.getFilter();
	if (filter){
		for (var ctrl_id in filter.m_params){
			if (filter.m_params[ctrl_id].keyFieldIds){
				for (var i=0;i<filter.m_params[ctrl_id].keyFieldIds.length;i++){					
					var val = filter.m_params[ctrl_id].key;
					if (val){
						var key = filter.m_params[ctrl_id].keyFieldIds[i];
						var control = DOMHandler.getElementsByAttr(key,this.m_node.tbody,"name");
						if (control && control.length){
							control[0].value = val;
						}
					}
				}
			}
		}		
	}
}
GridDb.prototype.onInsert = function(){
	if (this.m_editViewObj){
		return 0;
	}
	
	this.setGlobalWait(true);
	
	var contr_id = this.getController().getId();
	var contr = new window[contr_id](this.getController().getServConnector());
	var pm = contr.getInsert();
	
	this.paramsToMethod(pm);
	//
	this.initEditViewObj(contr);
	var parent;
	if (this.getEditInline()){
		parent = this.getBody().m_node;
	}
	else if (this.m_editWinClass){	
		//external window
		this.m_editWin = new this.m_editWinClass(
		{
		"view":this.m_editViewObj,
		"title":this.m_editViewObj.getFormCaption()+":Новый",
		"width":this.m_editViewObj.getFormWidth(),
		"height":this.m_editViewObj.getFormHeight()
		}
		);
		this.m_editWin.open();
		this.m_editViewObj.setWinObj(this.m_editWin);
		parent = this.m_editWin.getContentParent();
	}
	else{
		parent = this.m_parent;
		this.removeDOM();	
	}
	
	this.m_editViewObj.toDOM(parent);
	this.setDefFilterValues();	
	GridDb.superclass.onInsert.call(this);	
	
	this.setGlobalWait(false);
}
GridDb.prototype.prepareEdit = function(rowId,keys,nodes,isCopy){	
	if (this.m_editViewObj){
		return 0;
	}
	
	this.setGlobalWait(true);
	
	var contr_id = this.getController().getId();
	var contr = new window[contr_id](this.getController().getServConnector());
	//var pm = contr.getGetObject();	
	//this.paramsToMethod(pm);	
	this.initEditViewObj(contr);
	var pm = contr.getPublicMethodById(this.m_editViewObj.getReadMethodId());
	this.paramsToMethod(pm);	
	for (var key_id in keys){
		this.m_editViewObj.setReadIdValue(key_id,keys[key_id]);		
	}	
	
	if (this.getEditInline()){
		nodes.parent = this.getBody().m_node;
		nodes.replaced_node = nd(rowId,this.getWinObjDocum());		
	}
	else if (this.m_editWinClass){	
		//external window
		this.m_editWin = new this.m_editWinClass(
		{
		"view":this.m_editViewObj,
		"title":this.m_editViewObj.getFormCaption()+((isCopy)? ":Новый":":Редактирование"),
		"width":this.m_editViewObj.getFormWidth(),
		"height":this.m_editViewObj.getFormHeight()		
		});
		this.m_editWin.open();
		nodes.parent = this.m_editWin.getContentParent();
	}	
	else{
		nodes.parent = this.m_parent;
		this.removeDOM();	
	}

	this.setGlobalWait(false);
}

GridDb.prototype.onCopy = function(rowId,keys){	
	var nodes = {parent:null,replaced_node:null};
	this.prepareEdit(rowId,keys,nodes,true);	
	this.m_editViewObj.m_replacedNode = nodes.replaced_node;
	this.m_editViewObj.toDOM(nodes.parent);//,nodes.replaced_node);	
	this.m_editViewObj.readData(this.m_asyncEditRead,true);	
}
GridDb.prototype.onEdit = function(rowId,keys){	
	var nodes = {parent:null,replaced_node:null};
	this.prepareEdit(rowId,keys,nodes);
		
	this.m_editViewObj.m_replacedNode = nodes.replaced_node;
	this.m_editRowId = rowId;		
	this.m_editViewObj.toDOM(nodes.parent,nodes.replaced_node);
	this.m_editViewObj.readData(this.m_asyncEditRead);	
}
GridDb.prototype.onError = function(resp,erCode,erStr){		
	this.m_lastWriteResult = false;
	GridDb.superclass.onError.call(this,erStr);	
}

GridDb.prototype.paramsToMethod = function(pm){
	if (this.m_methParams){
		var pm_id = pm.getId();
		if (this.m_methParams[pm_id]!=undefined){
			for (param_id in this.m_methParams[pm_id]){
				pm.setParamValue(param_id,this.m_methParams[pm_id][param_id]);
			}
		}
	}
}

GridDb.prototype.onGetData = function(resp){
	var model = resp.getModelById(this.getReadModelId());
	model.setActive(true);
	var head_cells={};
	this.getHead().getFields(head_cells);
	var body = this.getBody();

	body.removeDOM();
	body.clear();
	var foot = this.getFoot();
	/*
	if (foot){
		foot.init();
	}
	*/
	var bind,keys,field_count,row_count=0;		
	
	//
	var pag = this.getPagination();
	if (pag){
		pag.setCountTotal(model.getTotCount());
	}
	
	if (this.m_onSelect){
		this.m_selects = {};
		var set_select = function(grid,node,keys,descrs,extraFields){
			EventHandler.addEvent(node,"click",
			function(){
				grid.m_onSelect.call(null,keys,descrs,extraFields);
			}
			,true);				
		}				
	}
	
	if (this.m_foot && this.m_foot.calcBegin){	
		//this.m_foot.removeDOM();
		this.m_foot.calcBegin();
	}
	var row;
	while (model.getNextRow()){
		var row_id = this.getId()+"_row_"+row_count;
		var row_class = (row_count%2==0)? "even":"odd";
		if (this.m_onSelect){
			row_class+=" for_select";
		}
		
		if (this.onGetDataSetRowClass){
			row_class = this.onGetDataSetRowClass(model,row_class);
		}
		var r_class = this.getGridRowClass();
		row = new r_class(row_id,{"className":row_class});
		
		row.m_grid = this;//added 29/08/19
		
		var keyValues={};
		var descrValues={};
		var extraValues={};
		field_count = 0;
		for (var head_id in head_cells){
			field_val = "";
			bind = head_cells[head_id].getReadBind();
			
			attrs = {};
			
			if (!head_cells[head_id].getDbValue && !bind){
				continue;
			}
			else if (head_cells[head_id].getDbValue){
				field_val = head_cells[head_id].getDbValue(model,attrs);
			}
			else{
			
				keys = bind.keyFieldIds;
				if (head_cells[head_id].getKeyCol()){
					keyValues[bind.valueFieldId] = model.getFieldValue(bind.valueFieldId);
				}
				if (head_cells[head_id].getDescrCol()){
					descrValues[bind.valueFieldId] = model.getFieldValue(bind.valueFieldId);
				}
				if (this.m_extraFields){
					for (var i=0;i<this.m_extraFields.length;i++){
						extraValues[this.m_extraFields[i]] = model.getFieldValue(this.m_extraFields[i]);
						/*
						if (this.m_extraFields[i]==bind.valueFieldId){
							extraValues[bind.valueFieldId] = model.getFieldValue(bind.valueFieldId);
							break;
						}
						*/
					}
				}

				var ar_ind = null;
				if (bind.arrayIndex!=undefined){
					ar_ind = bind.arrayIndex;
				}
				field_val = model.getFieldById(bind.valueFieldId).getValue(ar_ind);				
							
				if (keys){					
					for (var key_ind=0;key_ind<keys.length;key_ind++){
						attrs["fkey_"+keys[key_ind]] =
							model.getFieldById(keys[key_ind]).getValue();
					}				
				}
			}
			
			if (head_cells[head_id].m_fieldValueToRowClass && bind){
				row_class+=(row_class=="")? "":" ";
				row_class+=model.getFieldValue(bind.valueFieldId);
				row.setClassName(row_class);
			}
						
			var common_attrs = head_cells[head_id].getColAttrs();
			if (common_attrs){
				for (common_attr_id in common_attrs){
					attrs[common_attr_id]=common_attrs[common_attr_id];
				}
			}
			var cell_opts = {
				"value":field_val,
				"attrs":attrs,
				"accocImageArray":head_cells[head_id].getAssocImageArray()
			};
				
			if (field_val){
				var common_cont = head_cells[head_id].getColControlContainer();
				if (common_cont){				
					common_cont.objectOptions.value = field_val;
					cell_opts.value = null;
					cell_opts.controlContainer = 
						new common_cont.objectClass(uuid(),common_cont.objectOptions);
				}
			}
			
			var cell = new GridCell(null,cell_opts);
			row.setElementById(field_count,cell);
				
			field_count++;
		}
		
		row.setAttr("key_values",array2json(keyValues));
		
		//system cell
		var row_cmd_class = this.getRowCommandPanelClass();
		if (row_cmd_class){
			var row_class_options = 
			{"onClickEdit":this.onEdit,
				"onClickCopy":this.onCopy,
				"onClickDelete":this.onDelete,
				"rowId":row_id,
				"keys":keyValues,
				"clickContext":this,
				"connect":this.getController().getServConnector(),
				"context":this};
			if (this.m_rowCommandPanelClassParams){
				for (var par_id in this.m_rowCommandPanelClassParams){
					row_class_options[par_id]=
					this.m_rowCommandPanelClassParams[par_id];
				}
			}
			row.setElementById("sys",new row_cmd_class(null,
					row_class_options)
				);
		}
		/*
		if (this.onAddRow){
			this.onAddRow(row,model);
		}
		*/
		body.setElementById("row_"+row_count,row);
		row_count++;
		
		if (this.m_onSelect){
			this.m_selects[row_id] =
				new set_select(this,row.m_node,
					keyValues,
					descrValues,
					extraValues
				);
		}
		
		//foot
		if (this.m_foot&&this.m_foot.calc){	
			this.m_foot.calc(model);
		}
	}
	if (this.m_lastRowFooter&&row){
		DOMHandler.addClass(row.m_node,"grid_foot");
	}
	
	if (this.m_foot&&this.m_foot.calcEnd){	
		this.m_foot.calcEnd();
	}
	
	body.toDOM(this.m_node);
	/*
	if (this.m_foot){
		this.m_foot.toDOM(body.m_node);
	}
	*/
	
	//if (pag){
		//pag.removeDOM();
		//pag.toDOMAfter(this.m_node);
	//}
	
	GridDb.superclass.onRefresh.call(this,resp);	
}
GridDb.prototype.getGridRowClass = function(){
	return GridRow;
}

